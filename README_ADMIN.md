# Painel Administrativo TrackWise

Sistema completo para gerenciamento de leads de rastreio com painel administrativo web.

## 🚀 Funcionalidades

### Painel Administrativo
- **Login seguro** com autenticação JWT
- **Dashboard** com estatísticas em tempo real
- **Importação de CSV** com validação e tratamento de duplicatas
- **Gerenciamento de leads** com busca, edição e exclusão
- **Estatísticas avançadas** com gráficos e análises
- **Interface responsiva** para desktop e mobile

### API de Rastreio
- **Endpoint público** para consulta de rastreio
- **Validação automática** de códigos
- **Resposta em JSON** com dados completos do lead

## 🛠️ Tecnologias

- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite
- **Frontend**: React + TypeScript + Tailwind CSS
- **Autenticação**: JWT + bcrypt
- **Upload**: Multer para arquivos CSV
- **Gráficos**: Recharts

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn

## ⚡ Instalação e Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar o Servidor
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev

# Ou ambos simultaneamente
npm run dev:full
```

### 3. Acessar o Sistema
- **Sistema Completo**: http://localhost:8080
- **Painel Admin**: http://localhost:8080/admin/login
- **API**: http://localhost:8080/api

## 🔐 Credenciais Padrão

- **Usuário**: `admin`
- **Senha**: `admin123`

⚠️ **Importante**: Altere essas credenciais em produção!

## 📊 Formato do CSV

O sistema aceita arquivos CSV com as seguintes colunas:

```csv
Tracking,Nome,Nome do produto,Telefone,Endereço,CPF/CNPJ,E-mail,Data
ABC123,João Silva,Smartphone Samsung,11999999999,Rua A 123,12345678901,joao@email.com,2024-01-15
```

### Campos Obrigatórios
- `Tracking`: Código único de rastreio
- `Nome`: Nome do cliente
- `Nome do produto`: Nome do produto

### Campos Opcionais
- `Telefone`: Número de telefone
- `Endereço`: Endereço completo
- `CPF/CNPJ`: Documento do cliente
- `E-mail`: Endereço de e-mail
- `Data`: Data de referência

## 🔌 Endpoints da API

### Autenticação
- `POST /api/login` - Login do administrador

### Leads (Protegido)
- `GET /api/leads` - Listar leads com paginação e busca
- `PUT /api/leads/:id` - Editar lead
- `DELETE /api/leads/:id` - Excluir lead
- `POST /api/import-csv` - Importar arquivo CSV
- `GET /api/stats` - Estatísticas do sistema

### Rastreio (Público)
- `GET /api/tracking/:code` - Buscar lead por código de rastreio

## 📱 Uso do Sistema

### 1. Login Administrativo
- Acesse `/admin/login`
- Use as credenciais padrão
- O sistema redirecionará para o dashboard

### 2. Importar CSV
- Vá para "Importar CSV" no menu lateral
- Arraste e solte um arquivo CSV ou clique para selecionar
- Clique em "Importar CSV"
- Visualize o resultado da importação

### 3. Gerenciar Leads
- Acesse "Gerenciar Leads" no menu
- Use a busca para filtrar leads
- Clique nos ícones para visualizar, editar ou excluir
- Navegue pelas páginas usando a paginação

### 4. Visualizar Estatísticas
- Acesse "Estatísticas" no menu
- Escolha o período de análise (7, 30 ou 90 dias)
- Visualize gráficos e métricas
- Exporte os dados se necessário

### 5. Consulta de Rastreio
- Use o endpoint público `/api/tracking/:code`
- Substitua `:code` pelo código de rastreio
- Retorna dados do lead ou mensagem de erro

## 🗄️ Estrutura do Banco

### Tabela `users`
- `id`: ID único do usuário
- `username`: Nome de usuário
- `password`: Hash da senha
- `created_at`: Data de criação

### Tabela `leads`
- `id`: ID único do lead
- `tracking`: Código de rastreio (único)
- `nome`: Nome do cliente
- `nome_produto`: Nome do produto
- `telefone`: Telefone (opcional)
- `endereco`: Endereço (opcional)
- `cpf_cnpj`: CPF/CNPJ (opcional)
- `email`: E-mail (opcional)
- `data`: Data de referência (opcional)
- `created_at`: Data de criação automática

## 🔒 Segurança

- **Autenticação JWT** para rotas administrativas
- **Hash de senhas** com bcrypt
- **Validação de arquivos** (apenas CSV)
- **Sanitização de dados** de entrada
- **Proteção contra duplicatas** no campo Tracking

## 🚨 Tratamento de Erros

- **Validação de campos** obrigatórios
- **Verificação de duplicatas** durante importação
- **Mensagens de erro** claras e informativas
- **Logs de erro** no console do servidor

## 📁 Estrutura de Arquivos

```
src/
├── components/
│   ├── AdminLayout.tsx      # Layout do painel admin
│   └── ui/                  # Componentes UI reutilizáveis
├── hooks/
│   └── useAuth.tsx          # Hook de autenticação
├── pages/
│   ├── AdminLogin.tsx       # Página de login
│   ├── AdminDashboard.tsx   # Dashboard principal
│   ├── AdminImport.tsx      # Importação de CSV
│   ├── AdminLeads.tsx       # Gerenciamento de leads
│   └── AdminStats.tsx       # Estatísticas
└── App.tsx                  # Rotas da aplicação

server/
└── index.js                 # Servidor Express + API

exemplo_leads.csv            # Arquivo CSV de exemplo
```

## 🧪 Testando o Sistema

### 1. Importar Dados de Exemplo
- Use o arquivo `exemplo_leads.csv` fornecido
- Importe via painel administrativo
- Verifique se os leads foram criados

### 2. Testar API de Rastreio
```bash
curl http://localhost:8080/api/tracking/ABC123
```

### 3. Testar Autenticação
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🚀 Deploy em Produção

### Variáveis de Ambiente
```bash
PORT=3001
JWT_SECRET=sua-chave-secreta-muito-segura
```

### Recomendações
- Use HTTPS em produção
- Configure um banco PostgreSQL ou MySQL
- Implemente rate limiting
- Configure logs estruturados
- Use um proxy reverso (nginx)
- Configure backup automático do banco

## 🐛 Solução de Problemas

### Erro de Conexão com Banco
- Verifique se o SQLite está funcionando
- Confirme permissões de escrita na pasta

### Erro de Upload
- Verifique se a pasta `uploads/` existe
- Confirme permissões de escrita

### Erro de Autenticação
- Limpe o localStorage do navegador
- Verifique se o token não expirou

### Performance
- Para grandes volumes, considere usar PostgreSQL
- Implemente cache Redis para consultas frequentes
- Otimize consultas SQL com índices

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Confirme a configuração do banco
3. Teste com o arquivo CSV de exemplo
4. Verifique a conectividade da API

## 📄 Licença

Este projeto é de uso livre para fins educacionais e comerciais.
