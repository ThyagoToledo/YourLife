# 🌟 YOUR LIFE - Rede Social

> **Conecte-se com quem importa**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/seu-usuario/yourlife)

## 🚀 Deploy Rápido no Vercel

### Opção 1: Via Interface do Vercel (Mais Fácil)

1. **Fork este repositório** ou faça upload para seu GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em **"New Project"**
4. Importe seu repositório
5. Configure as variáveis de ambiente:
   - `JWT_SECRET` = (gere um token seguro)
   - `NODE_ENV` = `production`
6. Clique em **"Deploy"**

### Opção 2: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Ou deploy em produção
vercel --prod
```

## ✨ Funcionalidades

### 🎨 Interface
- ✅ Design minimalista e moderno
- ✅ Tema escuro/claro com persistência
- ✅ Responsivo (mobile-first)
- ✅ Notificações em tempo real

### 👥 Social
- ✅ Sistema de amigos (enviar/aceitar/recusar)
- ✅ Feed de postagens
- ✅ Curtir e comentar
- ✅ Mensagens privadas entre amigos
- ✅ Perfis personalizáveis

### 💬 Comunicação
- ✅ Chat privado estilo WhatsApp
- ✅ Lista de conversas
- ✅ Contador de mensagens não lidas
- ✅ Notificações instantâneas

### 💡 Conselhos
- ✅ Criar e compartilhar conselhos
- ✅ Categorias (saúde, carreira, etc)
- ✅ Feed de conselhos do dia

## 🛠️ Tecnologias

### Frontend
- HTML5 + Tailwind CSS
- JavaScript ES6+ (Vanilla)
- State Management customizado

### Backend
- Node.js + Express
- SQLite (dev) / PostgreSQL (prod recomendado)
- JWT Authentication
- bcrypt para senhas

### Deploy
- Vercel (Serverless)
- GitHub Integration
- Automatic HTTPS

## 📦 Desenvolvimento Local

### Requisitos
- Node.js >= 18.0.0
- npm ou yarn

### Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/yourlife.git
cd yourlife

# 2. Instalar dependências
npm install

# 3. Criar arquivo .env
echo "JWT_SECRET=seu_segredo_aqui" > .env
echo "NODE_ENV=development" >> .env

# 4. Inicializar banco de dados
npm run init-db

# 5. Iniciar servidor
npm start
```

Acesse: http://localhost:3000

## 🌍 Variáveis de Ambiente

Crie um arquivo `.env` ou configure no Vercel:

```env
# Obrigatório
JWT_SECRET=seu_token_super_secreto_aqui

# Opcional
NODE_ENV=production
PORT=3000
DB_PATH=:memory:
```

⚠️ **Gere um JWT_SECRET forte:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Banco de Dados

### Desenvolvimento (SQLite Local)
```bash
npm run init-db
```

### Produção (Recomendações)

#### Opção 1: Vercel Postgres ⭐
```bash
vercel postgres create
```

#### Opção 2: Supabase (Grátis)
- Crie conta em [supabase.com](https://supabase.com)
- Configure PostgreSQL
- Atualize connection string

#### Opção 3: PlanetScale (MySQL)
- Crie conta em [planetscale.com](https://planetscale.com)
- Configure banco serverless
- Atualize código para MySQL

#### Opção 4: MongoDB Atlas
- Crie conta em [mongodb.com](https://www.mongodb.com/cloud/atlas)
- Configure cluster gratuito
- Migre schema para MongoDB

## 📁 Estrutura do Projeto

```
yourlife/
├── server.js              # API Backend (Serverless)
├── site.html              # Interface principal
├── index.html             # Página inicial (redireciona)
├── app.js                 # Lógica do frontend
├── api.js                 # Cliente HTTP
├── state.js               # Gerenciamento de estado
├── utils.js               # Funções utilitárias
├── vercel.json            # Configuração Vercel
├── package.json           # Dependências
└── README.md              # Este arquivo
```

## 🎯 Comandos Úteis

```bash
npm start              # Inicia servidor local
npm run dev            # Modo desenvolvimento (nodemon)
npm run init-db        # Inicializa banco de dados
npm run type-check     # Verifica tipos TypeScript
vercel                 # Deploy no Vercel
vercel --prod          # Deploy em produção
vercel logs            # Ver logs de produção
```

## 🔒 Segurança

### Checklist de Produção

- [ ] JWT_SECRET forte e único
- [ ] HTTPS habilitado (automático no Vercel)
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado
- [ ] Banco de dados persistente
- [ ] Validação de inputs
- [ ] Rate limiting (opcional)

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se o backend está rodando
- Confirme a URL da API em `api.js`

### Erro: "Token inválido"
- Limpe o localStorage: `localStorage.clear()`
- Faça login novamente

### Banco de dados vazio após deploy
- Configure banco persistente (PostgreSQL/MongoDB)
- Banco em memória reseta a cada request no Vercel

### CORS Error
- Já configurado para aceitar qualquer origem
- Verifique configuração em `server.js`

## 📖 Documentação Completa

- [Deploy no Vercel](./README_VERCEL.md)
- [Documentação Técnica](./README.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'Adiciona nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

Desenvolvido com ❤️ por [Seu Nome]

## 🌟 Suporte

Se você gostou deste projeto, dê uma ⭐️ no GitHub!

---

**v3.0.0** - Adaptado para Vercel | Última atualização: Novembro 2025
