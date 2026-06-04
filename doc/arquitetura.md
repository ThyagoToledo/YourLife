# Arquitetura e Banco de Dados

Este documento descreve os detalhes de engenharia, stack tecnológica, fluxo de dados, normalização e o schema detalhado do banco de dados da rede social YourLife.

---

## Índice

* [Stack Tecnológica](#stack-tecnológica)
* [Estrutura de Arquivos](#estrutura-de-arquivos)
* [Fluxo de Dados em Produção](#fluxo-de-dados-em-produção)
* [Normalização de Dados](#normalização-de-dados)
* [Arquitetura Serverless](#arquitetura-serverless)
* [Banco de Dados Neon PostgreSQL](#banco-de-dados-neon-postgresql)
  * [Tabelas e Schemas](#tabelas-e-schemas)
  * [Relacionamentos](#relacionamentos)

---

## Stack Tecnológica

O YourLife é construído sobre uma arquitetura estática no frontend consumindo microsserviços serverless no backend:

* **Frontend**: HTML5, Tailwind CSS (utilizado via CDN oficial) e JavaScript puro (ES6+) para renderização dinâmica baseada no DOM.
* **Backend**: Node.js (versão 18+) utilizando a framework Express para roteamento de endpoints da API REST.
* **Banco de Dados**: Neon PostgreSQL (versão 15+), um banco de dados serverless na nuvem com escalabilidade dinâmica.
* **Driver de Conexão**: `@vercel/postgres` (versão 0.10.0) integrado nativamente.
* **Segurança e Autenticação**: JWT (JSON Web Tokens) e criptografia de senhas com `bcryptjs` (salt rounds: 10).
* **Hospedagem e Infraestrutura**: Vercel Serverless Functions com deploy contínuo integrado ao GitHub.

---

## Estrutura de Arquivos

```
YourLife/
├── server.js              # Backend Express (Rotas da API)
├── index.html             # Página de Landing / Tela de Login
├── site.html              # Interface principal do aplicativo
├── app.js                 # Lógica de controle do frontend
├── api.js                 # Cliente de requisições HTTP (fetch wrapper)
├── state.js               # Gerenciador de estado local do app
├── utils.js               # Utilitários de data e formatação
├── types.ts               # Definições de tipos TypeScript
├── vercel.json            # Configuração de rotas Vercel
├── package.json           # Dependências e scripts do projeto
├── .env                   # Variáveis de ambiente locais (ignorado no Git)
└── README.md              # Documentação principal
```

---

## Fluxo de Dados em Produção

O tráfego de dados ocorre de forma totalmente desacoplada e assíncrona:

1. O usuário acessa o domínio de produção: `https://your-life-gamma.vercel.app`.
2. A rede de borda da Vercel (Edge Network) entrega imediatamente o arquivo estático `index.html`.
3. Ao logar via formulário, uma chamada HTTP `POST /api/auth/login` é enviada e processada no backend hospedado em serverless functions (`server.js`).
4. O backend realiza a consulta de autenticação no banco de dados Neon PostgreSQL via conexão poolizada.
5. Em caso de sucesso, um token JWT é gerado pelo servidor e retornado ao navegador, sendo persistido de forma segura no `localStorage`.
6. Todas as chamadas subsequentes incluem o token JWT nos cabeçalhos HTTP (`Authorization: Bearer {token}`).
7. Um mecanismo de **polling ativo** no frontend realiza chamadas HTTP a cada 10 segundos para buscar novas mensagens, curtidas, comentários e notificações, atualizando o DOM em tempo real.

---

## Normalização de Dados

### Correção de Nomenclatura (v3.0.1)

O banco de dados PostgreSQL utiliza a convenção `snake_case` (ex: `created_at`, `user_id`), enquanto a lógica em JavaScript do frontend utiliza `camelCase` (ex: `createdAt`, `userId`). Para evitar falhas de formatação em datas e renderização de imagens, implementamos uma camada de normalização de dados no frontend assim que as respostas HTTP são interceptadas:

```javascript
// Exemplo prático de normalização de postagens
const normalizedPost = {
    id: post.id,
    content: post.content,
    created_at: post.created_at,           // Preserva snake_case do banco para cálculo de data
    author: {
        id: post.user_id,                  // user_id -> id
        name: post.user_name,              // user_name -> name
        avatar: post.user_avatar           // user_avatar -> avatar
    },
    likes: parseInt(post.likes_count) || 0,
    isLiked: parseInt(post.user_liked) > 0
};
```

### Principais Campos Mapeados

* **Conversas**: `friend_id` mapeado para `userId`, `friend_name` para `name`, `friend_avatar` para `avatar` e `unread_count` para `unreadCount`.
* **Mensagens**: `from_user_id` é analisado localmente para definir se é de autoria própria (`isFromMe`), e os dados de autoria do remetente são estruturados.
* **Solicitações de Amizade**: `id` mapeado para `requesterId` e `created_at` para `requestedAt`.

---

## Arquitetura Serverless

```
Vercel Edge Network (Distribuição estática)
       ↓
Arquivos Estáticos (HTML/CSS/JS)
       ↓
Rotas da API (/api/*) → server.js (Executado em Vercel Serverless Functions)
       ↓
Neon PostgreSQL (Banco Serverless com Connection Pool integrado)
```

---

## Banco de Dados Neon PostgreSQL

O banco é estruturado em **9 tabelas** relacionais com chaves estrangeiras vinculadas para integridade referencial.

### Tabelas e Schemas

#### 1. users (Usuários)
Armazena as contas, dados de perfil e senhas criptografadas.
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

#### 2. posts (Postagens)
Registra as publicações realizadas no feed pelos usuários.
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. likes (Curtidas)
Tabela de relacionamento muitos-para-muitos que gerencia os likes nas postagens.
```sql
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);
```

#### 4. comments (Comentários)
Comentários associados a publicações específicas.
```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. followers (Sistema de Amizade)
Registra as solicitações e o status das amizades (pendentes ou aceitas).
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

#### 6. user_interests (Interesses)
Tags de interesse pessoal associadas ao perfil de cada usuário.
```sql
CREATE TABLE user_interests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    interest TEXT NOT NULL
);
```

#### 7. advices (Conselhos)
Postagens temáticas de conselhos acessíveis no feed da comunidade.
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

#### 8. notifications (Notificações)
Histórico de interações recebidas para atualizar o sino do header.
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

#### 9. messages (Mensagens Privadas)
Armazena a conversa individual do chat (WhatsApp-style) com marcação de leitura.
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
users (1) ──┬── (N) posts (user_id)
            ├── (N) likes (user_id)
            ├── (N) comments (user_id)
            ├── (N) user_interests (user_id)
            ├── (N) followers (follower_id)
            ├── (N) followers (following_id)
            ├── (N) notifications (user_id)
            ├── (N) notifications (related_user_id)
            ├── (N) messages (from_user_id)
            └── (N) messages (to_user_id)

posts (1) ──┬── (N) likes (post_id)
            └── (N) comments (post_id)
```
