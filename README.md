# 📚 YOUR LIFE - REDE SOCIAL INTEGRADA

> **Versão:** 3.0.0 | **Atualizada em:** 30/10/2025

---

## 📋 ÍNDICE

1. [Início Rápido](#início-rápido)
2. [Novidades v3.0.0](#-novidades-v30)
3. [Regras de Design](#-regras-de-design)
4. [Funcionalidades v2.0.0](#-novidades-v200)
5. [Arquitetura](#arquitetura)
6. [API](#api)
7. [Banco de Dados](#banco-de-dados)
8. [Acesso Externo](#acesso-externo)
9. [Solução de Problemas](#solução-de-problemas)
10. [Changelog](#changelog)

---

## ✨ NOVIDADES v3.0.0

### 🎨 Interface Minimalista
- **Tela de Login**: Design centralizado e limpo
  - Logo circular no centro (preparado para imagem futura)
  - Nome "Your Life" em destaque
  - Formulário de login abaixo
  - Fundo roxo em gradiente (blue-600 → purple-600 → purple-700)
  - Sem textos promocionais ou features

### 🌙 Tema Escuro (Dark Mode)
- **Ativação**: Botão no menu do usuário (canto superior direito)
- **Persistência**: Salva preferência no navegador
- **Cobertura Completa**:
  - Posts e cards do feed
  - Modais (editar perfil, criar conselho, visualizar perfil)
  - Áreas de amigos, conselhos e mensagens
  - Notificações e dropdowns
  - Formulários e inputs
- **Paleta Dark**:
  - Backgrounds: `gray-800`, `gray-700`
  - Textos: `white`, `gray-300`, `gray-400`
  - Bordas: `gray-700`, `gray-600`

### 🔔 Dropdown de Notificações
- **Localização**: Ícone de sino no header
- **Funcionalidade**: Clique para abrir/fechar
- **Histórico**: Mostra todas as notificações recentes
- **Marcação**: Indica notificações não lidas
- **Auto-close**: Fecha ao clicar fora

### 👤 Menu do Usuário
- **Localização**: Foto e nome no header (direita)
- **Opções**:
  - Alternar Tema Escuro/Claro
  - Deslogar da conta
- **Auto-close**: Fecha ao clicar fora

### 🎯 Branding
- **Nome**: "Your Life"
- **Slogan**: "Conecte-se com quem importa"
- **Logo**: Arara azul estilizada (preparada para customização)

---

## 🎨 REGRAS DE DESIGN

### Símbolos ASCII vs Unicode Emojis

**OBRIGATÓRIO**: Usar apenas símbolos ASCII de texto, NÃO usar emojis Unicode.

#### Razão
- Consistência visual em todas as plataformas
- Melhor acessibilidade (screen readers)
- Estética minimalista e profissional
- Evita problemas de renderização

#### Mapeamento de Símbolos

| Função | Unicode (❌) | ASCII (✅) |
|--------|-------------|-----------|
| Adicionar | ➕ | + |
| Pendente/Aguardando | ⏳ | ... |
| Confirmado/Sucesso | ✅ | [✓] |
| Erro/Recusar | ❌ | [X] |
| Notificação | 🔔 | (!) |
| Mensagem | 💬 | [msg] |
| Usuário/Pessoa | 👤 | [@] |
| Curtir/Amor | ❤️ | <3 |
| Comentário | 💭 | [...] |
| Post/Documento | 📝 | [#] |
| Amigos/Grupo | 👥 | [@] |

#### Exemplo de Uso
```html
<!-- ❌ ERRADO -->
<button>➕ Adicionar</button>
<span>✅ Aceitar</span>

<!-- ✅ CORRETO -->
<button>+ Adicionar</button>
<span>[✓] Aceitar</span>
```

---

## ✨ NOVIDADES v2.0.0

## ✨ NOVIDADES v2.0.0

### 🎯 Sistema de Pedidos de Amizade

#### Botão nos Posts
- **Localização**: Ao lado do nome do autor em cada postagem
- **Funcionalidade**: Clique no botão "+ Adicionar" para enviar pedido instantaneamente
- **Visual**: Muda para "... Pendente" após envio
- **Inteligência**: Só aparece para usuários que não são você

#### Categoria Pedidos
- **Localização**: Dentro da aba "Amigos" no menu lateral
- **Tabs**: 
  - "Amigos" → Lista de amigos aceitos
  - "Pedidos" → Lista de pedidos pendentes recebidos
- **Badge Vermelho**: Contador de pedidos pendentes
- **Ações**:
  - [✓] Aceitar - Confirma amizade (reciprocamente)
  - [X] Recusar - Remove o pedido

#### Notificações
- (!) Quando **recebe** pedido de amizade
- (!) Quando seu pedido é **aceito**
- Aparecem no sino do header com badge

### [msg] Correspondências (Mensagens Privadas)

#### Nova Aba no Menu
- **Nome**: "Correspondências"
- **Badge**: Contador de mensagens não lidas
- **Interface**: Estilo WhatsApp/Telegram

#### 3 Áreas Principais

**1. Lista de Conversas**
- Todos os amigos com quem você já conversou
- Última mensagem de cada conversa
- Badge vermelho com mensagens não lidas
- Timestamp da última mensagem

**2. Área de Chat**
- Header com avatar e nome do amigo
- Suas mensagens: fundo azul (direita)
- Mensagens do amigo: fundo cinza (esquerda)
- Scroll automático para última mensagem
- Timestamp em cada mensagem

**3. Input de Mensagem**
- Campo de texto arredondado
- Botão "Enviar" azul
- Atalho: **Enter** para enviar rápido

#### Segurança
- [✓] Só funciona entre **amigos aceitos**
- [✓] Validação automática no backend
- [✓] Marcação automática de leitura

### (!) Sistema de Notificações Aprimorado
- Notificações para pedidos de amizade
- Notificações para mensagens novas
- Notificações quando pedidos são aceitos
- Badges com contadores em tempo real

### 📋 Como Usar

**Para Enviar Pedido de Amizade:**
1. Veja uma postagem no feed
2. Clique em "+ Adicionar" ao lado do nome
3. Aguarde "Pedido de amizade enviado!"
4. O botão mudará para "... Pendente"

**Para Gerenciar Pedidos:**
1. Menu → "Amigos"
2. Clique na tab "Pedidos"
3. Clique em "[✓] Aceitar" ou "[X] Recusar"

**Para Enviar Mensagens:**
1. Menu → "Correspondências"
2. Clique em uma conversa existente
3. Digite e pressione Enter ou "Enviar"
4. *Nota: Só funciona com amigos aceitos*

**Para Ativar Tema Escuro:**
1. Clique na sua foto/nome (canto superior direito)
2. Clique em "Alternar Tema"
3. Preferência é salva automaticamente

---

## 🚀 INÍCIO RÁPIDO

### Requisitos
- Node.js >= 18.0
- Python3 >= 3.8

### Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Inicializar banco de dados
npm run init-db

# 3. Iniciar servidores
./iniciar.sh
```

**Acesso:**
- Local: http://localhost:8000/site.html
- Rede: http://SEU-IP:8000/site.html

### Comandos Úteis

```bash
npm start              # Inicia apenas backend
npm run init-db        # Recria banco de dados
./iniciar.sh           # Inicia backend + frontend
./expor-internet.sh    # Expõe na internet (ngrok)
```

---

## ✨ FUNCIONALIDADES

### Autenticação
- [✓] Login e registro com JWT
- [✓] Senha criptografada (bcrypt)
- [✓] Token válido por 7 dias

### Feed e Posts
- [✓] Criar postagens
- [✓] Curtir/descurtir
- [✓] Comentar
- [✓] Feed em tempo real

### Perfil
- [✓] Editar perfil (nome, bio, avatar, interesses)
- [✓] Ver perfil de outros usuários
- [✓] Estatísticas (posts, amigos, likes)

### Amigos
- [✓] Sistema de pedidos de amizade (enviar/aceitar/recusar)
- [✓] Botão de adicionar amigo nos posts
- [✓] Categoria "Pedidos" com contador
- [✓] Buscar usuários
- [✓] Ver lista de amigos
- [✓] Indicador de amizade mútua
- [✓] Notificações de pedidos

### Correspondências (Mensagens)
- [✓] Chat privado com amigos
- [✓] Lista de conversas
- [✓] Badge de mensagens não lidas
- [✓] Histórico completo de mensagens
- [✓] Interface intuitiva tipo WhatsApp
- [✓] Notificações de novas mensagens

### Conselhos
- [✓] Criar conselhos
- [✓] Ver conselhos do dia
- [✓] Categorias (saúde, carreira, relacionamentos, etc)

### Interface (v3.0.0)
- [✓] Tema escuro/claro com persistência
- [✓] Dropdowns de notificações e menu
- [✓] Design minimalista
- [✓] Símbolos ASCII consistentes

### Atualizações em Tempo Real
- [✓] Polling a cada 10 segundos
- [✓] Notificações de likes e comentários
- [✓] Atualização automática do feed

---

## 🏗️ ARQUITETURA

### Stack
```
Frontend: HTML5 + Tailwind CSS + JavaScript ES6+
Backend:  Node.js + Express + SQLite
Auth:     JWT + bcrypt
```

### Estrutura de Arquivos
```
redesocial/
├── server.js              # Backend Express
├── init-database.js       # Setup do banco
├── database.sqlite        # Banco SQLite
├── site.html              # Interface principal
├── app.js                 # Lógica frontend
├── api.js                 # Cliente HTTP
├── state.js               # State management
├── utils.js               # Utilitários
├── iniciar.sh             # Script de start
├── expor-internet.sh      # Exposição internet
└── DOCUMENTACAO.md        # Esta documentação
```

### Fluxo de Dados
```
1. Usuário acessa site.html
2. Login via POST /api/auth/login
3. Backend retorna JWT token
4. Token salvo no localStorage
5. Todas requisições usam token no header
6. Polling verifica atualizações a cada 10s
7. Frontend atualiza automaticamente
```

---

## 📡 API

**Base URL:** `http://localhost:3000/api`

**Autenticação:** Header `Authorization: Bearer {token}`

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

## 🗄️ BANCO DE DADOS

### Tabelas (9)

```sql
users           # Usuários
├─ id, name, email, password, avatar, bio, created_at

posts           # Postagens
├─ id, user_id, content, created_at

likes           # Curtidas
├─ id, user_id, post_id, created_at

comments        # Comentários
├─ id, user_id, post_id, content, created_at

followers       # Amigos (+ status: pending/accepted)
├─ id, follower_id, following_id, status, created_at

user_interests  # Interesses do usuário
├─ id, user_id, interest

advices         # Conselhos
├─ id, title, content, category, author_id, created_at

notifications   # Notificações (+ related_user_id)
├─ id, user_id, type, content, related_user_id, is_read, created_at

messages        # Mensagens privadas (NOVO)
├─ id, from_user_id, to_user_id, content, is_read, created_at
```

### Relacionamentos
```
users (1) ──┬── (N) posts
            ├── (N) likes
            ├── (N) comments
            ├── (N) user_interests
            ├── (N) followers
            └── (N) notifications

posts (1) ──┬── (N) likes
            └── (N) comments
```

---

## 🌐 ACESSO EXTERNO

### Rede Local (Automático)

```bash
./iniciar.sh
# Compartilhe: http://SEU-IP:8000/site.html
```

**Liberar firewall:**
```bash
sudo ufw allow 3000
sudo ufw allow 8000
```

### Internet (ngrok)

**1. Instalar:**
```bash
sudo snap install ngrok
```

**2. Configurar:**
- Cadastre em https://dashboard.ngrok.com/signup
- Pegue o token
- Execute: `ngrok config add-authtoken SEU_TOKEN`

**3. Usar:**
```bash
# Terminal 1
./iniciar.sh

# Terminal 2
./expor-internet.sh
# Escolha opção 1 (ngrok)
```

**4. Configurar backend:**
- Acesse: `https://SEU-URL.ngrok.io/config.html`
- Digite a URL do backend: `https://api-url.ngrok.io/api`
- Salve e acesse o site

---

## 🔧 SOLUÇÃO DE PROBLEMAS

### Backend não inicia

```bash
# Verificar se porta está ocupada
sudo lsof -ti:3000 | xargs kill -9

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro "Cannot connect"

```bash
# Reiniciar tudo
pkill -f "node server.js"
pkill -f "python3 -m http.server"
./iniciar.sh
```

### Banco de dados corrompido

```bash
rm database.sqlite
npm run init-db
```

### Token inválido

```javascript
// No console do navegador
localStorage.clear()
// Faça login novamente
```

### Polling não funciona

```javascript
// No console do navegador
app.stopPolling()
app.startPolling()
```

### CORS bloqueado

Já configurado para aceitar qualquer origem. Se persistir:
```bash
# Verificar se backend está com CORS ativado
curl -H "Origin: http://localhost:8000" -I http://localhost:3000/api
```

---

## 📝 CHANGELOG

### [2.0.0] - 30/10/2025 🎉

**✨ Novidades Principais:**
- 🤝 **Sistema de Pedidos de Amizade**
  - Botão "Adicionar" em cada post
  - Categoria "Pedidos" na aba Amigos
  - Aceitar/recusar pedidos
  - Notificações automáticas
  - Badge contador de pedidos pendentes
  
- 💬 **Correspondências (Mensagens Privadas)**
  - Chat privado entre amigos
  - Lista de conversas com últimas mensagens
  - Badge de mensagens não lidas
  - Interface moderna tipo WhatsApp
  - Histórico completo de mensagens
  
- 🔔 **Melhorias nas Notificações**
  - Notificações para pedidos de amizade
  - Notificações para novas mensagens
  - Notificações quando pedidos são aceitos
  - Sistema de badges visuais

**🔧 Mudanças Técnicas:**
- Nova tabela `messages` no banco de dados
- Coluna `status` na tabela `followers` (pending/accepted)
- Coluna `related_user_id` na tabela `notifications`
- 8 novas rotas de API para mensagens
- 5 novas rotas de API para pedidos de amizade
- Método `sendFriendRequest()` no frontend
- Métodos `loadConversations()` e `openChat()` no frontend

### [1.0.0] - 30/10/2025

**✨ Implementado:**
- Sistema completo de autenticação (JWT + bcrypt)
- Feed de postagens com likes e comentários
- Perfis editáveis com interesses
- Sistema de amigos básico (adicionar/remover/buscar)
- Conselhos do dia com categorias
- Notificações em tempo real (polling 10s)
- Busca de usuários
- Acesso externo (rede local + internet)
- Scripts de automação (iniciar.sh, expor-internet.sh)

**🔧 Tecnologias:**
- Backend: Node.js 18 + Express 4.18 + SQLite 5.1
- Frontend: HTML5 + Tailwind CSS + JavaScript ES6+
- Auth: JWT 9.0 + bcryptjs 2.4

**🐛 Corrigido:**
- Erro ao carregar perfil de outros usuários
- CORS bloqueando requisições externas
- TypeScript moduleResolution deprecated
- Problemas com portas ocupadas

---

## 📌 NOTAS

### Estrutura do Código

**Frontend (app.js):**
```javascript
App                    # Controller principal
├─ handleLogin()       # Processa login
├─ loadFeed()          # Carrega feed
├─ showEditProfile()   # Modal editar perfil
├─ loadFriends()       # Lista amigos
├─ loadAdvices()       # Lista conselhos
├─ startPolling()      # Inicia atualizações
└─ stopPolling()       # Para atualizações
```

**API Client (api.js):**
```javascript
ApiService
├─ login(credentials)
├─ getFeed()
├─ createPost(data)
├─ addFriend(userId)
└─ getUpdates(since)
```

### Variáveis de Ambiente

Arquivo `.env`:
```env
PORT=3000
DB_PATH=./database.sqlite
JWT_SECRET=seu_segredo_aqui
CORS_ORIGIN=*
```

### Segurança

- ✅ Senhas com bcrypt (hash)
- ✅ JWT para autenticação
- ✅ Prepared statements (SQL injection)
- ✅ CORS configurado
- ⚠️ Em produção: alterar JWT_SECRET, restringir CORS, usar HTTPS

---

## 🎯 PRÓXIMAS VERSÕES

**Planejado para v1.1.0:**
- Editar/deletar posts
- Upload de imagens
- Chat em tempo real (WebSocket)
- Paginação do feed
- Temas claro/escuro

---

**Última atualização:** 30 de outubro de 2025  
**Mantenha este arquivo atualizado ao adicionar novas funcionalidades!**
