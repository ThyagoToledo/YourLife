# Solução de Problemas e Histórico de Alterações (Changelog)

Este documento detalha o diagnóstico e correção de erros comuns encontrados em ambiente local e produção, além do histórico completo de lançamentos e alterações do YourLife.

---

## Índice

* [Solução de Problemas Comuns](#solução-de-problemas-comuns)
  * [Erro de Data Relativa ("NaNa atrás")](#erro-de-data-relativa-nana-atrás)
  * [Erro: relation does not exist](#erro-relation-does-not-exist)
  * [Erro: missing_connection_string](#erro-missing_connection_string)
  * [A Interface exibe a palavra "Object" em vez de dados](#a-interface-exibe-a-palavra-object-em-vez-de-dados)
  * [Token Inválido ou Sessão Expirada](#token-inválido-ou-sessão-expirada)
  * [Erro de CORS em Produção](#erro-de-cors-em-produção)
  * [Falha no Build da Vercel](#falha-no-build-da-vercel)
* [Monitoramento e Diagnóstico](#monitoramento-e-diagnóstico)
  * [Leitura de Logs em Produção](#leitura-de-logs-em-produção)
  * [Consulta de Status do Banco de Dados](#consulta-de-status-do-banco-de-dados)
* [Histórico de Alterações (Changelog)](#histórico-de-alterações-changelog)

---

## Solução de Problemas Comuns

### Erro de Data Relativa ("NaNa atrás")

* **Causa**: Esse problema clássico em timestamps ocorria por divergência de nomenclatura. O banco de dados PostgreSQL retorna campos em `snake_case` (ex: `created_at`), enquanto o script do frontend buscava pelas propriedades em `camelCase` (ex: `createdAt` ou `timestamp`), resultando em valores indefinidos (`undefined`) sendo passados ao formatador de datas.
* **Solução**: Corrigido na versão 3.0.1 por meio da implementação de uma camada de normalização de dados no frontend. Se o erro reaparecer localmente:
  1. Execute `git pull origin main` para atualizar os scripts locais.
  2. Pressione `Ctrl + Shift + R` no navegador para forçar a limpeza de cache dos arquivos estáticos JS (`app.js` e `utils.js`).

---

### Erro: relation does not exist

* **Causa**: As tabelas relacionais do banco de dados ainda não foram criadas na instância ativa do PostgreSQL (Neon ou local).
* **Solução**:
  1. Acesse o console administrativo do banco de dados (ex: https://console.neon.tech/).
  2. Abra o **SQL Editor** do projeto.
  3. Copie o script SQL com a criação das 9 tabelas presente em [arquitetura.md](arquitetura.md), cole no editor e execute.
  4. Rode a consulta de verificação:
     ```sql
     SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
     ```

---

### Erro: missing_connection_string

* **Causa**: O backend Express foi iniciado sem a configuração correta da variável de ambiente com as credenciais do banco.
* **Solução**:
  * **Local**: Certifique-se de que o arquivo `.env` está presente na raiz com a variável `POSTGRES_URL` devidamente preenchida.
  * **Produção (Vercel)**: Acesse a aba **Storage** do seu projeto na Vercel e reconecte/linke o banco de dados Neon para repovoar as variáveis de conexão.

---

### A Interface exibe a palavra "Object" em vez de dados

* **Causa**: Acontece quando o endpoint da API Express retorna um objeto JSON de encapsulamento (ex: `{ posts: [...] }`) em vez de retornar a lista pura (array), que é a estrutura esperada pelo frontend para iteração.
* **Solução**: Certifique-se de que o backend envia o array diretamente (ex: `res.json(posts)`) e que a resposta local está atualizada fazendo o pull do repositório remoto.

---

### Token Inválido ou Sessão Expirada

* **Causa**: O token JWT armazenado no navegador expirou (prazo de 7 dias) ou a chave `JWT_SECRET` foi alterada no backend.
* **Solução**: Abra o console de desenvolvedor do navegador (F12), vá na aba "Console" e execute o comando abaixo para limpar os dados antigos e depois recarregue a página para fazer login novamente:
  ```javascript
  localStorage.clear();
  location.reload();
  ```

---

### Erro de CORS em Produção

* **Causa**: Bloqueio de requisições de origem cruzada devido à ausência ou erro na variável de ambiente `CORS_ORIGIN`.
* **Solução**: No Dashboard da Vercel, nas variáveis de ambiente, garanta que a chave `CORS_ORIGIN` esteja configurada com o valor `*` ou com o domínio oficial da sua página.

---

### Falha no Build da Vercel

* **Causa**: Geralmente causada por dependências ausentes no `package.json` ou arquivos de build mal configurados.
* **Solução**:
  1. Verifique os logs de build no painel da Vercel.
  2. Assegure-se de que o arquivo `package.json` possui todas as dependências requeridas (como `@vercel/postgres`, `express`, `cors`, `jsonwebtoken` e `bcryptjs`).

---

## Monitoramento e Diagnóstico

### Leitura de Logs em Produção

Caso o backend em produção apresente comportamentos inesperados, você pode ler os logs de execução em tempo real utilizando a CLI da Vercel no terminal:

```bash
# 1. Instalar a CLI globalmente
npm install -g vercel

# 2. Conectar e acompanhar os logs do projeto em produção
vercel logs your-life-gamma --follow
```

### Consulta de Status do Banco de Dados

Você pode rodar consultas SQL rápidas pelo editor do Neon para verificar a integridade física e quantidade de registros nas tabelas da rede social:

```sql
-- Contagem de registros por tabela principal
SELECT 'users' as tabela, COUNT(*) FROM users
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;
```

---

## Histórico de Alterações (Changelog)

### Versão 3.0.1 (02/11/2025)

#### Correções e Ajustes
* **Data Relativa Corrigida**: Mapeamento do campo `post.timestamp` corrigido para `post.created_at` em conformidade com o retorno do PostgreSQL.
* **Mensagens e Conversas**: Campos `lastMessageAt` e `createdAt` normalizados e convertidos nas camadas do cliente HTTP.
* **Robustez nas Datas**: Adicionado tratamento preventivo com `isNaN()` e validações de data nula em `DateUtils.formatRelativeTime()`.
* **Proteção contra Falhas de Loop**: Adicionado fallback de array vazio (`|| []`) ao renderizar comentários de postagens.

---

### Versão 3.0.0 (02/11/2025)

#### Nova Infraestrutura de Produção
* **PostgreSQL Neon**: Migração total da persistência local de SQLite3 para banco Neon PostgreSQL serverless na nuvem.
* **Deploy na Vercel**: Adaptação da lógica do backend Express para rodar em Vercel Serverless Functions.
* **Deploy Contínuo**: Integração de deploy automático acionado por push na branch `main` do GitHub.
* **Limpeza de Bibliotecas**: Desinstalação dos pacotes obsoletos `sqlite3` e remoção do arquivo local de banco `database.sqlite`.

---

### Versão 2.0.0 (30/10/2025)

#### Novas Funcionalidades
* **Sistema de Amizades**: Botão rápido de adicionar amigo nos posts do feed, tela de gerenciamento de solicitações e aceitação mútua.
* **Chat Privado (Correspondências)**: Criação de tela de chat estilo WhatsApp, listagem de conversas ativas e contagem de mensagens não lidas.
* **Notificações**: Alertas em tempo real integrados ao header para novos convites, likes e mensagens privadas.

---

### Versão 1.0.0 (30/10/2025)

#### Lançamento Inicial
* **Autenticação**: Lógica de registro e login com encriptação de senhas via JWT.
* **Feed Básico**: Postagens textuais simples com contador de curtidas e comentários.
* **Perfil do Usuário**: Exibição de interesses e dados biográficos editáveis.
* **Mecanismo de Polling**: Atualização assíncrona automática de dados a cada 10 segundos no frontend.
