# Referência da API REST (API Reference)

Este documento contém a especificação de todas as rotas de API, parâmetros necessários, headers de autorização e exemplos de payloads de requisição e resposta do YourLife.

---

## Índice

* [Visão Geral](#visão-geral)
* [Autenticação](#autenticação)
* [Usuários](#usuários)
* [Feed e Postagens](#feed-e-postagens)
* [Amigos](#amigos)
* [Mensagens (Correspondências)](#mensagens-correspondências)
* [Conselhos](#conselhos)
* [Notificações](#notificações)
* [Atualizações em Tempo Real](#atualizações-em-tempo-real)

---

## Visão Geral

* **Base URL em Produção**: `https://your-life-gamma.vercel.app/api`
* **Base URL Local**: `http://localhost:3000/api`
* **Autenticação**: O acesso a rotas protegidas exige o envio de um JSON Web Token (JWT) no cabeçalho HTTP:
  ```http
  Authorization: Bearer {token_jwt_aqui}
  ```
* **Formatos de Erro**: Quando um endpoint falha ou é rejeitado, ele retorna um status HTTP de erro correspondente e o seguinte formato JSON:
  ```json
  {
    "success": false,
    "error": "Descrição detalhada da falha"
  }
  ```

---

## Autenticação

### POST /api/auth/register
Registra um novo usuário no banco de dados.

* **Payload de Requisição:**
  ```json
  {
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha_segura_aqui"
  }
  ```
* **Payload de Resposta (Sucesso):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com"
    }
  }
  ```

### POST /api/auth/login
Autentica uma conta de usuário existente.

* **Payload de Requisição:**
  ```json
  {
    "email": "joao@email.com",
    "password": "senha_segura_aqui"
  }
  ```
* **Payload de Resposta (Sucesso):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com"
    }
  }
  ```

---

## Usuários

### GET /api/users/me
Retorna os dados do perfil do usuário autenticado no momento.
*Exige token JWT.*

* **Payload de Resposta:**
  ```json
  {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "avatar": "url_do_avatar.png",
    "bio": "Minha biografia rápida...",
    "cover_image": "url_da_capa.png",
    "created_at": "2025-11-02T14:30:00.000Z"
  }
  ```

### GET /api/users/:id
Retorna os dados de perfil de um usuário específico pesquisado pelo seu ID.
*Exige token JWT.*

### PUT /api/users/me
Atualiza as informações cadastrais do perfil do próprio usuário autenticado.
*Exige token JWT.*

* **Payload de Requisição:**
  ```json
  {
    "name": "João S. Silva",
    "bio": "Nova biografia atualizada",
    "avatar": "nova_url_do_avatar.png",
    "cover_image": "nova_url_da_capa.png"
  }
  ```
* **Payload de Resposta:** Retorna o objeto de perfil atualizado no mesmo formato do `GET /api/users/me`.

### GET /api/users/search/:query
Pesquisa usuários no banco de dados através de busca textual pelo nome.
*Exige token JWT.*

---

## Feed e Postagens

### GET /api/feed
Retorna a lista das últimas 50 publicações compartilhadas no feed de forma ordenada.
*Exige token JWT.*

* **Payload de Resposta (Array de Objetos):**
  ```json
  [
    {
      "id": 5,
      "user_id": 2,
      "content": "Hoje é um lindo dia para codificar!",
      "created_at": "2025-11-02T16:45:00.000Z",
      "user_name": "Maria Souza",
      "user_avatar": "url_da_maria.png",
      "likes_count": "3",
      "comments_count": "1",
      "user_liked": "1"
    }
  ]
  ```

### POST /api/posts
Cria uma nova publicação textual no feed.
*Exige token JWT.*

* **Payload de Requisição:**
  ```json
  {
    "content": "Conteúdo da minha nova postagem aqui..."
  }
  ```

### POST /api/posts/:id/like
Adiciona uma curtida (like) na postagem identificada pelo ID fornecido na rota.
*Exige token JWT.*

### DELETE /api/posts/:id/like
Remove a curtida da postagem identificada pelo ID fornecido na rota.
*Exige token JWT.*

### GET /api/posts/:id/comments
Retorna a lista de comentários inseridos em um post.
*Exige token JWT.*

### POST /api/posts/:id/comments
Adiciona um novo comentário em uma postagem.
*Exige token JWT.*

* **Payload de Requisição:**
  ```json
  {
    "content": "Excelente post!"
  }
  ```

### PUT /api/posts/:postId/comments/:commentId
Edita o texto de um comentário existente. O autor do comentário deve ser o usuário autenticado.
*Exige token JWT.*

* **Payload de Requisição:**
  ```json
  {
    "content": "Texto do comentário corrigido e atualizado"
  }
  ```

### DELETE /api/posts/:postId/comments/:commentId
Exclui um comentário. O autor do comentário ou o autor da postagem deve ser o usuário autenticado.
*Exige token JWT.*

---

## Amigos

### GET /api/friends
Retorna a lista de todos os amigos (conexões aceitas) do usuário autenticado.
*Exige token JWT.*

### GET /api/users/:id/friends
Retorna a lista de amigos públicos de um outro usuário pelo ID.
*Exige token JWT.*

### GET /api/friends/requests
Retorna a lista de solicitações de amizade recebidas e pendentes de aceitação.
*Exige token JWT.*

### GET /api/friends/status/:userId
Retorna o status atual de relacionamento entre você e o usuário especificado.
*Exige token JWT.*

* **Payload de Resposta:**
  ```json
  {
    "status": "pending" 
  }
  ```
  *(Status possíveis: `none`, `pending`, `accepted`, `sent`)*

### POST /api/friends/request
Envia uma solicitação de amizade para um usuário.
*Exige token JWT.*

* **Payload de Requisição:**
  ```json
  {
    "friend_id": 3
  }
  ```

### PUT /api/friends/accept/:requesterId
Aceita o pedido de amizade pendente enviado pelo usuário (`requesterId`).
*Exige token JWT.*

### DELETE /api/friends/reject/:requesterId
Rejeita o pedido de amizade pendente enviado pelo usuário (`requesterId`).
*Exige token JWT.*

### DELETE /api/friends/:id
Desfaz a amizade existente com o usuário especificado pelo ID.
*Exige token JWT.*

---

## Mensagens (Correspondências)

### GET /api/messages/conversations
Retorna a lista de conversas ativas do usuário, contendo a última mensagem enviada/recebida e a contagem de mensagens não lidas.
*Exige token JWT.*

* **Payload de Resposta:**
  ```json
  [
    {
      "friend_id": 2,
      "friend_name": "Maria Souza",
      "friend_avatar": "url_da_maria.png",
      "last_message": "Tudo certo para amanhã?",
      "last_message_time": "2025-11-02T18:12:00.000Z",
      "unread_count": 2
    }
  ]
  ```

### GET /api/messages/:userId
Busca o histórico completo de mensagens privadas trocadas entre o usuário autenticado e o amigo (`userId`).
*Exige token JWT.*

### POST /api/messages
Envia uma nova mensagem privada para um amigo.
*Exige token JWT.*

* **Payload de Requisição:**
  ```json
  {
    "to_user_id": 2,
    "content": "Olá Maria, tudo bem?"
  }
  ```

### PUT /api/messages/:userId/read
Marca todas as mensagens recebidas do amigo (`userId`) como lidas.
*Exige token JWT.*

---

## Conselhos

### GET /api/advices
Retorna a lista de conselhos criados pela comunidade. Aceita filtros opcionais de categoria via query parameter (ex: `/api/advices?category=carreira`).
*Exige token JWT.*

### POST /api/advices
Publica um novo conselho para a comunidade.
*Exige token JWT.*

* **Payload de Requisição:**
  ```json
  {
    "title": "Aprenda a ouvir",
    "content": "Ouvir com atenção é o primeiro passo para o sucesso...",
    "category": "relacionamentos"
  }
  ```

---

## Notificações

### GET /api/notifications
Lista todas as notificações recebidas pelo usuário autenticado.
*Exige token JWT.*

### PUT /api/notifications/:id/read
Marca uma notificação específica como lida no banco de dados.
*Exige token JWT.*

---

## Atualizações em Tempo Real

### GET /api/updates
Verifica de forma leve se houve atualizações em postagens, curtidas, novos comentários ou mensagens desde o último timestamp verificado. Utilizado no mecanismo de polling.
*Exige token JWT.*

* **Parâmetro de URL (Obrigatório):** `since` (ISO Timestamp).
* **Payload de Resposta:**
  ```json
  {
    "success": true,
    "updates": {
      "likes": [],
      "comments": [],
      "notifications": [],
      "hasUpdates": false
    }
  }
  ```
