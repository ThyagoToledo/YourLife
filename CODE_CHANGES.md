# 📝 MUDANÇAS DE CÓDIGO - RESUMO TÉCNICO

## 🔄 Adaptações para Vercel

### 1. `server.js` - Backend Serverless

#### Antes (Localhost)
```javascript
const PORT = process.env.PORT || 3000;
const DB_PATH = './database.sqlite';

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
});
```

#### Depois (Vercel)
```javascript
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.NODE_ENV === 'production' ? ':memory:' : './database.sqlite';

// Exporta para Vercel
module.exports = app;

// Só inicia servidor em desenvolvimento local
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando em http://0.0.0.0:${PORT}`);
    });
}
```

**Adicionado:** Função `initializeDatabase()` para criar schema em memória na primeira execução.

---

### 2. `api.js` - Cliente HTTP

#### Antes (Localhost/Ngrok)
```javascript
constructor() {
    if (window.BACKEND_URL) {
        this.baseUrl = window.BACKEND_URL;
    } else if (window.location.hostname.includes('ngrok')) {
        this.baseUrl = prompt('Digite URL do backend...');
    } else {
        this.baseUrl = 'http://localhost:3000/api';
    }
}
```

#### Depois (Vercel + Localhost)
```javascript
constructor() {
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
        // Em produção (Vercel), backend na mesma origem
        this.baseUrl = `${window.location.origin}/api`;
    } else {
        // Desenvolvimento local
        this.baseUrl = 'http://localhost:3000/api';
    }
}
```

**Resultado:** Detecção automática do ambiente sem configuração manual!

---

### 3. `package.json` - Configuração

#### Mudanças
```json
{
  "version": "3.0.0",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "vercel-build": "echo 'Build completo!'"
  }
}
```

---

### 4. `vercel.json` - Configuração do Vercel

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

**Explicação:**
- `builds`: Compila `server.js` como serverless function
- `routes`: Roteia `/api/*` para o backend, resto para arquivos estáticos

---

### 5. `index.html` - Página Inicial

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0;url=site.html">
</head>
<body>
    <div class="loader">
        <h2>Carregando Your Life...</h2>
    </div>
</body>
</html>
```

**Função:** Redireciona automaticamente para `site.html`

---

## 🗄️ Banco de Dados

### SQLite em Memória (Padrão)

```javascript
// Produção: banco em memória (reseta a cada request)
const DB_PATH = process.env.NODE_ENV === 'production' ? ':memory:' : './database.sqlite';

// Inicializa schema automaticamente
if (DB_PATH === ':memory:') {
    initializeDatabase();
}
```

⚠️ **Limitação:** Dados não persistem no Vercel!

### Migração Recomendada

Para produção real, migre para:

**Vercel Postgres:**
```javascript
const { sql } = require('@vercel/postgres');

// Query
const { rows } = await sql`SELECT * FROM users WHERE id = ${userId}`;
```

**Supabase:**
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

// Query
const { data } = await supabase.from('users').select('*');
```

---

## 🔐 Segurança

### Variáveis de Ambiente

**Desenvolvimento (`.env`):**
```env
JWT_SECRET=desenvolvimento_local_secret
NODE_ENV=development
```

**Produção (Vercel Dashboard):**
```env
JWT_SECRET=token_forte_de_32_bytes_em_hex
NODE_ENV=production
DATABASE_URL=sua_connection_string
```

### Gerar JWT_SECRET Forte
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔄 Fluxo de Requisições

### Desenvolvimento Local
```
Frontend (localhost:3000/site.html)
    ↓
API Client (api.js)
    ↓ HTTP Request
Backend (localhost:3000/api/*)
    ↓
SQLite (database.sqlite)
```

### Produção (Vercel)
```
Frontend (seu-projeto.vercel.app/site.html)
    ↓
API Client (api.js) → detecta produção
    ↓ HTTP Request (mesma origem)
Backend (seu-projeto.vercel.app/api/*) → Serverless Function
    ↓
SQLite (:memory:) ou Banco Externo
```

---

## 📊 Comparação

| Aspecto | Antes (Localhost) | Depois (Vercel) |
|---------|-------------------|-----------------|
| **Deploy** | Manual (servidor VPS) | Automático (Git push) |
| **URL** | IP ou ngrok | dominio.vercel.app |
| **HTTPS** | Manual (Let's Encrypt) | Automático |
| **Escala** | Manual (Load balancer) | Automático (Serverless) |
| **Banco** | SQLite local | PostgreSQL/MongoDB |
| **CDN** | Não | Global (Vercel Edge) |
| **Custo** | Servidor 24/7 | Grátis (hobby plan) |

---

## 🚀 Performance

### Otimizações Automáticas (Vercel)

- ✅ **CDN Global:** 40+ regiões
- ✅ **Compressão:** Gzip/Brotli automático
- ✅ **Cache:** Headers otimizados
- ✅ **Edge Functions:** Baixa latência
- ✅ **Auto-scaling:** Infinito (hobby: razoável)

---

## 🧪 Testes

### Testar Localmente com Vercel CLI

```bash
# Instalar
npm install -g vercel

# Simular produção
vercel dev
```

Acesse: http://localhost:3000

**Diferenças do `npm start`:**
- Usa configuração do `vercel.json`
- Simula serverless functions
- Simula variáveis de ambiente

---

## 📝 Checklist de Código

### Antes do Deploy
- [ ] `server.js` exporta `module.exports = app`
- [ ] `api.js` detecta produção corretamente
- [ ] `vercel.json` configurado
- [ ] `.vercelignore` configurado
- [ ] `.gitignore` atualizado
- [ ] `package.json` tem `engines` definido

### Após Deploy
- [ ] Backend responde em `/api`
- [ ] Frontend carrega corretamente
- [ ] Login/registro funcionam
- [ ] Posts são criados
- [ ] Amigos podem ser adicionados

---

## 🐛 Debug

### Ver o que o Vercel está executando

```bash
# Logs em tempo real
vercel logs --follow

# Inspecionar deploy específico
vercel inspect URL_DO_DEPLOY
```

### Variáveis de ambiente

```bash
# Listar
vercel env ls

# Adicionar
vercel env add NOME_DA_VARIAVEL

# Remover
vercel env rm NOME_DA_VARIAVEL
```

---

## 🎓 Conceitos Importantes

### Serverless Functions

- **O que é:** Código que executa sob demanda
- **Como funciona:** Vercel cria uma função para cada request
- **Limitações:**
  - Timeout: 10s (hobby), 60s (pro)
  - Memória: 1GB (hobby), 3GB (pro)
  - Não persiste estado entre requests

### Edge Network

- **O que é:** CDN global do Vercel
- **Como funciona:** Cache de arquivos estáticos nas edges
- **Benefícios:**
  - Baixa latência global
  - Alta disponibilidade
  - DDoS protection

---

## 📚 Próximos Passos

1. ✅ Deploy básico funcionando
2. ⬜ Migrar para banco persistente (`DATABASE_MIGRATION.md`)
3. ⬜ Adicionar testes automatizados
4. ⬜ Implementar CI/CD com GitHub Actions
5. ⬜ Adicionar monitoramento (Sentry, LogRocket)
6. ⬜ Configurar domínio customizado
7. ⬜ Otimizar queries do banco
8. ⬜ Adicionar cache Redis
9. ⬜ Implementar WebSockets (para chat real-time)

---

**Documentação Completa:**
- Deploy: `DEPLOY_GUIDE.md`
- Banco de Dados: `DATABASE_MIGRATION.md`
- API: `README.md`

**Your Life v3.0.0** - Vercel Ready! 🚀
