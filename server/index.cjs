const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const config = require('./config.cjs');

const app = express();
const PORT = config.port;
const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = config.jwtExpiration;
const DB_PATH = config.dbPath;
const UPLOAD_DEST = config.upload.dest;
const UPLOAD_MAX_SIZE = config.upload.maxSize;
const UPLOAD_ALLOWED_TYPES = config.upload.allowedTypes;
const CORS_ORIGINS = config.cors.origins;
const DEFAULT_ADMIN_USERNAME = config.admin.username;
const DEFAULT_ADMIN_PASSWORD = config.admin.password;
const PAGINATION_DEFAULT_LIMIT = config.pagination.defaultLimit;
const PAGINATION_MAX_LIMIT = config.pagination.maxLimit;
const NOVAERA_BASE_URL = 'https://api.novaera-pagamentos.com/api/v1';

// Middleware
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Configuração do banco de dados SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite');
    createTables();
  }
});

// Criar tabelas se não existirem
function createTables() {
  // Tabela de usuários admin
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de leads
  db.run(`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    nome_produto TEXT NOT NULL,
    valor REAL DEFAULT 0,
    telefone TEXT,
    endereco TEXT,
    cpf_cnpj TEXT,
    email TEXT,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migrar coluna 'valor' se banco antigo não tiver
  db.all(`PRAGMA table_info(leads)`, (err, rows) => {
    if (!err && Array.isArray(rows)) {
      const hasValor = rows.some(r => String(r.name).toLowerCase() === 'valor');
      if (!hasValor) {
        db.run(`ALTER TABLE leads ADD COLUMN valor REAL DEFAULT 0`);
      }
    }
  });

  // Tabela de pagamentos PIX
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_code TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    pix_code TEXT,
    order_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME,
    FOREIGN KEY (tracking_code) REFERENCES leads (tracking)
  )`);

  // Evitar pagamentos pendentes duplicados para o mesmo tracking e tipo
  db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_payment
          ON payments(tracking_code, payment_type)
          WHERE status = 'pending'`);

  // Tabela de pedidos (orders)
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_code TEXT NOT NULL,
    customer_name TEXT,
    product_name TEXT,
    amount REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tracking_code) REFERENCES leads (tracking)
  )`);

  // Tabela de configurações (key-value)
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Inserir usuário admin padrão se não existir
  db.get("SELECT * FROM users WHERE username = ?", [DEFAULT_ADMIN_USERNAME], (err, row) => {
    if (!row) {
      bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10, (err, hash) => {
        if (!err) {
          db.run("INSERT INTO users (username, password) VALUES (?, ?)", [DEFAULT_ADMIN_USERNAME, hash]);
          console.log(`Usuário admin criado: ${DEFAULT_ADMIN_USERNAME}/${DEFAULT_ADMIN_PASSWORD}`);
        }
      });
    }
  });
}

// Middleware de autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso necessário' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Configuração do Multer para upload de arquivos
const upload = multer({ 
  dest: UPLOAD_DEST,
  limits: {
    fileSize: UPLOAD_MAX_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (UPLOAD_ALLOWED_TYPES.includes(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos'), false);
    }
  }
});

// Middleware para tratar erros do Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Arquivo muito grande. Tamanho máximo permitido: 10MB' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Muitos arquivos enviados. Apenas um arquivo por vez é permitido.' 
      });
    }
    return res.status(400).json({ 
      error: `Erro no upload: ${error.message}` 
    });
  }
  next(error);
});

// Rota de login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { id: user.id, username: user.username } });
  });
});

// Rota para importar CSV
app.post('/api/import-csv', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const results = [];
  const errors = [];
  let successCount = 0;
  let duplicateCount = 0;

  const parser = csv({
    mapHeaders: ({ header }) => {
      if (!header) return header;
      return String(header)
        .replace(/\uFEFF/g, '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Za-z0-9]+/g, '')
        .toLowerCase();
    }
  });

  fs.createReadStream(req.file.path)
    .pipe(parser)
    .on('data', (data) => {
      // Validar dados obrigatórios
      // Após normalização, os campos esperados são: nome, produto, valor, telefone, endereco, cpfcnpj, email, data
      const csvNome = (data.nome || '').toString().trim();
      const csvProduto = (data.produto || data.nomeproduto || '').toString().trim();
      const csvValor = (data.valor || data.price || data.preco || '').toString().trim();
      const csvTelefone = (data.telefone || '').toString().trim();
      const csvEndereco = (data.endereco || '').toString().trim();
      const csvCpfCnpj = (data.cpfcnpj || data.cpf || data.cnpj || '').toString().trim();
      const csvEmail = (data.email || '').toString().trim();
      const csvData = (data.data || data.date || '').toString().trim();

      // Novo formato: rastreio = CPF/CNPJ (somente dígitos)
      const cpfDigits = (String(csvCpfCnpj || '')).replace(/\D/g, '');
      const computedTracking = cpfDigits; // usar cpf/cnpj como tracking

      if (!csvCpfCnpj || !csvNome || !csvProduto) {
        errors.push({ row: data, error: 'Campos obrigatórios faltando' });
        return;
      }

      // Verificar se já existe um lead com este tracking
      db.get("SELECT tracking FROM leads WHERE tracking = ?", [computedTracking], (err, existing) => {
        if (existing) {
          duplicateCount++;
          errors.push({ row: data, error: 'Tracking já existe' });
        } else {
          // Inserir novo lead
          db.run(`
            INSERT INTO leads (tracking, nome, nome_produto, valor, telefone, endereco, cpf_cnpj, email, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            computedTracking,
            csvNome,
            csvProduto,
            parseFloat(String(csvValor).toString().replace(',', '.')) || 0,
            csvTelefone || '',
            csvEndereco || '',
            csvCpfCnpj || '',
            csvEmail || '',
            csvData || ''
          ], function(err) {
            if (err) {
              errors.push({ row: data, error: err.message });
            } else {
              successCount++;
            }
          });
        }
      });

      results.push(data);
    })
    .on('end', () => {
      // Limpar arquivo temporário
      fs.unlinkSync(req.file.path);
      
      res.json({
        message: 'Importação concluída',
        total: results.length,
        success: successCount,
        duplicates: duplicateCount,
        errors: errors
      });
    })
    .on('error', (error) => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ error: 'Erro ao processar arquivo CSV' });
    });
});

// Rota para listar leads com paginação e busca
app.get('/api/leads', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT);
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  let query = "SELECT * FROM leads";
  let countQuery = "SELECT COUNT(*) as total FROM leads";
  let params = [];

  if (search) {
    query += " WHERE tracking LIKE ? OR nome LIKE ? OR nome_produto LIKE ? OR email LIKE ?";
    countQuery += " WHERE tracking LIKE ? OR nome LIKE ? OR nome_produto LIKE ? OR email LIKE ?";
    const searchParam = `%${search}%`;
    params = [searchParam, searchParam, searchParam, searchParam];
  }

  query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  // Buscar total de registros
  db.get(countQuery, params.slice(0, -2), (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao contar registros' });
    }

    const total = countResult.total;

    // Buscar leads
    db.all(query, params, (err, leads) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar leads' });
      }

      res.json({
        leads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    });
  });
});

// Rota para buscar lead por tracking (API pública)
app.get('/api/tracking/:code', (req, res) => {
  const trackingCode = req.params.code;

  if (!trackingCode) {
    return res.status(400).json({ error: 'Código de rastreio é obrigatório' });
  }

  db.get("SELECT * FROM leads WHERE tracking = ?", [trackingCode], (err, lead) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!lead) {
      return res.status(404).json({ error: 'Código de rastreio não encontrado' });
    }

    res.json(lead);
  });
});

// Rota para editar lead
app.put('/api/leads/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { nome, nome_produto, telefone, endereco, cpf_cnpj, email, data } = req.body;

  if (!nome || !nome_produto) {
    return res.status(400).json({ error: 'Nome e nome do produto são obrigatórios' });
  }

  db.run(`
    UPDATE leads 
    SET nome = ?, nome_produto = ?, telefone = ?, endereco = ?, cpf_cnpj = ?, email = ?, data = ?
    WHERE id = ?
  `, [nome, nome_produto, telefone, endereco, cpf_cnpj, email, data, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar lead' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    res.json({ message: 'Lead atualizado com sucesso' });
  });
});

// Rota para excluir lead
app.delete('/api/leads/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM leads WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir lead' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    res.json({ message: 'Lead excluído com sucesso' });
  });
});

// Rota para excluir TODOS os leads (admin)
app.delete('/api/leads', authenticateToken, (req, res) => {
  db.run("DELETE FROM leads", function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir todos os leads' });
    }
    res.json({ message: 'Todos os leads foram excluídos', deleted: this.changes });
  });
});

// Rota para listar pagamentos PIX (admin)
app.get('/api/payments', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  // Buscar total de pagamentos
  db.get("SELECT COUNT(*) as total FROM payments", (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao contar pagamentos' });
    }

    const total = countResult.total;

    // Buscar pagamentos com informações do lead
    const query = `
      SELECT 
        p.*,
        l.nome as lead_nome,
        l.nome_produto as lead_produto
      FROM payments p
      LEFT JOIN leads l ON p.tracking_code = l.tracking
      ORDER BY p.created_at DESC 
      LIMIT ? OFFSET ?
    `;

    db.all(query, [limit, offset], (err, payments) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar pagamentos' });
      }

      res.json({
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    });
  });
});

// (Removido) Rota pública para obter um pagamento por ID

// Proxy: consultar status de transação NovaEra por ID
app.get('/api/providers/novaera/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    getSetting('novaera.sk', (e1, sk) => {
      if (e1 || !sk) return res.status(500).json({ error: 'Configuração SK ausente' });
      getSetting('novaera.pk', (e2, pk) => {
        if (e2 || !pk) return res.status(500).json({ error: 'Configuração PK ausente' });
        const basicToken = Buffer.from(`${sk}:${pk}`).toString('base64');
        const url = `${NOVAERA_BASE_URL}/transactions/${encodeURIComponent(id)}`;
        fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${basicToken}`,
            'Accept': 'application/json'
          }
        })
          .then(async (r) => {
            const text = await r.text();
            if (!r.ok) {
              throw new Error(`NovaEra GET ${r.status}: ${text}`);
            }
            try {
              const json = JSON.parse(text);
              return res.json(json);
            } catch {
              return res.status(502).json({ error: 'Resposta inválida da NovaEra' });
            }
          })
          .catch((e) => {
            return res.status(502).json({ error: e.message });
          });
      });
    });
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao consultar transação NovaEra' });
  }
});

// Rota para obter estatísticas de pagamentos PIX
app.get('/api/stats', authenticateToken, (req, res) => {
  // Contar total de pagamentos PIX gerados
  db.get("SELECT COUNT(*) as totalOrders FROM payments", (err, paymentsResult) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }

    // Contar total de pagamentos PIX confirmados
    db.get("SELECT COUNT(*) as totalPaidOrders FROM payments WHERE status = 'paid'", (err, paidResult) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
      }

      // Contar total de pagamentos PIX pendentes
      db.get("SELECT COUNT(*) as totalPendingOrders FROM payments WHERE status = 'pending'", (err, pendingResult) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        }

        res.json({
          totalOrders: paymentsResult.totalOrders,
          totalPaidOrders: paidResult.totalPaidOrders,
          totalPendingOrders: pendingResult.totalPendingOrders
        });
      });
    });
  });
});

// Utilitários de Settings
function getSetting(key, callback) {
  db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
    if (err) return callback(err);
    callback(null, row ? row.value : null);
  });
}

function setSetting(key, value, callback) {
  db.run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
    [key, value],
    function (err) {
      callback(err);
    }
  );
}

// Rotas de Settings (admin)
app.get('/api/settings', authenticateToken, (req, res) => {
  db.all('SELECT key, value FROM settings', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao carregar configurações' });
    }
    const settings = {};
    for (const row of rows) settings[row.key] = row.value;
    if (settings['novaera.sk']) settings['novaera.sk'] = '***' + String(settings['novaera.sk']).slice(-4);
    if (settings['novaera.pk']) settings['novaera.pk'] = '***' + String(settings['novaera.pk']).slice(-4);
    settings['novaera.baseUrl'] = NOVAERA_BASE_URL;
    res.json(settings);
  });
});

app.post('/api/settings', authenticateToken, (req, res) => {
  const { novaeraSk, novaeraPk, novaeraPostbackUrl } = req.body || {};

  const ops = [];
  if (novaeraSk !== undefined) ops.push(['novaera.sk', String(novaeraSk)]);
  if (novaeraPk !== undefined) ops.push(['novaera.pk', String(novaeraPk)]);
  if (novaeraPostbackUrl !== undefined) ops.push(['novaera.postbackUrl', String(novaeraPostbackUrl)]);

  if (ops.length === 0) {
    return res.status(400).json({ error: 'Nenhuma configuração para atualizar' });
  }

  let pending = ops.length;
  let failed = false;
  ops.forEach(([key, value]) => {
    setSetting(key, value, (err) => {
      if (failed) return;
      if (err) {
        failed = true;
        return res.status(500).json({ error: `Erro ao salvar configuração: ${key}` });
      }
      pending -= 1;
      if (pending === 0) {
        res.json({ message: 'Configurações atualizadas com sucesso' });
      }
    });
  });
});

// Compatibilidade: aceitar também PUT /api/settings com a mesma lógica
app.put('/api/settings', authenticateToken, (req, res) => {
  const { novaeraSk, novaeraPk, novaeraPostbackUrl } = req.body || {};

  const ops = [];
  if (novaeraSk !== undefined) ops.push(['novaera.sk', String(novaeraSk)]);
  if (novaeraPk !== undefined) ops.push(['novaera.pk', String(novaeraPk)]);
  if (novaeraPostbackUrl !== undefined) ops.push(['novaera.postbackUrl', String(novaeraPostbackUrl)]);

  if (ops.length === 0) {
    return res.status(400).json({ error: 'Nenhuma configuração para atualizar' });
  }

  let pending = ops.length;
  let failed = false;
  ops.forEach(([key, value]) => {
    setSetting(key, value, (err) => {
      if (failed) return;
      if (err) {
        failed = true;
        return res.status(500).json({ error: `Erro ao salvar configuração: ${key}` });
      }
      pending -= 1;
      if (pending === 0) {
        res.json({ message: 'Configurações atualizadas com sucesso' });
      }
    });
  });
});

// Rotas de Orders (pedidos)
// Listar pedidos com paginação e busca
app.get('/api/orders', authenticateToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  let where = '';
  let params = [];
  if (search) {
    where = 'WHERE tracking_code LIKE ? OR customer_name LIKE ? OR product_name LIKE ? OR status LIKE ?';
    const like = `%${search}%`;
    params = [like, like, like, like];
  }

  const countQuery = `SELECT COUNT(*) as total FROM orders ${where}`;
  const listQuery = `
    SELECT * FROM orders
    ${where}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.get(countQuery, params, (err, countRow) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao contar pedidos' });
    }
    const total = countRow.total;
    db.all(listQuery, [...params, limit, offset], (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar pedidos' });
      }
      res.json({
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    });
  });
});

// Obter um pedido por ID
app.get('/api/orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar pedido' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json(order);
  });
});

// Criar um novo pedido
app.post('/api/orders', authenticateToken, (req, res) => {
  const { tracking_code, customer_name, product_name, amount, status } = req.body;

  if (!tracking_code) {
    return res.status(400).json({ error: 'tracking_code é obrigatório' });
  }

  const safeAmount = isNaN(parseFloat(amount)) ? 0 : parseFloat(amount);
  const safeStatus = (status && String(status).trim()) || 'pending';

  // Opcional: validar existência do lead vinculado
  db.get('SELECT tracking FROM leads WHERE tracking = ?', [tracking_code], (err, lead) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao validar lead' });
    }
    if (!lead) {
      // Permitimos criar mesmo sem lead, mas você pode retornar erro se preferir
      // return res.status(400).json({ error: 'Lead não encontrado para o tracking_code informado' });
    }

    db.run(`
      INSERT INTO orders (tracking_code, customer_name, product_name, amount, status)
      VALUES (?, ?, ?, ?, ?)
    `, [tracking_code, customer_name || '', product_name || '', safeAmount, safeStatus], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao criar pedido' });
      }
      db.get('SELECT * FROM orders WHERE id = ?', [this.lastID], (err, created) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao carregar pedido criado' });
        }
        res.status(201).json(created);
      });
    });
  });
});

// Atualizar um pedido
app.put('/api/orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { tracking_code, customer_name, product_name, amount, status } = req.body;

  const fields = [];
  const values = [];
  if (tracking_code !== undefined) { fields.push('tracking_code = ?'); values.push(tracking_code); }
  if (customer_name !== undefined) { fields.push('customer_name = ?'); values.push(customer_name); }
  if (product_name !== undefined) { fields.push('product_name = ?'); values.push(product_name); }
  if (amount !== undefined) { fields.push('amount = ?'); values.push(isNaN(parseFloat(amount)) ? 0 : parseFloat(amount)); }
  if (status !== undefined) { fields.push('status = ?'); values.push(String(status)); }
  fields.push('updated_at = CURRENT_TIMESTAMP');

  if (fields.length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar' });
  }

  const sql = `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`;
  db.run(sql, [...values, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao carregar pedido atualizado' });
      }
      res.json(order);
    });
  });
});

// Excluir um pedido
app.delete('/api/orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir pedido' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json({ message: 'Pedido excluído com sucesso' });
  });
});

// Excluir TODOS os pedidos (admin)
app.delete('/api/orders', authenticateToken, (req, res) => {
  db.run('DELETE FROM orders', function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir todos os pedidos' });
    }
    res.json({ message: 'Todos os pedidos foram excluídos', deleted: this.changes });
  });
});

// Excluir TODOS os pagamentos (admin)
app.delete('/api/payments', authenticateToken, (req, res) => {
  db.run('DELETE FROM payments', function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir todos os pagamentos' });
    }
    res.json({ message: 'Todos os pagamentos foram excluídos', deleted: this.changes });
  });
});

// Rota para registrar pagamento PIX
app.post('/api/payments', (req, res) => {
  const { tracking_code, amount, payment_type, order_id } = req.body || {};

  if (!tracking_code || amount === undefined || !payment_type) {
    return res.status(400).json({ error: 'tracking_code, amount e payment_type são obrigatórios' });
  }

  // Integração com NovaEra quando possível
  getSetting('novaera.sk', (e1, sk) => {
    if (e1) return res.status(500).json({ error: 'Erro ao ler SK' });
    getSetting('novaera.pk', (e2, pk) => {
      if (e2) return res.status(500).json({ error: 'Erro ao ler PK' });
      getSetting('novaera.postbackUrl', (err3, postbackUrl) => {
        if (err3) return res.status(500).json({ error: 'Erro ao ler configurações (postbackUrl)' });

        const basicToken = (sk && pk) ? Buffer.from(`${sk}:${pk}`).toString('base64') : null;
        const shouldUseNovaEra = Boolean(basicToken);
        const amountNumber = Number(amount) || 0;
        const amountInCents = Math.round(amountNumber * 100);

        const proceedInsert = (pix_code_value, external_id_value, secure_url_value) => {
          db.run(`
            INSERT INTO payments (tracking_code, amount, payment_type, status, pix_code, order_id)
            VALUES (?, ?, ?, 'pending', ?, ?)
          `, [tracking_code, amountNumber, payment_type, pix_code_value || null, external_id_value || order_id || null], function (insertErr) {
            if (insertErr) {
              const msg = String(insertErr && insertErr.message || '');
              if (msg.includes('UNIQUE')) {
                // Já existe um pagamento pendente igual — reutilizar
                return db.get(
                  `SELECT id, pix_code, order_id FROM payments
                   WHERE tracking_code = ? AND payment_type = ? AND status = 'pending'
                   ORDER BY id DESC LIMIT 1`,
                  [tracking_code, payment_type],
                  (selErr, row) => {
                    if (selErr || !row) {
                      return res.status(409).json({ error: 'Pagamento duplicado' });
                    }
                    return res.json({
                      message: 'Pagamento já existente (reutilizado)',
                      payment_id: row.id,
                      pix_code: row.pix_code || null,
                      provider_order_id: row.order_id || null
                    });
                  }
                );
              }
              return res.status(500).json({ error: 'Erro ao registrar pagamento' });
            }
            return res.json({
              message: 'Pagamento registrado com sucesso',
              payment_id: this.lastID,
              pix_code: pix_code_value || null,
              provider_order_id: external_id_value || null,
              secure_url: secure_url_value || null
            });
          });
        };

        if (!shouldUseNovaEra) {
          return res.status(400).json({ error: 'NovaEra não configurada. Defina SK e PK em /api/settings.' });
        }

        // Buscar dados do lead para preencher o customer
        db.get('SELECT nome, email, telefone, cpf_cnpj FROM leads WHERE tracking = ?', [tracking_code], (leadErr, leadRow) => {
          if (leadErr) {
            return res.status(500).json({ error: 'Erro ao buscar dados do lead' });
          }

          const customerName = (leadRow && leadRow.nome) || 'Cliente';
          const customerEmail = (leadRow && leadRow.email) || 'cliente@example.com';
          const phoneDigits = String((leadRow && leadRow.telefone) || '')
            .replace(/\D/g, '') || '00000000000';
          const docDigits = String((leadRow && leadRow.cpf_cnpj) || '')
            .replace(/\D/g, '') || '00000000000';
          const docType = docDigits.length === 14 ? 'cnpj' : 'cpf';

          // Montar payload NovaEra com dados do lead
          const payload = {
            paymentMethod: 'pix',
            ip: (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString(),
            pix: { expiresInDays: 1 },
            items: [
              {
                title: 'Pagamento TrackWise',
                quantity: 1,
                tangible: false,
                unitPrice: amountInCents,
                product_image: 'https://seusite.com.br/imagens/produto.png'
              }
            ],
            amount: amountInCents,
            customer: {
              name: customerName,
              email: customerEmail,
              phone: phoneDigits,
              document: { type: docType, number: docDigits }
            },
            metadata: JSON.stringify({ provider: 'TrackWise', tracking_code }),
            traceable: false,
            externalRef: order_id || `tw_${tracking_code}_${Date.now()}`,
            postbackUrl: postbackUrl || `http://localhost:${PORT}/api/webhooks/novaera`
          };

          const url = `${NOVAERA_BASE_URL}/transactions/`;
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicToken}`
          };

          fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
          })
            .then(async (r) => {
              if (!r.ok) {
                const txt = await r.text().catch(() => '');
                throw new Error(`NovaEra erro ${r.status}: ${txt}`);
              }
              return r.json();
            })
            .then((resp) => {
              const data = resp && resp.data ? resp.data : {};
              const qrcode = data.pix && data.pix.qrcode ? data.pix.qrcode : null;
              const providerId = (data && (data.id || data.secureId || data.externalId)) || null;
              const secureUrl = data && data.secureUrl ? data.secureUrl : null;
              proceedInsert(qrcode, providerId, secureUrl);
            })
            .catch((errCall) => {
              console.error('Erro na criação de transação NovaEra:', errCall.message);
              return res.status(502).json({ error: 'Falha ao criar transação na NovaEra', details: errCall.message });
            });
        });
      });
    });
  });
});

// Rota para confirmar pagamento PIX
app.put('/api/payments/:id/confirm', (req, res) => {
  const { id } = req.params;

  db.run(`
    UPDATE payments 
    SET status = 'paid', paid_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao confirmar pagamento' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json({ message: 'Pagamento confirmado com sucesso' });
  });
});

// Webhook de atualização de status da NovaEra
app.post('/api/webhooks/novaera', (req, res) => {
  try {
    const body = req.body || {};
    const providerId = body && body.data && (body.data.id || body.data.secureId || body.data.externalId);
    const status = body && body.data && body.data.status;

    if (!providerId || !status) {
      return res.status(400).json({ error: 'Payload inválido' });
    }

    const normalized = String(status).toLowerCase();
    const internalStatus = normalized === 'paid' || normalized === 'approved' ? 'paid'
      : normalized === 'pending' ? 'pending'
      : normalized === 'refused' || normalized === 'canceled' ? 'refused'
      : normalized;

    const sql = `UPDATE payments SET status = ?, paid_at = CASE WHEN ? = 'paid' THEN CURRENT_TIMESTAMP ELSE paid_at END WHERE order_id = ?`;
    db.run(sql, [internalStatus, internalStatus, String(providerId)], function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar pagamento' });
      }
      if (this.changes === 0) {
        db.run(`UPDATE payments SET status = ?, paid_at = CASE WHEN ? = 'paid' THEN CURRENT_TIMESTAMP ELSE paid_at END WHERE pix_code = ?`, [internalStatus, internalStatus, String(providerId)], function (err2) {
          if (err2) {
            return res.status(500).json({ error: 'Erro ao atualizar pagamento (fallback)' });
          }
          return res.json({ message: 'Webhook processado', updated: this.changes });
        });
      } else {
        return res.json({ message: 'Webhook processado', updated: this.changes });
      }
    });
  } catch (e) {
    return res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Painel admin: http://localhost:${PORT}/admin`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`💾 Banco de dados: ${DB_PATH}`);
  console.log(`🔐 Usuário admin: ${DEFAULT_ADMIN_USERNAME}/${DEFAULT_ADMIN_PASSWORD}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  db.close((err) => {
    if (err) {
      console.error('❌ Erro ao fechar banco de dados:', err);
    } else {
      console.log('✅ Banco de dados fechado');
    }
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  db.close((err) => {
    if (err) {
      console.error('❌ Erro ao fechar banco de dados:', err);
    } else {
      console.log('✅ Banco de dados fechado');
    }
    process.exit(0);
  });
});
