# Guia de Desenvolvimento e Deploy

Este documento serve como guia prático para configurar o ambiente de desenvolvimento local, gerenciar variáveis de ambiente e realizar o deploy de produção do YourLife na Vercel conectado ao banco de dados Neon.

---

## Índice

* [Pré-requisitos e Ambiente](#pré-requisitos-e-ambiente)
* [Configuração do Ambiente Local](#configuração-do-ambiente-local)
* [Scripts Disponíveis](#scripts-disponíveis)
* [Gerenciamento de Variáveis de Ambiente](#gerenciamento-de-variáveis-de-ambiente)
  * [Desenvolvimento (.env)](#desenvolvimento-env)
  * [Produção (Vercel)](#produção-vercel)
* [Deploy em Produção (Vercel + Neon)](#deploy-em-produção-vercel--neon)
* [Checklist de Segurança](#checklist-de-segurança)

---

## Pré-requisitos e Ambiente

Para compilar, testar e executar a aplicação YourLife localmente, você precisa ter as seguintes ferramentas instaladas:

* **Node.js**: Versão 18.0.0 ou superior.
* **npm**: Versão 9.0.0 ou superior (instalado nativamente com o Node).
* **Python**: Versão 3.8 ou superior (requerido para scripts locais e algumas dependências de compilação de pacotes).
* **Banco de Dados**: Uma conta gratuita no [Neon](https://neon.tech) para dispor de um banco de dados PostgreSQL serverless na nuvem (ou uma instalação local do PostgreSQL 15+).

---

## Configuração do Ambiente Local

### 1. Obter Código e Dependências
Execute os comandos a seguir no terminal do seu computador para baixar as dependências do backend da rede social:
```bash
# Navegar até a pasta do projeto
cd YourLife

# Instalar as dependências listadas no package.json
npm install
```

### 2. Configurar o Arquivo de Ambiente
Copie o modelo de variáveis de exemplo e crie o seu próprio arquivo local `.env`:
```bash
cp .env.example .env
```
Abra o arquivo `.env` no seu editor de código e preencha as variáveis de banco de dados e segredos conforme descrito na seção de [Variáveis de Ambiente](#gerenciamento-de-variáveis-de-ambiente).

### 3. Inicializar a Estrutura do Banco de Dados
Para rodar pela primeira vez no seu banco PostgreSQL (seja local ou na nuvem Neon), crie as tabelas executando o script SQL contido no arquivo de arquitetura ou execute a rotina de inicialização automática via script (caso configurado):
```bash
npm run init-db
```
Se preferir criar manualmente, acesse o Console SQL do Neon, cole a estrutura contida em [arquitetura.md](arquitetura.md) e clique em executar.

### 4. Executar Servidores de Desenvolvimento
Inicie a aplicação local com o script automatizado (que sobe tanto o backend em Node.js quanto o servidor frontend na porta local):
```bash
# No Windows/Linux
./iniciar.sh
```

**Acesso Local:**
* **Frontend**: Abra o arquivo `index.html` diretamente no seu navegador ou acesse http://localhost:8000/site.html (caso use o servidor de arquivos).
* **API Backend**: Acesse http://localhost:3000/api.

---

## Scripts Disponíveis

Os comandos abaixo são configurados no arquivo `package.json` do backend:

* `npm start`: Inicia o servidor backend Express de forma simples com `node server.js`.
* `npm run dev`: Inicia o servidor em modo de desenvolvimento utilizando o `nodemon`. O servidor será reiniciado automaticamente sempre que detectar modificações nos arquivos de script.
* `npm run type-check`: Executa a verificação estática de tipos do compilador do TypeScript no arquivo `types.ts` sem emitir arquivos Javascript compilados (`tsc --noEmit`).

---

## Gerenciamento de Variáveis de Ambiente

### Desenvolvimento (.env)

O arquivo `.env` deve ficar localizado na raiz do projeto e **NUNCA** deve ser commitado no Git. Ele serve apenas para o ambiente local:

```env
# Porta de escuta do servidor backend
PORT=3000
NODE_ENV=development

# Segredo de Assinatura JWT (Modifique para um hash seguro!)
JWT_SECRET=minha_chave_secreta_local_super_segura

# Origem de Requisições CORS
CORS_ORIGIN=*

# String de Conexão com o PostgreSQL (Copie da sua conexão do Neon)
POSTGRES_URL=postgresql://usuario:senha@host-neon.tech/neondb?sslmode=require
```

### Produção (Vercel)

Quando o projeto é publicado na Vercel, as variáveis de banco de dados são geradas automaticamente ao linkar a integração do Neon PostgreSQL. Apenas as seguintes variáveis adicionais precisam ser configuradas manualmente na Vercel:

1. Acesse o **Vercel Dashboard** e selecione o seu projeto.
2. Navegue até **Settings** -> **Environment Variables**.
3. Adicione os seguintes pares de chave/valor:
   * `JWT_SECRET`: Uma chave secreta de alta entropia.
   * `NODE_ENV`: `production`
   * `CORS_ORIGIN`: Configure com o domínio oficial da sua aplicação (ex: `https://your-life-gamma.vercel.app`) para bloquear chamadas externas e aumentar a segurança.

---

## Deploy em Produção (Vercel + Neon)

### Passo 1: Enviar Código para o GitHub
Crie um repositório no seu GitHub pessoal e faça o push de todos os arquivos. A pasta `node_modules/` e o arquivo `.env` já estão adicionados no `.gitignore` e não serão enviados por segurança.

### Passo 2: Criar Projeto na Vercel
1. Acesse o painel da [Vercel](https://vercel.com) e faça login com a sua conta do GitHub.
2. Clique em **Add New...** -> **Project**.
3. Importe o repositório **YourLife**.
4. A Vercel detectará automaticamente as configurações estáticas e a API Express por meio do arquivo [vercel.json](vercel.json).
5. Clique em **Deploy**.

### Passo 3: Integrar o Banco de Dados Neon na Nuvem
1. No painel do seu projeto na Vercel, clique na aba **Storage**.
2. Clique em **Create Database** e selecione a integração oficial do **Neon** (PostgreSQL).
3. A Vercel provisionará e integrará a string de conexão no banco de dados automaticamente, definindo as variáveis `POSTGRES_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, etc., nas variáveis de ambiente do projeto.

---

## Checklist de Segurança

Para evitar incidentes de segurança e vazamentos de dados, siga as diretrizes abaixo:

1. **Gere um JWT_SECRET Forte**: Nunca use chaves simples em produção. Gere um hash de 256 bits no terminal usando:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. **Proteja o arquivo `.env`**: Nunca remova o `.env` do arquivo `.gitignore`.
3. **Limite o CORS**: Em produção, altere a variável `CORS_ORIGIN=*` para o domínio específico da sua hospedagem para prevenir requisições de origem cruzada não autorizadas.
4. **Queries Parametrizadas**: A aplicação utiliza tagged templates de SQL fornecidos pelo driver `@vercel/postgres` (ex: `sql`query`), o que evita ataques de injeção de SQL (SQL Injection). Mantenha essa prática em quaisquer modificações de consultas.
