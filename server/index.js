import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.port;
const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = config.jwtExpiration;
const DB_PATH = config.dbPath;
const UPLOAD_DEST = config.upload.dest;
const UPLOAD_MAX_SIZE = config.upload.maxSize;
const UPLOAD_ALLOWED_TYPES = config.upload.allowedTypes;
const CORS_ORIGIN = config.cors.origin;
const DEFAULT_ADMIN_USERNAME = config.admin.username;
const DEFAULT_ADMIN_PASSWORD = config.admin.password;
const PAGINATION_DEFAULT_LIMIT = config.pagination.defaultLimit;
const PAGINATION_MAX_LIMIT = config.pagination.maxLimit;

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
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
    telefone TEXT,
    endereco TEXT,
    cpf_cnpj TEXT,
    email TEXT,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

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

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      // Validar dados obrigatórios
      if (!data.Tracking || !data.Nome || !data['Nome do produto']) {
        errors.push({ row: data, error: 'Campos obrigatórios faltando' });
        return;
      }

      // Verificar se já existe um lead com este tracking
      db.get("SELECT tracking FROM leads WHERE tracking = ?", [data.Tracking], (err, existing) => {
        if (existing) {
          duplicateCount++;
          errors.push({ row: data, error: 'Tracking já existe' });
        } else {
          // Inserir novo lead
          db.run(`
            INSERT INTO leads (tracking, nome, nome_produto, telefone, endereco, cpf_cnpj, email, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            data.Tracking,
            data.Nome,
            data['Nome do produto'],
            data.Telefone || '',
            data.Endereço || '',
            data['CPF/CNPJ'] || '',
            data['E-mail'] || '',
            data.Data || ''
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

// Rota para registrar pagamento PIX
app.post('/api/payments', (req, res) => {
  const { tracking_code, amount, payment_type, order_id } = req.body;

  if (!tracking_code || !amount || !payment_type) {
    return res.status(400).json({ error: 'tracking_code, amount e payment_type são obrigatórios' });
  }

  // Gerar código PIX único (simulado)
  const pix_code = `PIX${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

  db.run(`
    INSERT INTO payments (tracking_code, amount, payment_type, status, pix_code, order_id)
    VALUES (?, ?, ?, 'pending', ?, ?)
  `, [tracking_code, amount, payment_type, pix_code, order_id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao registrar pagamento' });
    }

    res.json({ 
      message: 'Pagamento PIX registrado com sucesso',
      payment_id: this.lastID,
      pix_code: pix_code
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
