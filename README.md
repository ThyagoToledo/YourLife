# YOUR LIFE - Rede Social

> Conecte-se com quem importa

**Versao:** 3.0.0 | **Atualizado em:** Novembro 2025 | **Status:** Pronto para Vercel

---

## INDICE

1. [Deploy Rapido](#deploy-rapido)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias](#tecnologias)
4. [Desenvolvimento Local](#desenvolvimento-local)
5. [Variaveis de Ambiente](#variaveis-de-ambiente)
6. [Banco de Dados](#banco-de-dados)
7. [API Reference](#api-reference)
8. [Solucao de Problemas](#solucao-de-problemas)
9. [Changelog](#changelog)

---

## DEPLOY RAPIDO

### Opcao 1: Via Interface do Vercel (Recomendado)

**Passo 1: Criar repositorio no GitHub**
- Acesse: https://github.com/new
- Nome: `yourlife`
- Clique em "Create repository"

**Passo 2: Conectar ao GitHub**
```bash
git remote add origin https://github.com/SEU-USUARIO/yourlife.git
git branch -M main
git push -u origin main
```

**Passo 3: Deploy no Vercel**
- Acesse: https://vercel.com
- Login com GitHub
- Clique em "New Project"
- Importe seu repositorio
- Configure Environment Variables:
  - `JWT_SECRET` = (gere com comando abaixo)
  - `NODE_ENV` = production
- Clique em "Deploy"

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Opcao 2: Via CLI (Mais Rapido)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Resultado:** Seu site estara no ar em `https://seu-projeto.vercel.app`

---

## FUNCIONALIDADES

### Interface v3.0.0

**Tela de Login**
- Design centralizado e minimalista
- Logo circular no centro
- Nome "Your Life" em destaque
- Formulario de login abaixo
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

## ARQUITETURA

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

##  API

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

## BANCO DE DADOS

### Tabelas (9)

```sql
users           # Usuarios
|-- id, name, email, password, avatar, bio, created_at

posts           # Postagens
|-- id, user_id, content, created_at

likes           # Curtidas
|-- id, user_id, post_id, created_at

comments        # Comentarios
|-- id, user_id, post_id, content, created_at

followers       # Amigos (+ status: pending/accepted)
|-- id, follower_id, following_id, status, created_at

user_interests  # Interesses do usuario
|-- id, user_id, interest

advices         # Conselhos
|-- id, title, content, category, author_id, created_at

notifications   # Notificacoes (+ related_user_id)
|-- id, user_id, type, content, related_user_id, is_read, created_at

messages        # Mensagens privadas (NOVO)
|-- id, from_user_id, to_user_id, content, is_read, created_at
```

### Relacionamentos
```
users (1) --|-- (N) posts
            |-- (N) likes
            |-- (N) comments
            |-- (N) user_interests
            |-- (N) followers
            |-- (N) notifications

posts (1) --|-- (N) likes
            |-- (N) comments
```

---

## ACESSO EXTERNO

### Rede Local (Automatico)

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
# Escolha opcao 1 (ngrok)
```

**4. Configurar backend:**
- Acesse: `https://SEU-URL.ngrok.io/config.html`
- Digite a URL do backend: `https://api-url.ngrok.io/api`
- Salve e acesse o site

---

## SOLUCAO DE PROBLEMAS

### Backend nao inicia

```bash
# Verificar se porta esta ocupada
sudo lsof -ti:3000 | xargs kill -9

# Reinstalar dependencias
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

### Token invalido

```javascript
// No console do navegador
localStorage.clear()
// Faca login novamente
```

### Polling nao funciona

```javascript
// No console do navegador
app.stopPolling()
app.startPolling()
```

### CORS bloqueado

Ja configurado para aceitar qualquer origem. Se persistir:
```bash
# Verificar se backend esta com CORS ativado
curl -H "Origin: http://localhost:8000" -I http://localhost:3000/api
```

---

## CHANGELOG

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

## NOTAS

### Estrutura do Codigo

**Frontend (app.js):**
```javascript
App                    # Controller principal
|-- handleLogin()       # Processa login
|-- loadFeed()          # Carrega feed
|-- showEditProfile()   # Modal editar perfil
|-- loadFriends()       # Lista amigos
|-- loadAdvices()       # Lista conselhos
|-- startPolling()      # Inicia atualizacoes
|-- stopPolling()       # Para atualizacoes
```

**API Client (api.js):**
```javascript
ApiService
|-- login(credentials)
|-- getFeed()
|-- createPost(data)
|-- addFriend(userId)
|-- getUpdates(since)
```

### Variaveis de Ambiente

Arquivo `.env`:
```env
PORT=3000
DB_PATH=./database.sqlite
JWT_SECRET=seu_segredo_aqui
CORS_ORIGIN=*
```

### Seguranca

- [OK] Senhas com bcrypt (hash)
- [OK] JWT para autenticacao
- [OK] Prepared statements (SQL injection)
- [OK] CORS configurado
- [!] Em producao: alterar JWT_SECRET, restringir CORS, usar HTTPS

---

## PROXIMAS VERSOES

**Planejado para v1.1.0:**
- Editar/deletar posts
- Upload de imagens
- Chat em tempo real (WebSocket)
- Paginacao do feed
- Temas claro/escuro

---

**Ultima atualizacao:** 30 de outubro de 2025  
**Mantenha este arquivo atualizado ao adicionar novas funcionalidades!**
