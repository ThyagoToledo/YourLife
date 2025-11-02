# 🚀 GUIA COMPLETO DE DEPLOY - YOUR LIFE

## ✅ O QUE FOI FEITO

### Arquivos Criados
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `.vercelignore` - Arquivos a ignorar no deploy
- ✅ `README_VERCEL.md` - Guia de deploy detalhado
- ✅ `README_NOVO.md` - README atualizado para produção
- ✅ `DATABASE_MIGRATION.md` - Guia de migração de banco
- ✅ `index.html` - Página inicial (redireciona para site.html)

### Arquivos Modificados
- 📝 `server.js` - Adaptado para serverless (Vercel)
- 📝 `api.js` - Detecta automaticamente produção/desenvolvimento
- 📝 `package.json` - Versão 3.0.0, scripts para Vercel
- 📝 `.gitignore` - Atualizado para Vercel

### Arquivos Removidos
- ❌ `ngrok.yml` - Não necessário no Vercel
- ❌ `NGROK_SETUP.md` - Não necessário no Vercel

---

## 🎯 PRÓXIMOS PASSOS

### 1️⃣ Testar Localmente

```bash
# Iniciar servidor
npm start

# Em outro terminal, abrir navegador
start http://localhost:3000/site.html
```

Teste:
- ✅ Criar conta
- ✅ Fazer login
- ✅ Criar post
- ✅ Adicionar amigos
- ✅ Enviar mensagens

### 2️⃣ Configurar Git (se ainda não tem)

```bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "Deploy inicial - Your Life v3.0.0 para Vercel"

# Criar repositório no GitHub
# Vá em: https://github.com/new

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/yourlife.git

# Enviar para GitHub
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy no Vercel

#### Opção A: Via Interface (Recomendado)

1. **Acesse:** https://vercel.com
2. **Login** com GitHub
3. **New Project**
4. **Import** seu repositório
5. **Configure:**
   - Framework Preset: `Other`
   - Root Directory: `.`
   - Build Command: `npm run vercel-build`
   - Output Directory: `.`
6. **Environment Variables:**
   ```
   JWT_SECRET = (gere um token forte)
   NODE_ENV = production
   ```
7. **Deploy**

**Gerar JWT_SECRET forte:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (primeira vez - segue wizard)
vercel

# Deploy em produção
vercel --prod
```

### 4️⃣ Configurar Banco de Dados Persistente

⚠️ **IMPORTANTE:** O banco SQLite em memória não persiste dados no Vercel!

**Escolha uma opção:**

#### Opção 1: Vercel Postgres (Recomendado) ⭐
```bash
vercel postgres create
npm install @vercel/postgres
```
📖 Veja: `DATABASE_MIGRATION.md`

#### Opção 2: Supabase (Grátis + Features) 🔥
- Acesse: https://supabase.com
- Crie projeto
- Configure PostgreSQL
- Copie connection string

#### Opção 3: PlanetScale (MySQL) 🌐
- Acesse: https://planetscale.com
- Crie banco
- Configure connection

#### Opção 4: MongoDB Atlas (NoSQL) ☁️
- Acesse: https://mongodb.com/cloud/atlas
- Crie cluster gratuito
- Configure connection

📖 **Guia completo:** `DATABASE_MIGRATION.md`

---

## 🔧 CONFIGURAÇÕES IMPORTANTES

### Variáveis de Ambiente no Vercel

No dashboard do projeto → Settings → Environment Variables:

```env
# Obrigatório
JWT_SECRET=seu_token_de_32_bytes_em_hexadecimal

# Recomendado
NODE_ENV=production

# Se usar banco externo
DATABASE_URL=sua_connection_string_aqui
```

### Domínio Customizado (Opcional)

1. Settings → Domains
2. Add Domain
3. Configure DNS conforme instruções
4. Aguarde propagação (até 48h)

---

## ✅ CHECKLIST DE DEPLOY

### Antes do Deploy
- [ ] Código testado localmente
- [ ] Git configurado e atualizado
- [ ] Repositório no GitHub criado
- [ ] JWT_SECRET gerado

### Durante o Deploy
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build bem-sucedido
- [ ] Site acessível na URL do Vercel

### Após o Deploy
- [ ] Testar login/registro
- [ ] Testar criar posts
- [ ] Testar adicionar amigos
- [ ] Testar mensagens
- [ ] Configurar banco persistente
- [ ] (Opcional) Configurar domínio customizado

---

## 🐛 TROUBLESHOOTING

### Erro: "Build failed"
```bash
# Verificar logs
vercel logs

# Testar build localmente
npm install
npm start
```

### Erro: "Token inválido" após deploy
- Verifique JWT_SECRET nas variáveis de ambiente
- Limpe cache do navegador
- Limpe localStorage: `localStorage.clear()`

### Dados não persistem
- Configure banco de dados persistente
- Veja: `DATABASE_MIGRATION.md`

### CORS Error
- Já configurado para aceitar qualquer origem
- Se persistir, verifique logs do Vercel

### Site não carrega
- Verifique URL: deve ser `/site.html` ou `/`
- `index.html` redireciona automaticamente

---

## 📊 MONITORAMENTO

### Ver Logs em Tempo Real
```bash
vercel logs --follow
```

### Analytics
- Dashboard → Analytics
- Veja visitantes, requests, erros

### Performance
- Vercel otimiza automaticamente:
  - ✅ CDN global
  - ✅ Compressão
  - ✅ Cache
  - ✅ HTTPS

---

## 🎓 RECURSOS

### Documentação
- Vercel: https://vercel.com/docs
- API do Projeto: `README.md`
- Deploy: `README_VERCEL.md`
- Banco de Dados: `DATABASE_MIGRATION.md`

### Suporte
- GitHub Issues: (seu repositório)
- Vercel Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions

---

## 🎉 PARABÉNS!

Seu projeto está pronto para o mundo! 🌍

**URL do seu site:** https://seu-projeto.vercel.app

**Próximos passos sugeridos:**
1. ✅ Migrar para banco persistente
2. ✅ Configurar domínio customizado
3. ✅ Adicionar analytics
4. ✅ Implementar cache de assets
5. ✅ Adicionar testes automatizados

---

**Your Life v3.0.0** - Adaptado para Vercel
Última atualização: Novembro 2025
