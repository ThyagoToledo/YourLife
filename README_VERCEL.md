# 🚀 Deploy no Vercel - Your Life

## 📋 Guia Rápido de Deploy

### 1️⃣ Preparação

O projeto já está configurado para o Vercel! Os arquivos necessários já foram criados:
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `.vercelignore` - Arquivos a ignorar
- ✅ `.gitignore` - Arquivos do Git
- ✅ Código adaptado para produção

### 2️⃣ Deploy via CLI do Vercel

```bash
# Instalar o Vercel CLI (primeira vez)
npm install -g vercel

# Fazer login no Vercel
vercel login

# Deploy (primeira vez - segue o assistente)
vercel

# Deploy em produção
vercel --prod
```

### 3️⃣ Deploy via GitHub

1. **Criar repositório no GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Deploy inicial no Vercel"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/yourlife.git
   git push -u origin main
   ```

2. **Conectar ao Vercel:**
   - Acesse: https://vercel.com
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - Configure (deixe as configurações padrão)
   - Clique em "Deploy"

### 4️⃣ Variáveis de Ambiente

No dashboard do Vercel, adicione estas variáveis:

```env
NODE_ENV=production
JWT_SECRET=seu_segredo_super_secreto_aqui_mude_isso
DB_PATH=:memory:
```

⚠️ **IMPORTANTE**: Gere um JWT_SECRET forte!
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5️⃣ Configurações do Projeto

**Build Settings:**
- Framework Preset: `Other`
- Build Command: `npm run vercel-build`
- Output Directory: `.`
- Install Command: `npm install`

### 6️⃣ Testar o Deploy

Após o deploy, seu site estará disponível em:
```
https://seu-projeto.vercel.app
```

Teste:
- ✅ Login/Registro
- ✅ Criar posts
- ✅ Adicionar amigos
- ✅ Enviar mensagens

## ⚠️ Importante sobre o Banco de Dados

### Banco em Memória (:memory:)

O Vercel usa serverless functions, então o banco SQLite em memória será **resetado** após cada request.

### Soluções Recomendadas:

#### Opção 1: PostgreSQL (Recomendado para Produção)
```bash
# Usar Vercel Postgres
vercel postgres create
```

Instale o adapter:
```bash
npm install pg
```

#### Opção 2: MongoDB Atlas (Grátis)
- Crie conta em: https://www.mongodb.com/cloud/atlas
- Configure cluster gratuito
- Atualize o código para usar MongoDB

#### Opção 3: Supabase (Grátis + PostgreSQL)
- Crie conta em: https://supabase.com
- Configure projeto
- Use o PostgreSQL deles

#### Opção 4: PlanetScale (MySQL Serverless)
- Crie conta em: https://planetscale.com
- Configure banco
- Atualize código

## 🔧 Estrutura de Arquivos

```
YourLife/
├── server.js              # Backend (Serverless Function)
├── vercel.json            # Configuração do Vercel
├── package.json           # Dependências
├── site.html              # Frontend principal
├── index.html             # Redireciona para site.html
├── app.js                 # Lógica do frontend
├── api.js                 # Cliente HTTP (adaptado)
├── state.js               # Gerenciamento de estado
├── utils.js               # Utilitários
└── .vercelignore          # Arquivos ignorados
```

## 🌍 Domínio Customizado

### Adicionar Domínio Próprio:

1. Vá em: Project Settings → Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Aguarde propagação (até 48h)

## 🐛 Troubleshooting

### Erro 500 no Deploy
```bash
# Ver logs
vercel logs

# Verificar build
vercel build
```

### Banco de dados vazio
- Lembre-se: banco em memória reseta
- Considere migrar para PostgreSQL/MongoDB

### CORS Error
- Já configurado para aceitar qualquer origem
- Verifique se API está respondendo

### Token inválido
- Verifique JWT_SECRET nas variáveis de ambiente
- Limpe localStorage: `localStorage.clear()`

## 📊 Monitoramento

**Analytics:**
- Dashboard do Vercel → Analytics
- Veja visitantes, requests, erros

**Logs em Tempo Real:**
```bash
vercel logs --follow
```

## 🔒 Segurança

### Checklist de Produção:

- [ ] JWT_SECRET forte e único
- [ ] HTTPS habilitado (automático no Vercel)
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] Rate limiting (considere adicionar)
- [ ] Validação de inputs
- [ ] Banco de dados persistente

## 📈 Performance

### Otimizações Automáticas do Vercel:
- ✅ CDN global
- ✅ Compressão Gzip/Brotli
- ✅ Cache inteligente
- ✅ Image optimization
- ✅ Edge Network

## 🆘 Suporte

### Links Úteis:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions

### Comandos Úteis:
```bash
vercel --help          # Ajuda
vercel list            # Listar deploys
vercel inspect URL     # Detalhes do deploy
vercel rm PROJECT      # Remover projeto
vercel dev             # Testar localmente
```

## 🎉 Próximos Passos

1. ✅ Deploy realizado
2. ⬜ Migrar para banco persistente
3. ⬜ Configurar domínio customizado
4. ⬜ Adicionar analytics
5. ⬜ Implementar cache
6. ⬜ Adicionar testes
7. ⬜ Configurar CI/CD

---

**Pronto!** Seu projeto está no ar! 🚀

Acesse: `https://seu-projeto.vercel.app`
