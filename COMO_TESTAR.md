# 🧪 Como Testar o Sistema TrackWise

## 🚀 Inicialização Rápida

### Opção 1: Script Automático (Windows)
```bash
# Clique duas vezes no arquivo:
start-admin.bat
```

### Opção 2: Comandos Manuais
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev

# Ou ambos simultaneamente
npm run dev:full
```

## 🔐 Acesso ao Sistema

### URLs de Acesso
- **Sistema Completo**: http://localhost:8080
- **Painel Admin**: http://localhost:8080/admin/login
- **API**: http://localhost:8080/api

### Credenciais de Teste
- **Usuário**: `admin`
- **Senha**: `admin123`

## 📊 Teste Completo do Sistema

### 1. ✅ Verificar Servidor
```bash
# Testar se o servidor está rodando
curl http://localhost:8080/api/health
```
**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "version": "1.0.0"
}
```

### 2. ✅ Testar Login
- Acesse: http://localhost:8080/admin/login
- Use as credenciais: `admin` / `admin123`
- Deve redirecionar para o dashboard

### 3. ✅ Testar Importação CSV
- Faça login no painel admin
- Vá para "Importar CSV"
- Use o arquivo `exemplo_leads.csv` fornecido
- Arraste e solte o arquivo
- Clique em "Importar CSV"
- Verifique o resultado da importação

### 4. ✅ Testar Gerenciamento de Leads
- Vá para "Gerenciar Leads"
- Verifique se os leads foram importados
- Teste a funcionalidade de busca
- Teste a edição de um lead
- Teste a visualização de detalhes

### 5. ✅ Testar Estatísticas
- Vá para "Estatísticas"
- Verifique se os gráficos carregam
- Teste diferentes períodos (7, 30, 90 dias)
- Verifique se as métricas estão corretas

### 6. ✅ Testar API de Rastreio
```bash
# Testar com código válido
curl http://localhost:8080/api/tracking/ABC123

# Testar com código inválido
curl http://localhost:8080/api/tracking/INVALIDO
```

**Resposta para código válido:**
```json
{
  "id": 1,
  "tracking": "ABC123",
  "nome": "João Silva",
  "nome_produto": "Smartphone Samsung Galaxy",
  "telefone": "11999999999",
  "endereco": "Rua das Flores 123 - São Paulo/SP",
  "cpf_cnpj": "12345678901",
  "email": "joao@email.com",
  "data": "2024-01-15",
  "created_at": "2024-01-15T10:00:00.000Z"
}
```

**Resposta para código inválido:**
```json
{
  "error": "Código de rastreio não encontrado"
}
```

## 🧪 Testes de Funcionalidades Específicas

### Teste de Upload CSV
- ✅ Arquivo CSV válido
- ✅ Arquivo com campos obrigatórios faltando
- ✅ Arquivo com tracking duplicado
- ✅ Arquivo muito grande (>10MB)
- ✅ Arquivo com formato incorreto

### Teste de Autenticação
- ✅ Login válido
- ✅ Login com usuário inexistente
- ✅ Login com senha incorreta
- ✅ Acesso a rotas protegidas sem token
- ✅ Acesso com token expirado

### Teste de CRUD de Leads
- ✅ Listagem com paginação
- ✅ Busca por texto
- ✅ Edição de lead
- ✅ Exclusão de lead
- ✅ Visualização de detalhes

### Teste de Estatísticas
- ✅ Carregamento de gráficos
- ✅ Filtros de período
- ✅ Cálculos corretos
- ✅ Exportação de dados

## 🐛 Solução de Problemas Comuns

### Servidor não inicia
```bash
# Verificar se a porta 8080 está livre
netstat -an | findstr :8080

# Verificar dependências
npm install
```

### Frontend não carrega
```bash
# Verificar se a porta 5173 está livre
netstat -an | findstr :5173

# Limpar cache
npm run build
```

### Erro de banco de dados
```bash
# Verificar se o arquivo leads.db foi criado
dir leads.db

# Verificar permissões da pasta
```

### Erro de CORS
- Verificar se o servidor está rodando na porta 8080
- Verificar configuração CORS no servidor
- Limpar cache do navegador

## 📱 Teste em Diferentes Dispositivos

### Desktop
- ✅ Chrome, Firefox, Safari, Edge
- ✅ Diferentes resoluções de tela
- ✅ Modo responsivo do navegador

### Mobile
- ✅ Teste no smartphone
- ✅ Teste no tablet
- ✅ Verificar navegação touch

## 🔍 Verificação de Logs

### Servidor (Terminal 1)
```
🚀 Servidor rodando na porta 8080
📊 Painel admin: http://localhost:8080/admin
🔌 API: http://localhost:8080/api
💾 Banco de dados: ./leads.db
🔐 Usuário admin: admin/admin123
```

### Frontend (Terminal 2)
```
  VITE v5.4.19  ready in 1234 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

## ✅ Checklist de Teste

- [ ] Servidor inicia sem erros
- [ ] Frontend carrega corretamente
- [ ] Login funciona com credenciais padrão
- [ ] Dashboard carrega estatísticas
- [ ] Importação CSV funciona
- [ ] Leads são criados no banco
- [ ] Gerenciamento de leads funciona
- [ ] Estatísticas e gráficos carregam
- [ ] API de rastreio retorna dados corretos
- [ ] Interface responsiva funciona
- [ ] Logout funciona corretamente

## 🎯 Próximos Passos

Após os testes bem-sucedidos:
1. ✅ Sistema funcionando localmente
2. 🔄 Configurar variáveis de ambiente
3. 🚀 Preparar para deploy em produção
4. 📊 Configurar monitoramento
5. 🔒 Implementar medidas de segurança adicionais

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do servidor
2. Confirme a configuração do banco
3. Teste com o arquivo CSV de exemplo
4. Verifique a conectividade da API
5. Consulte a documentação completa em `README_ADMIN.md`
