# YOUR LIFE - REDE SOCIAL

<p align="center">
  <img src="Icons/AraraFinal.png" alt="YourLife Logo" width="120px" style="border-radius: 24px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);" />
</p>

<p align="center">
  <strong>Conecte-se com quem importa</strong>
</p>

<p align="center">
  <strong>Versão:</strong> 4.0.0-beta.1 | <strong>Atualizado em:</strong> 15 de Setembro 2026 | <strong>Status:</strong> Em homologação
</p>

<p align="center">
  <strong>Acesso ao Site:</strong> <a href="https://your-life-gamma.vercel.app">https://your-life-gamma.vercel.app</a>
</p>

<p align="center">
  <a href="https://developer.mozilla.org/pt-BR/docs/Web/HTML"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" /></a>
  <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://neon.tech"><img src="https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black" alt="Neon" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
</p>

---

## Hub de Documentação

Para facilitar a navegação e manter o repositório organizado, dividimos a documentação detalhada do projeto em arquivos temáticos localizados na pasta [doc/](doc):

* **[Arquitetura e Banco de Dados](doc/arquitetura.md)**: Detalhes de engenharia da infraestrutura serverless, fluxo de dados do backend para o frontend, regras de normalização de nomenclatura e o schema completo das 9 tabelas do Neon PostgreSQL.
* **[Referência da API REST (API Reference)](doc/api_reference.md)**: Especificação completa de todas as rotas e endpoints do servidor Express, incluindo cabeçalhos de autenticação JWT e formatos JSON de envio e resposta.
* **[Guia de Desenvolvimento e Deploy](doc/desenvolvimento.md)**: Passo a passo para configurar o ambiente de desenvolvimento local, gerenciamento das variáveis de ambiente (`.env` vs Vercel) e roteiro de publicação na nuvem.
* **[Funcionalidades e Regras de Design](doc/funcionalidades.md)**: Detalhamento de todas as telas (Autenticação, Feed, Amigos, Chat privado) e as regras rígidas do padrão estético ASCII (sem emojis) para a interface do usuário.
* **[Solução de Problemas (Troubleshooting)](doc/solucao_problemas.md)**: Resolução de falhas comuns (como o bug "NaNa atrás" em timestamps), monitoramento de logs de produção e o histórico de alterações (Changelog) de todas as versões lançadas.
* **[Padrões de Documentação e Estilo](doc/readme_standards.md)**: Manual de estilo sobre estrutura de arquivos, regras de logo, badges e autor no repositório.

---

## Início Rápido

Para rodar a aplicação localmente de forma rápida:

```bash
# 1. Instalar as dependências do Node.js
npm ci

# 2. Copiar .env.example para .env e configurar POSTGRES_URL/JWT_SECRET

# 3. Aplicar a migração social quando houver banco de homologação
npm run migrate

# 4. Iniciar o servidor
npm start
```

Acesse o portfólio público local em: http://localhost:3000/ (na `main`). Para executar a rede social completa, use a branch `local-full` e o comando documentado em [doc/portfolio-architecture.md](doc/portfolio-architecture.md).

### Portfólio público e branches

A branch `main` é a vitrine pública do projeto e não possui login, cadastro ou acesso às funcionalidades sociais privadas. Ela exibe apenas conteúdo demonstrativo.

A branch `master` continua sendo a homologação da aplicação social completa. A branch `local-full` é destinada ao desenvolvimento local com banco e dados fictícios. O plano de separação e o fluxo futuro de aprovação manual estão em [doc/portfolio-architecture.md](doc/portfolio-architecture.md).

### Estado da main

A `main` é a versão de portfólio público. A entrada principal não redireciona para login e apresenta uma vitrine somente leitura, com conteúdo demonstrativo e sem cadastro, publicação ou acesso à rede privada.

### Estado da master

A branch `master` reúne a atualização social em homologação: chat com grupos e Markdown sanitizado, chamadas com áudio, câmera e compartilhamento de tela, comunidades, upload moderado por Vercel Blob e edição autorizada de posts. O CI executa testes, checagem de tipos, auditoria e validação estrutural do servidor; a integração Git da Vercel cria apenas um Preview para esta branch.

### Privacidade e LGPD

O Your Life é um projeto experimental de estudos e portfólio, sem fins lucrativos, executado em planos gratuitos e sem garantia de disponibilidade ou escala. Isso não afasta obrigações legais aplicáveis. O cadastro é restrito a maiores de 18 anos enquanto não existir fluxo de responsável legal, e exige aceite versionado dos Termos e ciência do Aviso de Privacidade. O consentimento de marketing é opcional e revogável. Usuários autenticados podem exportar seus dados e abrir solicitações de acesso, correção, portabilidade, revogação ou eliminação pela Central de Privacidade. Antes de qualquer abertura pública, configure `PRIVACY_CONTACT_EMAIL` com um canal real do responsável pelo projeto e submeta os textos a revisão jurídica.

O fluxo de publicação é `feature -> master -> main`. Consulte o [guia de contribuição](CONTRIBUTING.md) para os critérios de validação. A produção permanece vinculada à `main`.

---

## Próximas Versões

Esta lista representa o estado confirmado da `master` e o que ainda pretendemos colocar. Os itens marcados foram implementados no código e seguem para validação em homologação antes de chegar à produção.

### Base social e perfil

- [x] **Editar e excluir posts**: o autor pode alterar ou remover as próprias publicações.
- [x] **Upload de fotos de perfil e capa**: arquivo enviado para o Vercel Blob, convertido em URL e associado ao perfil após moderação.
- [x] **Upload moderado em posts, mensagens e comunidades**: arquivos passam por validação de tipo, tamanho e status de aprovação.
- [ ] **Busca avançada de usuários**: filtros por interesses em comum, proximidade e status de amizade.
- [ ] **Sistema de hashtags**: indexação e descoberta de publicações por tags.
- [ ] **Menções (@usuario)**: marcação de pessoas em posts, comentários e mensagens.
- [ ] **Stories**: conteúdo temporário com expiração configurável, inicialmente em 24 horas.

### Chat, chamadas e comunidades

- [x] **Chat com Markdown sanitizado**: formatação de texto, anexos, recibos de leitura e idempotência de envio.
- [x] **Atualizações em tempo real**: sinais via Ably com reconciliação por polling quando necessário.
- [x] **Grupos**: criação, membros, papéis, limite de participantes e administração do proprietário.
- [x] **Chamadas de áudio e vídeo**: LiveKit com câmera, microfone, seleção de dispositivos e compartilhamento de tela.
- [x] **Comunidades**: espaços públicos ou privados, canais, convites e papéis de membro.
- [ ] **Threads e respostas avançadas**: organização de conversas longas dentro de canais e grupos.
- [ ] **Presença e notificações aprimoradas**: status online, silenciamento por conversa e notificações configuráveis.

### Qualidade e evolução técnica

- [x] **Testes automatizados da API social**: seis testes Node.js cobrindo moderação, uploads e regras de conversa.
- [x] **Migração social aditiva**: tabelas para mídia, conversas, comunidades e chamadas sem apagar o modelo legado.
- [ ] **Migração completa de dados legados**: backfill idempotente de mensagens antigas e cutover acompanhado.
- [ ] **Camada centralizada de transformadores**: padronização completa entre DTOs camelCase e banco snake_case.
- [ ] **Busca, hashtags, menções e stories**: pacote de descoberta e publicação temporária após a estabilização do chat.

---

## Autor

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/ThyagoToledo">
        <img src="https://github.com/ThyagoToledo.png" width="100px;" alt="Thyago Toledo"/>
        <br />
        <sub><b>Thyago Toledo</b></sub>
      </a>
    </td>
  </tr>
</table>

---

Este projeto é disponibilizado sob os termos da licença MIT. Para mais detalhes consulte o arquivo de licença do repositório.
