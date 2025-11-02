# ⚡ QUICK START - Deploy em 5 Minutos

## 🎯 Opção 1: Deploy Rápido (Via Interface)

### Passo 1: GitHub (2 min)
```bash
git init
git add .
git commit -m "Initial commit - Your Life v3.0.0"
```

Crie repositório em: https://github.com/new

```bash
git remote add origin https://github.com/SEU-USUARIO/yourlife.git
git branch -M main
git push -u origin main
```

### Passo 2: Vercel (2 min)

1. Acesse: https://vercel.com
2. Login com GitHub
3. **New Project** → Selecione seu repositório
4. **Environment Variables:**
   - `JWT_SECRET` = (cole o token abaixo)
   - `NODE_ENV` = `production`
5. **Deploy**

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passo 3: Testar (1 min)

Acesse: `https://seu-projeto.vercel.app`

✅ Pronto! Seu site está no ar!

---

## 🎯 Opção 2: Deploy via CLI (Super Rápido)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (segue o wizard)
vercel

# Quando pedir variáveis:
# JWT_SECRET: (gere com comando abaixo)
# NODE_ENV: production

# Deploy em produção
vercel --prod
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

✅ Pronto em 3 minutos!

---

## ⚠️ IMPORTANTE

### Banco de Dados

O banco atual (SQLite :memory:) **NÃO persiste dados** no Vercel!

**Para produção real:**
1. Configure um banco persistente
2. Veja: `DATABASE_MIGRATION.md`

**Opções recomendadas:**
- Vercel Postgres (mais fácil)
- Supabase (grátis + features)
- PlanetScale (MySQL)
- MongoDB Atlas (NoSQL)

---

## 🧪 Testar Localmente Primeiro

```bash
# 1. Instalar dependências
npm install

# 2. Criar banco local
npm run init-db

# 3. Iniciar servidor
npm start

# 4. Abrir navegador
start http://localhost:3000/site.html
```

Teste:
- ✅ Criar conta
- ✅ Fazer login
- ✅ Criar post
- ✅ Adicionar amigos

---

## 📖 Documentação Completa

- **Deploy Detalhado:** `DEPLOY_GUIDE.md`
- **Migração de Banco:** `DATABASE_MIGRATION.md`
- **Mudanças de Código:** `CODE_CHANGES.md`
- **README Completo:** `README_NOVO.md`

---

## 🆘 Problemas?

### Deploy falhou?
```bash
vercel logs
```

### Site não carrega?
- Verifique variáveis de ambiente
- Veja logs: `vercel logs --follow`

### Dados não persistem?
- Configure banco persistente: `DATABASE_MIGRATION.md`

---

## ✅ Checklist Mínimo

- [ ] Código no GitHub
- [ ] Deploy no Vercel
- [ ] JWT_SECRET configurado
- [ ] Site acessível
- [ ] Login funciona

**Opcional (mas recomendado):**
- [ ] Banco persistente configurado
- [ ] Domínio customizado
- [ ] Analytics ativado

---

**Pronto!** 🎉

Seu projeto está no ar em: `https://seu-projeto.vercel.app`

**Próximo passo:** Configure banco persistente (`DATABASE_MIGRATION.md`)
