# 🗄️ Migração para Banco de Dados Persistente

## ⚠️ Importante

O Vercel usa serverless functions, então o SQLite em memória **não persiste dados** entre requests.

Para produção, você **DEVE** usar um banco de dados persistente.

---

## 🎯 Opções Recomendadas

### 1️⃣ Vercel Postgres ⭐ (Recomendado)

**Vantagens:**
- ✅ Integração nativa com Vercel
- ✅ Grátis até 256MB
- ✅ Configuração automática
- ✅ PostgreSQL completo

**Instalação:**

```bash
# Instalar pacote Vercel Postgres
npm install @vercel/postgres

# Criar banco no Vercel
vercel postgres create
```

**Código de Exemplo (server.js):**

```javascript
const { sql } = require('@vercel/postgres');

// Substituir as queries SQLite por:
async function getUsers() {
  const { rows } = await sql`SELECT * FROM users`;
  return rows;
}

async function createUser(name, email, password) {
  const { rows } = await sql`
    INSERT INTO users (name, email, password) 
    VALUES (${name}, ${email}, ${password})
    RETURNING *
  `;
  return rows[0];
}
```

**Migration Script:**

```javascript
const { sql } = require('@vercel/postgres');

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  // ... outras tabelas
}

migrate().then(() => console.log('✅ Migração completa!'));
```

---

### 2️⃣ Supabase 🔥 (PostgreSQL Grátis)

**Vantagens:**
- ✅ 500MB grátis
- ✅ Auth integrado
- ✅ Real-time subscriptions
- ✅ Storage de arquivos

**Setup:**

1. **Criar conta:** https://supabase.com
2. **Criar projeto** e copiar connection string
3. **Instalar cliente:**

```bash
npm install @supabase/supabase-js
```

4. **Código (server.js):**

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Exemplo de query
async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  return data;
}

async function createPost(userId, content) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, content })
    .select()
    .single();
  return data;
}
```

5. **Variáveis de Ambiente (Vercel):**

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_publica_aqui
```

---

### 3️⃣ PlanetScale 🌐 (MySQL Serverless)

**Vantagens:**
- ✅ 5GB grátis
- ✅ Branching (como Git)
- ✅ Sem downtime
- ✅ MySQL compatível

**Setup:**

1. **Criar conta:** https://planetscale.com
2. **Criar banco**
3. **Instalar:**

```bash
npm install @planetscale/database
```

4. **Código:**

```javascript
const { connect } = require('@planetscale/database');

const conn = connect({
  url: process.env.DATABASE_URL
});

// Query
async function getUsers() {
  const results = await conn.execute('SELECT * FROM users');
  return results.rows;
}

async function createUser(name, email, password) {
  const results = await conn.execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );
  return results;
}
```

5. **Variável de Ambiente:**

```env
DATABASE_URL=mysql://user:pass@host/database
```

---

### 4️⃣ MongoDB Atlas ☁️ (NoSQL)

**Vantagens:**
- ✅ 512MB grátis
- ✅ Schema flexível
- ✅ Fácil escalar
- ✅ Global

**Setup:**

1. **Criar conta:** https://mongodb.com/cloud/atlas
2. **Criar cluster gratuito**
3. **Instalar:**

```bash
npm install mongodb
```

4. **Código:**

```javascript
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  await client.connect();
  return client.db('yourlife');
}

// Exemplo
async function getUsers() {
  const db = await connectDB();
  return await db.collection('users').find({}).toArray();
}

async function createUser(name, email, password) {
  const db = await connectDB();
  const result = await db.collection('users').insertOne({
    name,
    email,
    password,
    createdAt: new Date()
  });
  return result;
}
```

5. **Variável de Ambiente:**

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/yourlife
```

---

## 🔄 Passo a Passo de Migração

### 1. Escolha o Banco

Recomendo: **Vercel Postgres** (mais fácil) ou **Supabase** (mais features)

### 2. Backup dos Dados (se houver)

```bash
# SQLite local
sqlite3 database.sqlite .dump > backup.sql
```

### 3. Criar Schema no Novo Banco

Adapte o schema do `init-database.js` para o banco escolhido.

### 4. Atualizar server.js

Substitua todas as queries SQLite pelas do novo banco.

**Exemplo de conversão:**

```javascript
// ANTES (SQLite)
db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
  if (err) return res.status(500).json({ error: 'Erro' });
  res.json(user);
});

// DEPOIS (Vercel Postgres)
const { rows } = await sql`SELECT * FROM users WHERE id = ${userId}`;
res.json(rows[0]);

// DEPOIS (Supabase)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();
res.json(data);
```

### 5. Testar Localmente

```bash
# Com variável de ambiente
DATABASE_URL=sua_connection_string npm start
```

### 6. Configurar Variáveis no Vercel

```bash
vercel env add DATABASE_URL
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
```

Ou no dashboard: Settings → Environment Variables

### 7. Deploy

```bash
vercel --prod
```

---

## 📊 Comparação Rápida

| Banco | Grátis | Fácil Setup | Features | Melhor Para |
|-------|--------|-------------|----------|-------------|
| Vercel Postgres | 256MB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Integração com Vercel |
| Supabase | 500MB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Auth + Storage + RT |
| PlanetScale | 5GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | MySQL serverless |
| MongoDB Atlas | 512MB | ⭐⭐⭐ | ⭐⭐⭐⭐ | NoSQL/Flexível |

---

## 🆘 Ajuda

### Erros Comuns

**"Cannot connect to database"**
- Verifique connection string
- Confira variáveis de ambiente
- Teste conexão local primeiro

**"SSL required"**
- Adicione `?ssl=true` na connection string
- Configure SSL no código

**"Too many connections"**
- Use connection pooling
- Feche conexões após uso

### Recursos

- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Supabase: https://supabase.com/docs
- PlanetScale: https://planetscale.com/docs
- MongoDB: https://docs.mongodb.com/

---

## ✅ Checklist de Migração

- [ ] Escolhi o banco de dados
- [ ] Criei conta no serviço
- [ ] Instalei dependências
- [ ] Criei schema/tabelas
- [ ] Atualizei código do servidor
- [ ] Testei localmente
- [ ] Configurei variáveis no Vercel
- [ ] Fiz deploy
- [ ] Testei em produção
- [ ] Fiz backup dos dados

---

**Pronto!** Seu app agora tem banco de dados persistente! 🎉
