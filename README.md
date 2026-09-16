<p align="center">
  <img src="assets/yourlife-banner.svg" alt="YourLife — conecte-se com quem importa" width="100%" />
</p>

<p align="center">
  Uma rede social para compartilhar momentos, conversar e criar comunidades.
</p>

<p align="center">
  <a href="https://your-life-gamma.vercel.app"><strong>Acessar aplicação</strong></a>
  &nbsp;&middot;&nbsp;
  <a href="#início-rápido">Executar localmente</a>
  &nbsp;&middot;&nbsp;
  <a href="CONTRIBUTING.md">Contribuir</a>
</p>

<p align="center">
  <a href="https://github.com/ThyagoToledo/YourLife/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/ThyagoToledo/YourLife/ci.yml?branch=master&style=flat-square&label=CI" alt="Status do CI" /></a>
  <img src="https://img.shields.io/badge/versão-4.0.0--beta.1-6D5EF7?style=flat-square" alt="Versão 4.0.0 beta 1" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js 20 ou superior" />
  <img src="https://img.shields.io/badge/licença-MIT-0F766E?style=flat-square" alt="Licença MIT" />
</p>

## Sobre o projeto

O YourLife é uma rede social independente construída com Node.js, Express e PostgreSQL. Este repositório mantém somente o README público; arquitetura, decisões, operação e planejamento ficam no vault privado do projeto.

| Experiência | Recursos |
| --- | --- |
| Conversas | Mensagens diretas, grupos, Markdown sanitizado e recibos de leitura |
| Chamadas | Áudio, câmera, compartilhamento de tela e seleção de dispositivos |
| Comunidades | Canais, convites, papéis e espaços públicos ou privados |
| Mídia | Upload por Vercel Blob e moderação antes da publicação |

## Tecnologias

<p>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=111827" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Express-111827?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Neon-00E599?style=flat-square&logo=neon&logoColor=111827" alt="Neon" />
  <img src="https://img.shields.io/badge/Vercel-111827?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## Início Rápido

Para rodar a aplicação localmente de forma rápida:

```bash
# 1. Instalar as dependências do Node.js
npm install

# 2. Copiar .env.example para .env e preencher POSTGRES_URL/JWT_SECRET

# 3. Aplicar a migração aditiva da plataforma social
npm run migrate

# 4. Iniciar o servidor
npm start
```

Acesse a aplicação local em: http://localhost:3000/site.html

## Integração e publicação

Toda atualização deve chegar primeiro à branch `master`, onde o GitHub Actions executa testes, checagem de tipos, auditoria de dependências e validação estrutural do servidor. A integração Git da Vercel gera um Preview para homologação. A branch `main` recebe somente pull requests vindos de `master` depois que esses checks e o Preview forem aprovados.

O fluxo de publicação é `feature -> master -> main`. Consulte o [guia de contribuição](CONTRIBUTING.md) antes de enviar alterações. O pipeline não executa comandos de promoção ou deploy manual em produção.

---

## Atualização social v4

A branch de desenvolvimento inclui:

* chat e grupos com Markdown sanitizado, recibo de leitura e idempotência;
* eventos instantâneos via Ably, com reconciliação por polling;
* aba de ligações com LiveKit, câmera, microfone, compartilhamento de tela e seleção de dispositivos;
* comunidades públicas/privadas com canais, papéis e convites;
* upload automático por Vercel Blob e moderação por Amazon Rekognition;
* edição/exclusão autorizada de posts, bloqueios e denúncias;
* migração aditiva e testes automatizados dos limites de segurança da API.

Os recursos externos só ficam operacionais após configurar as variáveis descritas em `.env.example`. Sem o classificador, imagens permanecem em revisão e não são publicadas. Esta versão ainda não foi implantada no endereço de produção.

### Próximas etapas

* executar a migração em um banco de homologação e validar os fluxos com duas contas;
* calibrar a política de moderação e o orçamento dos fornecedores;
* executar e conferir a migração idempotente das mensagens privadas antigas;
* concluir busca por interesses, hashtags, menções e stories.

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
