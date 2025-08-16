# Sistema de Pagamentos PIX - TrackWise

## 📋 Visão Geral

O sistema agora rastreia automaticamente todos os pagamentos PIX gerados quando usuários clicam em pagar as taxas de liberação ou frete express.

## 🗄️ Estrutura do Banco de Dados

### Tabela `payments`
```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracking_code TEXT NOT NULL,           -- Código de rastreio do lead
  amount REAL NOT NULL,                  -- Valor do pagamento
  payment_type TEXT NOT NULL,            -- Tipo: 'taxa_liberacao' ou 'frete_express'
  status TEXT DEFAULT 'pending',         -- Status: 'pending' ou 'paid'
  pix_code TEXT,                         -- Código PIX único gerado
  order_id TEXT,                         -- ID do pedido
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Data de criação
  paid_at DATETIME                       -- Data de confirmação (quando pago)
);
```

## 🔄 Fluxo de Funcionamento

### 1. Usuário Clica em Pagar
- **Taxa de Liberação**: R$ 67,40 (TrackingResult.tsx)
- **Frete Express**: R$ 15,40 (PaymentConfirmation.tsx)

### 2. Sistema Registra Pagamento
- Chama API `POST /api/payments`
- Gera código PIX único
- Salva no banco com status `pending`

### 3. Modal PIX Abre
- Mostra QR Code e código copia/cola
- Timer de 24 horas
- Instruções de pagamento

### 4. Confirmação (Futuro)
- API da gateway confirma pagamento
- Sistema atualiza status para `paid`
- Contador de estatísticas é atualizado

## 📊 Estatísticas do Painel Admin

### Cards Atualizados:
1. **Total de Pagamentos PIX** - Todos os pagamentos solicitados (status: pending + paid)
2. **Pagamentos Confirmados** - Pagamentos confirmados (status: paid)
3. **Pagamentos Pendentes** - Pagamentos aguardando confirmação (status: pending)

### Nova Funcionalidade:
- **Lista de Pagamentos PIX**: Tabela completa mostrando todos os pagamentos com:
  - Código de rastreio
  - Nome do cliente
  - Produto
  - Tipo de pagamento (Taxa de Liberação ou Frete Express)
  - Valor
  - Status (Pago/Pendente)
  - Data de criação

## 🛠️ APIs Implementadas

### `POST /api/payments`
Registra novo pagamento PIX
```json
{
  "tracking_code": "US641400141BR",
  "amount": 67.40,
  "payment_type": "taxa_liberacao",
  "order_id": "US641400141BR"
}
```

### `PUT /api/payments/:id/confirm`
Confirma pagamento (para integração futura com gateway)
```json
{
  "message": "Pagamento confirmado com sucesso"
}
```

### `GET /api/payments` (Admin)
Lista todos os pagamentos PIX com paginação
```json
{
  "payments": [
    {
      "id": 1,
      "tracking_code": "US641400141BR",
      "amount": 67.40,
      "payment_type": "taxa_liberacao",
      "status": "pending",
      "created_at": "2025-08-14T21:47:08.179Z",
      "lead_nome": "João Silva",
      "lead_produto": "Smartphone"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### `GET /api/stats` (Admin)
Retorna estatísticas de pagamentos PIX
```json
{
  "totalOrders": 45,
  "totalPaidOrders": 32,
  "totalPendingOrders": 13
}
```

## 🧪 Como Testar

### 1. Iniciar Servidor
```bash
npm run server
```

### 2. Acessar Sistema
- Frontend: `http://localhost:8080`
- Admin: `http://localhost:8081/admin`

### 3. Simular Pagamentos
- Fazer busca de rastreio
- Clicar em "Efetuar pagamento da taxa de liberação"
- Verificar console: "Pagamento PIX registrado"
- Verificar painel admin: Contador aumenta

### 4. Verificar Banco
```bash
sqlite3 server/database.sqlite
.tables
SELECT * FROM payments;
```

## 🔮 Próximos Passos

### Integração com Gateway Real:
1. **Webhook de Confirmação**: Gateway chama `/api/payments/:id/confirm`
2. **Status em Tempo Real**: Atualizar contadores automaticamente
3. **Notificações**: Email/SMS quando pagamento confirmado
4. **Relatórios**: Histórico detalhado de pagamentos

### Melhorias:
1. **Validação**: Verificar se lead existe antes de registrar pagamento
2. **Duplicação**: Evitar pagamentos duplicados para mesmo tracking
3. **Auditoria**: Log de todas as ações de pagamento
4. **Segurança**: Rate limiting e validação de dados

## 📝 Notas Técnicas

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Banco**: SQLite com foreign key para leads
- **APIs**: RESTful com validação de dados
- **Status**: Sistema de estados para pagamentos
- **Timestamps**: Rastreamento completo de datas

## 🚨 Considerações

- Sistema atual é para **demonstração**
- **Não processa pagamentos reais**
- **Não integra com gateway de pagamento**
- **Dados são simulados** para desenvolvimento
- **Produção requer implementação completa** de segurança e validações
