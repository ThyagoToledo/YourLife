# YOUR LIFE - Rede Social

> Conecte-se com quem importa

**Versão:** 3.0.0 | **Atualizado em:** 2 de Novembro 2025 | **Status:**  Em Produção

** Acesso ao Site:** https://your-life-gamma.vercel.app

---

##  ÍNDICE

1. [ Deploy e Acesso](#-deploy-e-acesso)
2. [ Funcionalidades](#-funcionalidades)
3. [ Tecnologias](#️-tecnologias)
4. [ Desenvolvimento Local](#-desenvolvimento-local)
5. [ Variáveis de Ambiente](#-variáveis-de-ambiente)
6. [ Banco de Dados](#️-banco-de-dados)
7. [ API Reference](#-api-reference)
8. [ Solução de Problemas](#-solução-de-problemas)
9. [ Changelog](#-changelog)

---

##  DEPLOY E ACESSO

###  Status da Aplicação

**URL Produção:** https://your-life-gamma.vercel.app  
**Repositório:** https://github.com/ThyagoToledo/YourLife  
**Banco de Dados:** Neon PostgreSQL (Serverless)  
**Hospedagem:** Vercel (Serverless Functions)  
**Status:**  Online

###  Deploy Automático

Este projeto está configurado com **deploy automático**:

```bash
# 1. Faça suas alterações localmente
git add .
git commit -m "sua mensagem"

# 2. Envie para o GitHub
git push origin main

# 3. Vercel detecta e faz deploy automático (30-60 segundos)
```

**Monitorar Deploy:**
- Dashboard Vercel: https://vercel.com/dashboard
- Logs em tempo real durante o deploy
- Notificações por email quando deploy termina

###  Novo Projeto (Fork/Clone)

**Se você quer criar sua própria versão:**

**Passo 1: Fork no GitHub**
```bash
# Clone o repositório
git clone https://github.com/ThyagoToledo/YourLife.git
cd YourLife

# Crie seu próprio repositório no GitHub
git remote set-url origin https://github.com/SEU-USUARIO/seu-projeto.git
git push -u origin main
```

**Passo 2: Deploy no Vercel**
1. Acesse: https://vercel.com
2. Login com GitHub
3. Clique em "New Project"
4. Importe seu repositório
5. Configure variáveis de ambiente (ver seção abaixo)
6. Clique em "Deploy"

**Passo 3: Conectar Banco de Dados Neon**
1. No Dashboard do Vercel, vá em "Storage"
2. Clique em "Create Database"
3. Escolha "Neon" (PostgreSQL serverless)
4. Clique em "Connect"
5. Variáveis serão adicionadas automaticamente

**Passo 4: Criar Tabelas no Banco**
1. Acesse: https://console.neon.tech/
2. Selecione seu banco de dados
3. Vá em "SQL Editor"
4. Execute o script SQL (ver seção [Banco de Dados](#️-banco-de-dados))

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

##  FUNCIONALIDADES

###  Interface v3.0.0

**Tela de Login**
- Design centralizado e minimalista
- Logo circular no centro
- Nome "Your Life" em destaque
- Formulário de login abaixo
- Fundo roxo em gradiente (blue-600 -> purple-600 -> purple-700)

**Tema Escuro (Dark Mode)**
- Ativacao: Botao no menu do usuario (canto superior direito)
- Persistencia: Salva preferencia no navegador
- Cobertura completa: Posts, modais, formularios, notificacoes
- Paleta Dark:
  - Backgrounds: gray-800, gray-700
  - Textos: white, gray-300, gray-400
  - Bordas: gray-700, gray-600

**Dropdown de Notificacoes**
- Localizacao: Icone de sino no header
- Funcionalidade: Clique para abrir/fechar
- Historico: Mostra todas as notificacoes recentes
- Marcacao: Indica notificacoes nao lidas
- Auto-close: Fecha ao clicar fora

### Menu do Usuario
- **Localizacao**: Foto e nome no header (direita)
- **Opcoes**:
  - Alternar Tema Escuro/Claro
  - Deslogar da conta
- **Auto-close**: Fecha ao clicar fora

### Branding
- **Nome**: "Your Life"
- **Slogan**: "Conecte-se com quem importa"
- **Logo**: Arara azul estilizada (preparada para customizacao)

---

## REGRAS DE DESIGN

### Simbolos ASCII vs Unicode Emojis

**OBRIGATORIO**: Usar apenas simbolos ASCII de texto, NAO usar emojis Unicode.

#### Razao
- Consistencia visual em todas as plataformas
- Melhor acessibilidade (screen readers)
- Estetica minimalista e profissional
- Evita problemas de renderizacao

#### Mapeamento de Simbolos

| Funcao | Unicode (X) | ASCII (OK) |
|--------|-------------|-----------|
| Adicionar | Unicode | + |
| Pendente/Aguardando | Unicode | ... |
| Confirmado/Sucesso | Unicode | [OK] |
| Erro/Recusar | Unicode | [X] |
| Notificacao | Unicode | (!) |
| Mensagem | Unicode | [msg] |
| Usuario/Pessoa | Unicode | [@] |
| Curtir/Amor | Unicode | <3 |
| Comentario | Unicode | [...] |
| Post/Documento | Unicode | [#] |
| Amigos/Grupo | Unicode | [@] |

#### Exemplo de Uso
```html
<!-- ERRADO -->
<button>Unicode Adicionar</button>
<span>Unicode Aceitar</span>

<!-- CORRETO -->
<button>+ Adicionar</button>
<span>[OK] Aceitar</span>
```

---

## NOVIDADES v2.0.0

### Sistema de Pedidos de Amizade

#### Botao nos Posts
- **Localizacao**: Ao lado do nome do autor em cada postagem
- **Funcionalidade**: Clique no botao "+ Adicionar" para enviar pedido instantaneamente
- **Visual**: Muda para "... Pendente" apos envio
- **Inteligencia**: So aparece para usuarios que nao sao voce

#### Categoria Pedidos
- **Localizacao**: Dentro da aba "Amigos" no menu lateral
- **Tabs**: 
  - "Amigos" → Lista de amigos aceitos
  - "Pedidos" → Lista de pedidos pendentes recebidos
- **Badge Vermelho**: Contador de pedidos pendentes
- **Acoes**:
  - [OK] Aceitar - Confirma amizade (reciprocamente)
  - [X] Recusar - Remove o pedido

#### Notificacoes
- (!) Quando **recebe** pedido de amizade
- (!) Quando seu pedido e **aceito**
- Aparecem no sino do header com badge

### Correspondencias (Mensagens Privadas)

#### Nova Aba no Menu
- **Nome**: "Correspondencias"
- **Badge**: Contador de mensagens nao lidas
- **Interface**: Estilo WhatsApp/Telegram

#### 3 Areas Principais

**1. Lista de Conversas**
- Todos os amigos com quem voce ja conversou
- Ultima mensagem de cada conversa
- Badge vermelho com mensagens nao lidas
- Timestamp da ultima mensagem

**2. Area de Chat**
- Header com avatar e nome do amigo
- Suas mensagens: fundo azul (direita)
- Mensagens do amigo: fundo cinza (esquerda)
- Scroll automatico para ultima mensagem
- Timestamp em cada mensagem

**3. Input de Mensagem**
- Campo de texto arredondado
- Botao "Enviar" azul
- Atalho: **Enter** para enviar rapido

#### Seguranca
- [OK] So funciona entre **amigos aceitos**
- [OK] Validacao automatica no backend
- [OK] Marcacao automatica de leitura

### Sistema de Notificacoes Aprimorado
- Notificacoes para pedidos de amizade
- Notificacoes para mensagens novas
- Notificacoes quando pedidos sao aceitos
- Badges com contadores em tempo real

### Como Usar

**Para Enviar Pedido de Amizade:**
1. Veja uma postagem no feed
2. Clique em "+ Adicionar" ao lado do nome
3. Aguarde "Pedido de amizade enviado!"
4. O botao mudara para "... Pendente"

**Para Gerenciar Pedidos:**
1. Menu → "Amigos"
2. Clique na tab "Pedidos"
3. Clique em "[OK] Aceitar" ou "[X] Recusar"

**Para Enviar Mensagens:**
1. Menu → "Correspondencias"
2. Clique em uma conversa existente
3. Digite e pressione Enter ou "Enviar"
4. *Nota: So funciona com amigos aceitos*

**Para Ativar Tema Escuro:**
1. Clique na sua foto/nome (canto superior direito)
2. Clique em "Alternar Tema"
3. Preferencia e salva automaticamente

---

## INICIO RAPIDO

### Requisitos
- Node.js >= 18.0
- Python3 >= 3.8

### Instalacao

```bash
# 1. Instalar dependencias
npm install

# 2. Inicializar banco de dados
npm run init-db

# 3. Iniciar servidores
./iniciar.sh
```

**Acesso:**
- Local: http://localhost:8000/site.html
- Rede: http://SEU-IP:8000/site.html

### Comandos Uteis

```bash
npm start              # Inicia apenas backend
npm run init-db        # Recria banco de dados
./iniciar.sh           # Inicia backend + frontend
./expor-internet.sh    # Expoe na internet (ngrok)
```

---

## FUNCIONALIDADES

### Autenticacao
- [OK] Login e registro com JWT
- [OK] Senha criptografada (bcrypt)
- [OK] Token valido por 7 dias

### Feed e Posts
- [OK] Criar postagens
- [OK] Curtir/descurtir
- [OK] Comentar
- [OK] Feed em tempo real

### Perfil
- [OK] Editar perfil (nome, bio, avatar, interesses)
- [OK] Ver perfil de outros usuarios
- [OK] Estatisticas (posts, amigos, likes)

### Amigos
- [OK] Sistema de pedidos de amizade (enviar/aceitar/recusar)
- [OK] Botao de adicionar amigo nos posts
- [OK] Categoria "Pedidos" com contador
- [OK] Buscar usuarios
- [OK] Ver lista de amigos
- [OK] Indicador de amizade mutua
- [OK] Notificacoes de pedidos

### Correspondencias (Mensagens)
- [OK] Chat privado com amigos
- [OK] Lista de conversas
- [OK] Badge de mensagens nao lidas
- [OK] Historico completo de mensagens
- [OK] Interface intuitiva tipo WhatsApp
- [OK] Notificacoes de novas mensagens

### Conselhos
- [OK] Criar conselhos
- [OK] Ver conselhos do dia
- [OK] Categorias (saude, carreira, relacionamentos, etc)

### Interface (v3.0.0)
- [OK] Tema escuro/claro com persistencia
- [OK] Dropdowns de notificacoes e menu
- [OK] Design minimalista
- [OK] Simbolos ASCII consistentes

### Atualizacoes em Tempo Real
- [OK] Polling a cada 10 segundos
- [OK] Notificacoes de likes e comentarios
- [OK] Atualizacao automatica do feed

---

##  ARQUITETURA

### Stack Tecnológico
```
Frontend:    HTML5 + Tailwind CSS (CDN) + JavaScript ES6+
Backend:     Node.js 18+ + Express 4.18
Banco:       Neon PostgreSQL (Serverless)
Driver DB:   @vercel/postgres 0.10.0
Auth:        JWT + bcryptjs
Deploy:      Vercel Serverless Functions
Repository:  GitHub (Deploy Automático)
```

###  Estrutura de Arquivos
```
YourLife/
├── server.js              # Backend Express (API Routes)
├── index.html             # Landing/Login Page
├── site.html              # Interface principal (App)
├── app.js                 # Lógica frontend principal
├── api.js                 # Cliente HTTP (fetch wrapper)
├── state.js               # State management
├── utils.js               # Utilitários
├── types.ts               # TypeScript definitions
├── vercel.json            # Configuração Vercel
├── package.json           # Dependências npm
├── .env                   # Variáveis ambiente (local)
└── README.md              # Esta documentação
```

###  Fluxo de Dados (Produção)
```
1. Usuário acessa https://your-life-gamma.vercel.app
2. Vercel serve index.html estático
3. Login via POST /api/auth/login → server.js (serverless)
4. Backend consulta Neon PostgreSQL via @vercel/postgres
5. JWT token retornado e salvo no localStorage
6. Todas requisições incluem token no header Authorization
7. Dados do backend (snake_case) → Normalização → Frontend (camelCase)
8. Polling verifica atualizações a cada 10s
9. Frontend atualiza automaticamente
```

### Normalização de Dados

**Problema Resolvido (v3.0.1):**
O backend PostgreSQL usa convenção snake_case (`created_at`, `user_id`), enquanto o frontend JavaScript usa camelCase (`createdAt`, `userId`). Isso causava o bug "NaNa atrás" em timestamps.

**Solução Implementada:**
Camada de normalização após receber dados do backend:

```javascript
// Exemplo: Normalização de Posts
const normalizedPost = {
    id: post.id,
    content: post.content,
    created_at: post.created_at,           // Mantém snake_case do backend
    author: {
        id: post.user_id,                  // user_id -> id
        name: post.user_name,              // user_name -> name
        avatar: post.user_avatar           // user_avatar -> avatar
    },
    likes: parseInt(post.likes_count) || 0,
    isLiked: parseInt(post.user_liked) > 0
};

// Uso em renderização
DateUtils.formatRelativeTime(post.created_at);  // Funciona corretamente
```

**Áreas Normalizadas:**
- Posts: `created_at`, `user_id`, `user_name`, `user_avatar`
- Conversas: `friend_id`, `friend_name`, `last_message_time`, `unread_count`
- Mensagens: `from_user_id`, `created_at`, `sender_name`, `sender_avatar`
- Pedidos: `id` -> `requesterId`, `created_at` -> `requestedAt`
- Comentários: `user_id`, `created_at`, `user_name`, `user_avatar`

###  Arquitetura Serverless
```
Vercel Edge Network
    ↓
Static Files (HTML/CSS/JS)
    ↓
API Routes (/api/*) → server.js (Node.js Function)
    ↓
Neon PostgreSQL (Connection Pool)
```

---

##  API REFERENCE

**Base URL (Produção):** `https://your-life-gamma.vercel.app/api`  
**Base URL (Local):** `http://localhost:3000/api`

**Autenticação:** Header `Authorization: Bearer {token}`

**Formato de Resposta:**
- Sucesso: Retorna array ou objeto diretamente
- Erro: `{ success: false, error: "mensagem" }`

### Autenticação

#### POST /api/auth/register
```json
Request:  { "name": "João", "email": "joao@email.com", "password": "123456" }
Response: { "success": true, "token": "jwt...", "user": {...} }
```

#### POST /api/auth/login
```json
Request:  { "email": "joao@email.com", "password": "123456" }
Response: { "success": true, "token": "jwt...", "user": {...} }
```

### Usuários

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/users/me | Meu perfil |
| GET | /api/users/:id | Perfil de usuário |
| PUT | /api/users/me | Atualizar perfil |
| GET | /api/users/search/:query | Buscar usuários |

### Feed e Posts

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/feed | Lista posts |
| POST | /api/posts | Criar post |
| POST | /api/posts/:id/like | Curtir |
| DELETE | /api/posts/:id/like | Descurtir |
| GET | /api/posts/:id/comments | Listar comentários |
| POST | /api/posts/:id/comments | Comentar |

### Amigos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/friends | Listar amigos aceitos |
| GET | /api/friends/requests | Pedidos recebidos |
| GET | /api/friends/status/:userId | Status de amizade |
| POST | /api/friends/request | Enviar pedido (body: {friend_id}) |
| PUT | /api/friends/accept/:requesterId | Aceitar pedido |
| DELETE | /api/friends/reject/:requesterId | Recusar pedido |
| DELETE | /api/friends/:id | Remover amigo |

### Mensagens (Correspondências)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/messages/conversations | Lista de conversas |
| GET | /api/messages/:userId | Mensagens com usuário |
| POST | /api/messages | Enviar (body: {to_user_id, content}) |
| PUT | /api/messages/:userId/read | Marcar como lidas |

### Conselhos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/advices | Listar conselhos |
| POST | /api/advices | Criar conselho |

### Notificações

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/notifications | Listar notificações |
| PUT | /api/notifications/:id/read | Marcar como lida |

### Atualizações

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/updates?since={timestamp} | Verificar atualizações |

**Exemplo de Response:**
```json
{
  "success": true,
  "updates": {
    "likes": [{ "type": "like", "postId": 5, "user": "Maria" }],
    "comments": [{ "type": "comment", "postId": 8, "content": "Ótimo!" }],
    "notifications": [...],
    "hasUpdates": true
  }
}
```

---

##  BANCO DE DADOS

###  Provedor: Neon PostgreSQL

**Console:** https://console.neon.tech/  
**Tipo:** PostgreSQL 15+ (Serverless)  
**Conexão:** Automática via `@vercel/postgres`  
**Variáveis:** Configuradas automaticamente pelo Vercel

### Schema - 9 Tabelas

#### 1 users - Usuários
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    cover_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2️ posts - Postagens
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3️ likes - Curtidas
```sql
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);
```

#### 4️ comments - Comentários
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5️ followers - Sistema de Amizade
```sql
CREATE TABLE followers (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);
```

#### 6️ user_interests - Interesses
```sql
CREATE TABLE user_interests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    interest TEXT NOT NULL
);
```

#### 7️ advices - Conselhos
```sql
CREATE TABLE advices (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8️ notifications - Notificações
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    related_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 9️ messages - Mensagens Privadas
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relacionamentos
```
users (1) ──┬── (N) posts
            ├── (N) likes
            ├── (N) comments
            ├── (N) user_interests
            ├── (N) followers (follower_id)
            ├── (N) followers (following_id)
            ├── (N) notifications (user_id)
            ├── (N) notifications (related_user_id)
            ├── (N) messages (from_user_id)
            └── (N) messages (to_user_id)

posts (1) ──┬── (N) likes
            └── (N) comments
```

### Criar Tabelas (Novo Deploy)

Se você está fazendo deploy pela primeira vez:

1. Acesse: https://console.neon.tech/
2. Selecione seu banco de dados
3. Vá em "SQL Editor"
4. Cole e execute o script completo acima
5. Verifique com: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

---

## VARIÁVEIS DE AMBIENTE

### Produção (Vercel Dashboard)

**Configuradas automaticamente:**
- `POSTGRES_URL` - Connection string completa (Neon)
- `POSTGRES_PRISMA_URL` - Para uso com Prisma
- `POSTGRES_URL_NON_POOLING` - Sem connection pool
- `POSTGRES_USER` - Usuário do banco
- `POSTGRES_HOST` - Host do servidor Neon
- `POSTGRES_PASSWORD` - Senha do banco
- `POSTGRES_DATABASE` - Nome do banco

**Configurar manualmente:**
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Settings → Environment Variables
4. Adicione:
   - `JWT_SECRET` = (gere com comando abaixo)
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `*` (ou seu domínio específico)

### Desenvolvimento Local

Arquivo `.env`:
```env
# Servidor
PORT=3000
NODE_ENV=development

# JWT (OBRIGATÓRIO - gere um novo!)
JWT_SECRET=56f33fa1da043c9d631e6b4d0d1719089d241d283957544aa70bb285cc27dea0

# CORS
CORS_ORIGIN=*

# PostgreSQL (copie do Vercel ou use local)
POSTGRES_URL=postgresql://usuario:senha@host:5432/banco
```

**Gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Segurança

**Nunca comite `.env` no Git!**
- Arquivo já está no `.gitignore`
- Use valores diferentes para dev e produção
- JWT_SECRET deve ser único e secreto

---

## DESENVOLVIMENTO LOCAL

### Requisitos
- Node.js >= 18.0
- npm >= 9.0
- Conta no Neon (ou PostgreSQL local)

### Setup Inicial

```bash
# 1. Clone o repositório
git clone https://github.com/ThyagoToledo/YourLife.git
cd YourLife

# 2. Instale dependências
npm install

# 3. Configure .env
cp .env.example .env
# Edite .env e adicione suas variáveis

# 4. Crie as tabelas no banco
# Execute o script SQL no Neon Console ou PostgreSQL local

# 5. Inicie o servidor
npm start
```

**Acesso Local:**
- Backend: http://localhost:3000/api
- Frontend: Abra `index.html` no navegador

### Scripts Disponíveis

```bash
npm start              # Inicia servidor backend
npm run dev            # Modo desenvolvimento com auto-reload
npm test               # Executa testes (se configurado)
```

### Desenvolvimento com Live Reload

```bash
# Instalar nodemon globalmente
npm install -g nodemon

# Iniciar com auto-reload
nodemon server.js
```

---

## SOLUÇÃO DE PROBLEMAS

### Erro: "NaNa atrás" ou "Data inválida"

**Causa:** Inconsistência entre nomes de campos do backend (snake_case) e frontend (camelCase)

**Solução:**
- Já corrigido na versão 3.0.1
- Se persistir: `git pull origin main` e redesploy
- Verifique no console do navegador se há erros relacionados a timestamps
- Limpe o cache: `Ctrl+Shift+R` (ou `Cmd+Shift+R` no Mac)

**Campos Afetados e Correções:**
```javascript
// Posts
post.timestamp -> post.created_at ✓

// Conversas
conv.lastMessageAt -> conv.last_message_time (normalizado) ✓

// Mensagens
msg.createdAt -> msg.created_at (normalizado) ✓

// Pedidos de Amizade
request.requestedAt -> request.created_at (normalizado) ✓
```

### Erro: "relation does not exist"

**Causa:** Tabelas não criadas no banco de dados

**Solução:**
1. Acesse https://console.neon.tech/
2. Execute o script SQL completo (seção [Banco de Dados](#️-banco-de-dados))
3. Verifique: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

### Erro: "missing_connection_string"

**Causa:** Variáveis do banco não configuradas

**Solução:**
1. Vercel: Reconecte o banco em Storage → Neon
2. Local: Adicione `POSTGRES_URL` no `.env`

### Frontend mostra "Object" ao invés de dados

**Causa:** API retornando objeto wrapper ao invés de array

**Solução:**
- Já corrigido na versão atual (commit 65afa2e)
- Se persistir: `git pull origin main` e redesploy

### Token inválido / Não autenticado

**Solução:**
```javascript
// No console do navegador
localStorage.clear()
// Faça login novamente
```

### CORS bloqueado em produção

**Solução:**
1. Vercel Dashboard → Settings → Environment Variables
2. Adicione/verifique: `CORS_ORIGIN=*`
3. Ou restrinja: `CORS_ORIGIN=https://seu-dominio.com`

### Deploy falha no Vercel

**Passos:**
1. Vercel Dashboard → Deployments → Ver logs
2. Verifique erros de build
3. Confirme que `package.json` tem todas as dependências
4. Verifique `vercel.json` está correto

### Logs de Produção

```bash
# Instalar Vercel CLI
npm i -g vercel

# Ver logs em tempo real
vercel logs your-life-gamma --follow
```

### Verificar Status do Banco

```sql
-- No Neon Console
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Contar registros
SELECT 'users' as table, COUNT(*) FROM users
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;
```

---

## CHANGELOG

### [3.0.1] - 02/11/2025

**Correções de Bugs Críticos:**
- [CORRIGIDO] Bug "NaNa atrás" em posts - Campo `post.timestamp` não existia, alterado para `post.created_at`
- [CORRIGIDO] Bug "NaNa atrás" em conversas - Campo `lastMessageAt` inconsistente, normalizado de `last_message_time`
- [CORRIGIDO] Bug "NaNa atrás" em mensagens - Campo `createdAt` inconsistente, normalizado de `created_at`
- [CORRIGIDO] Bug "NaNa atrás" em pedidos de amizade - Campo `requestedAt` inconsistente, normalizado de `created_at`
- [MELHORADO] Validação de datas em `formatRelativeTime()` - Adicionado `isNaN()` check e tratamento de valores nulos
- [MELHORADO] Proteção contra arrays vazios - Adicionado fallback `|| []` em `post.comments.map()`

**Impacto:**
- Timestamps agora exibem corretamente em todas as áreas (posts, mensagens, conversas, notificações, pedidos)
- Formato correto: "2h atrás", "5min atrás", "1d atrás", etc.
- Eliminado completamente o erro "NaNa atrás"

**Normalização de Dados:**
```javascript
// Conversas: Mapeamento backend -> frontend
friend_id -> userId
friend_name -> name
friend_avatar -> avatar
last_message -> lastMessage
last_message_time -> lastMessageAt
unread_count -> unreadCount

// Mensagens: Mapeamento backend -> frontend
created_at -> createdAt
from_user_id -> isFromMe (comparação)
sender_name -> sender.name
sender_avatar -> sender.avatar

// Pedidos: Mapeamento backend -> frontend
id -> requesterId
created_at -> requestedAt
```

### [3.0.0] - 02/11/2025

**Deploy em Produção:**
-  Migrado de SQLite para Neon PostgreSQL
-  Deploy no Vercel com serverless functions
-  URL pública: https://your-life-gamma.vercel.app
-  Deploy automático via GitHub
-  Banco de dados em nuvem (Neon)

**Mudanças Técnicas:**
- Removido: `sqlite3`, `init-database.js`, `database.sqlite`
- Adicionado: `@vercel/postgres` driver
- Reescrito: Todas as queries para usar tagged templates
- Configurado: `vercel.json` para serverless + static files
- Corrigido: APIs retornavam objetos ao invés de arrays
- Corrigido: Query SQL problemática em `/api/messages/conversations`

**Dependências:**
```json
{
  "@vercel/postgres": "^0.10.0",
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "body-parser": "^1.20.2",
  "dotenv": "^16.3.1"
}
```

**Banco de Dados:**
- Provider: Neon PostgreSQL 15+
- Conexão: Via `@vercel/postgres` com POSTGRES_URL
- Schema: 9 tabelas (users, posts, likes, comments, followers, user_interests, advices, notifications, messages)
- Região: Auto-selecionada pelo Neon

### [2.0.0] - 30/10/2025

**Novidades Principais:**
- **Sistema de Pedidos de Amizade**
  - Botao "Adicionar" em cada post
  - Categoria "Pedidos" na aba Amigos
  - Aceitar/recusar pedidos
  - Notificacoes automaticas
  - Badge contador de pedidos pendentes
  
- **Correspondencias (Mensagens Privadas)**
  - Chat privado entre amigos
  - Lista de conversas com ultimas mensagens
  - Badge de mensagens nao lidas
  - Interface moderna tipo WhatsApp
  - Historico completo de mensagens
  
- **Melhorias nas Notificacoes**
  - Notificacoes para pedidos de amizade
  - Notificacoes para novas mensagens
  - Notificacoes quando pedidos sao aceitos
  - Sistema de badges visuais

**Mudancas Tecnicas:**
- Nova tabela `messages` no banco de dados
- Coluna `status` na tabela `followers` (pending/accepted)
- Coluna `related_user_id` na tabela `notifications`
- 8 novas rotas de API para mensagens
- 5 novas rotas de API para pedidos de amizade
- Metodo `sendFriendRequest()` no frontend
- Metodos `loadConversations()` e `openChat()` no frontend

### [1.0.0] - 30/10/2025

**Implementado:**
- Sistema completo de autenticacao (JWT + bcrypt)
- Feed de postagens com likes e comentarios
- Perfis editaveis com interesses
- Sistema de amigos basico (adicionar/remover/buscar)
- Conselhos do dia com categorias
- Notificacoes em tempo real (polling 10s)
- Busca de usuarios
- Acesso externo (rede local + internet)
- Scripts de automacao (iniciar.sh, expor-internet.sh)

**Tecnologias:**
- Backend: Node.js 18 + Express 4.18 + SQLite 5.1
- Frontend: HTML5 + Tailwind CSS + JavaScript ES6+
- Auth: JWT 9.0 + bcryptjs 2.4

**Corrigido:**
- Erro ao carregar perfil de outros usuarios
- CORS bloqueando requisicoes externas
- TypeScript moduleResolution deprecated
- Problemas com portas ocupadas

---

## NOTAS TÉCNICAS

### Estrutura do Código

**Frontend (app.js):**
```javascript
App                         # Controller principal
|-- handleLogin()            # Processa login
|-- handleRegister()         # Processa registro
|-- loadFeed()               # Carrega feed de posts (normaliza created_at)
|-- handleCreatePost()       # Cria nova postagem
|-- showEditProfile()        # Modal editar perfil
|-- loadFriends()            # Lista amigos
|-- loadFriendRequests()     # Lista pedidos pendentes (normaliza created_at)
|-- sendFriendRequest()      # Envia pedido de amizade
|-- loadConversations()      # Lista conversas (normaliza last_message_time)
|-- openChat()               # Abre chat com amigo
|-- loadChatMessages()       # Carrega mensagens (normaliza created_at)
|-- loadAdvices()            # Lista conselhos
|-- startPolling()           # Inicia polling (10s)
|-- stopPolling()            # Para polling
|-- toggleDarkMode()         # Alterna tema escuro/claro
|-- createPostElement()      # Renderiza post (usa created_at)
```

**Utilitários (utils.js):**
```javascript
DateUtils
|-- formatRelativeTime(date)     # Formata data relativa ("2h atrás")
|   |-- Validação: isNaN(), null check
|   |-- Tratamento de datas inválidas
|   |-- Tratamento de datas futuras
|-- formatTimestamp(timestamp)   # Wrapper para formatRelativeTime
|-- formatFullDate(date)         # Formata data completa
```

**API Client (api.js):**
```javascript
ApiService
|-- login(credentials)
|-- register(data)
|-- getFeed()
|-- createPost(data)
|-- getFriends()
|-- sendFriendRequest(userId)
|-- acceptFriendRequest(requesterId)
|-- getConversations()
|-- getMessages(userId)
|-- sendMessage(data)
|-- getUpdates(since)
```

**Backend (server.js):**
```javascript
// Conexão PostgreSQL
const { sql } = require('@vercel/postgres');

// Middleware
authenticateToken()      # Valida JWT

// Rotas principais
POST   /api/auth/register
POST   /api/auth/login
GET    /api/feed
POST   /api/posts
GET    /api/friends
POST   /api/friends/request
GET    /api/messages/conversations
POST   /api/messages
```

### Segurança

**Implementado:**
- Senhas hasheadas com bcrypt (salt rounds: 10)
- JWT para autenticação stateless
- Token expira em 7 dias
- Prepared statements via `@vercel/postgres` (previne SQL injection)
- CORS configurado
- Middleware de autenticação em todas as rotas protegidas
- Validação de entrada nos endpoints
- Validação de tipos de dados (parseInt, isNaN)
- Proteção contra valores nulos/undefined em operações críticas

**Recomendações Produção:**
- Usar HTTPS (Vercel já fornece)
- JWT_SECRET forte e único
- Considerar rate limiting (Express Rate Limit)
- Implementar refresh tokens
- Adicionar logs de auditoria
- Configurar CORS específico: `CORS_ORIGIN=https://seu-dominio.com`
- Implementar validação de entrada mais rigorosa (Joi/Zod)
- Adicionar sanitização de HTML em inputs do usuário

### Performance

**Otimizações implementadas:**
- Connection pooling automático (Neon)
- Queries indexadas por primary/foreign keys
- Limite de 50 posts no feed
- Limite de 20 conselhos por categoria
- Polling inteligente (só busca se há updates)
- Normalização de dados em lote (map operations)
- Validação de tipos eficiente (parseInt, isNaN)
- Proteção contra erros de renderização (|| [] fallbacks)

**Melhorias futuras:**
- Cache Redis para queries frequentes
- Paginação infinita no feed
- Compressão de imagens
- CDN para assets estáticos
- WebSocket para chat em tempo real
- Lazy loading de componentes
- Memoização de formatação de datas

### Boas Práticas

**Aprendizados da v3.0.1:**

1. **Consistência de Nomenclatura:**
   - Backend e Frontend devem usar mesma convenção (ou normalizar na camada de API)
   - Documentar mapeamento de campos
   - Considerar usar TypeScript para type safety

2. **Validação de Dados:**
   - Sempre validar antes de operações matemáticas (`isNaN()`)
   - Usar fallbacks para arrays (`|| []`)
   - Validar existência de propriedades antes de acessar (`?.` operator)

3. **Formatação de Datas:**
   - Validar timestamps antes de formatar
   - Tratar casos especiais (null, undefined, datas futuras)
   - Usar formato consistente em todo o sistema

4. **Debugging:**
   - Adicionar logs estratégicos (`console.log`, `console.error`)
   - Verificar estrutura de dados recebidos do backend
   - Testar em ambiente de produção após deploy

5. **Code Review:**
   - Revisar queries SQL e estrutura de dados
   - Verificar nomenclatura de campos
   - Testar fluxos completos (backend → frontend → renderização)

---

## PRÓXIMAS VERSÕES

### Planejado para v3.1.0
- [ ] Editar/deletar posts
- [ ] Upload de imagens (Cloudinary/S3)
- [ ] Busca avançada de usuários
- [ ] Sistema de hashtags
- [ ] Menções (@usuario)
- [ ] Migrar para padrão consistente (camelCase ou snake_case)
- [ ] Implementar transformadores de dados (backend -> frontend)

### Planejado para v4.0.0
- [ ] Chat em tempo real (WebSocket)
- [ ] Chamadas de vídeo (WebRTC)
- [ ] Stories (24h)
- [ ] Grupos/Comunidades
- [ ] Sistema de moderação
- [ ] Migração para TypeScript completo
- [ ] Testes automatizados (Jest/Vitest)

---

## CONTRIBUINDO

### Como Contribuir

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'feat: adicionar nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

### Padrão de Commits

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

---

## LICENÇA

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

##  AUTOR

**Thyago Toledo**  
GitHub: [@ThyagoToledo](https://github.com/ThyagoToledo)  
Projeto: [YourLife](https://github.com/ThyagoToledo/YourLife)

---

## AGRADECIMENTOS

- Vercel pela hospedagem serverless
- Neon pela infraestrutura PostgreSQL
- Tailwind CSS pelo framework CSS
- Comunidade open-source

---

**Última atualização:** 2 de novembro de 2025  
**Versão:** 3.0.1  
**Status:**  Em Produção

---

**Se este projeto te ajudou, deixe uma estrela no GitHub!**
