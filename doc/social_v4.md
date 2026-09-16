# Plataforma Social v4

Este documento descreve a atualização em desenvolvimento. Ela não deve ser considerada publicada até a migração, as credenciais e a validação em homologação estarem concluídas.

## Pré-requisitos

* Node.js 20 ou superior;
* PostgreSQL/Neon acessível por `POSTGRES_URL`;
* Vercel Blob para imagens;
* Amazon Rekognition para moderação automática;
* Ably para sinais instantâneos do chat;
* LiveKit para áudio, vídeo e tela.

Copie `.env.example` para `.env`, preencha somente no ambiente privado e execute:

```bash
npm install
npm run migrate
npm test
npm run type-check
npm start
```

## Fluxos

### Imagens

1. `POST /api/v2/media/uploads` cria uma intenção vinculada ao usuário.
2. `PUT /api/v2/media/:id/content` recebe JPEG, PNG ou WebP de até 5 MB.
3. O original vai para uma área privada de quarentena no Vercel Blob.
4. O Rekognition classifica a imagem; categorias bloqueadas produzem `rejected`.
5. Avatar, capa, post e imagem de comunidade aprovados ganham uma URL pública. Anexos de chat continuam privados e passam por `GET /api/v2/media/:id/content` com autorização.
6. Sem configuração do Rekognition, o estado é `review`; o arquivo não é publicado automaticamente.

Nunca aceite a URL fornecida pelo usuário como substituto desse fluxo. O banco guarda metadados e URLs; os bytes ficam no Blob.

### Chat, grupos e comunidades

`conversations` representa conversa direta, grupo ou canal. `conversation_members` é a fonte de autorização. Mensagens recebem `clientMessageId` para que uma repetição de envio não duplique conteúdo. O texto original é armazenado e o navegador aplica Marked seguido de DOMPurify com uma lista restrita de elementos.

O Ably transporta somente sinais com IDs. Após cada sinal ou reconexão, o cliente consulta a API e trata o PostgreSQL como fonte da verdade. Quando Ably está indisponível, o cliente consulta a conversa ativa a cada três segundos.

### Ligações

A API persiste convites e estados em `calls` e `call_participants`. Um token LiveKit curto só é emitido para participante aceito. A mídia não passa pelo banco. A interface permite escolher microfone e câmera; a seleção de saída usa o suporte disponível no navegador. Compartilhamento de tela sempre depende da escolha explícita apresentada pelo próprio navegador.

## Principais endpoints v2

| Método | Rota | Função |
| --- | --- | --- |
| GET/PATCH | `/api/v2/settings` | Preferências do chat |
| POST/PUT/GET | `/api/v2/media/...` | Intenção, envio, estado e leitura de mídia |
| PATCH | `/api/v2/profile/media` | Aplicar avatar ou capa aprovada |
| GET/POST | `/api/v2/conversations` | Listar e criar DMs/grupos |
| GET/POST | `/api/v2/conversations/:id/messages` | Histórico por cursor e envio |
| PATCH/DELETE | `/api/v2/messages/:id` | Editar ou remover mensagem própria |
| POST/GET | `/api/v2/communities` | Criar e listar comunidades do usuário |
| POST | `/api/v2/communities/:id/channels` | Criar canal autorizado |
| POST | `/api/v2/communities/:id/invites` | Criar convite com expiração e limite |
| POST/GET | `/api/v2/calls` | Iniciar e listar ligações |
| POST | `/api/v2/calls/:id/token` | Obter token LiveKit autorizado |
| PUT/DELETE | `/api/v2/blocks/:userId` | Bloquear ou desbloquear usuário |
| POST | `/api/v2/reports` | Registrar denúncia |

## Implantação segura

1. Criar um banco de homologação e backup verificável.
2. Executar `npm run migrate` nesse banco.
3. Configurar Blob, Rekognition, Ably e LiveKit no ambiente Preview da Vercel.
4. Testar duas contas, bloqueio, remoção de membro, upload rejeitado, reconexão e ligação em redes distintas.
5. Conferir as contagens antes/depois da migração `002_legacy_messages.sql`. Ela copia mensagens para o modelo novo e mantém a tabela antiga durante a transição.
6. Promover para produção somente após revisar custos, retenção, privacidade e política de apelação.

## Limitações atuais

* A migração não foi executada em banco real nesta entrega.
* Chamadas e moderação dependem de credenciais que não ficam no repositório.
* A interface inicial para criar grupos solicita IDs; deve ser substituída por seleção visual de amigos.
* Mensagens legadas continuam na tabela `messages` e na aba Correspondências durante a transição, mesmo após serem copiadas pela migração idempotente.
* Vídeo ao vivo e compartilhamento de tela não passam por classificação automática de conteúdo.
* Stories, busca avançada, hashtags e menções permanecem no backlog.
