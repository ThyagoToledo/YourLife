# GUIA DE DEPLOY - YOUR LIFE COM VERCEL POSTGRES

Projeto migrado de SQLite para Vercel Postgres.

## Stack Tecnologica

- **Backend**: Node.js + Express
- **Banco de Dados**: Vercel Postgres (PostgreSQL)
- **Autenticacao**: JWT + bcrypt
- **Frontend**: HTML5 + Tailwind CSS + JavaScript
- **Deploy**: Vercel Serverless

## Deploy Rapido

### 1. Push para GitHub

```bash
git push origin main
```

### 2. Importar no Vercel

1. Acesse: https://vercel.com/new
2. Import Git Repository
3. Configure:
   - Framework: Other
   - Build Command: (vazio)
   - Output Directory: (vazio)

### 3. Adicionar Variavel de Ambiente

Environment Variables:
```
JWT_SECRET=56f33fa1da043c9d631e6b4d0d1719089d241d283957544aa70bb285cc27dea0
```

### 4. Criar Banco Vercel Postgres

1. Storage → Create Database → Postgres
2. Nome: yourlife-db
3. Regiao: Escolha a mais proxima
4. Connect Project → Selecione seu projeto

### 5. Deploy

O Vercel fara redeploy automatico apos conectar o banco.

Acesse: https://seu-projeto.vercel.app

## Banco de Dados

O servidor cria automaticamente as tabelas no primeiro acesso:
- users
- posts
- likes
- comments
- followers
- messages
- notifications
- advices
- user_interests

## Variaveis de Ambiente

### Obrigatorias (adicionar manualmente):
- JWT_SECRET

### Automaticas (Vercel adiciona ao conectar banco):
- POSTGRES_URL
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NON_POOLING
- POSTGRES_USER
- POSTGRES_HOST
- POSTGRES_PASSWORD
- POSTGRES_DATABASE

## Documentacao Completa

Veja README.md para documentacao completa da API e funcionalidades.
