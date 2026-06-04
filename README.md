# YOUR LIFE - REDE SOCIAL

<p align="center">
  <img src="Icons/AraraFinal.png" alt="YourLife Logo" width="120px" style="border-radius: 24px; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);" />
</p>

<p align="center">
  <strong>Conecte-se com quem importa</strong>
</p>

<p align="center">
  <strong>Versão:</strong> 3.0.1 | <strong>Atualizado em:</strong> 2 de Novembro 2025 | <strong>Status:</strong> Em Produção
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

---

## Início Rápido

Para rodar a aplicação localmente de forma rápida:

```bash
# 1. Instalar as dependências do Node.js
npm install

# 2. Configurar o banco de dados (certifique-se de preencher o .env com a POSTGRES_URL)
npm run init-db

# 3. Iniciar os servidores locais (backend + frontend)
./iniciar.sh
```

Acesse a aplicação local em: http://localhost:8000/site.html

---

## Próximas Versões

Inspecionamos a base de código e confirmamos que a lista abaixo representa com exatidão as próximas implementações planejadas, estando pendentes no código-fonte atual:

### Planejado para v3.1.0
- [ ] **Editar/deletar posts**: Funcionalidade no feed para permitir que usuários editem ou apaguem suas próprias publicações (atualmente apenas comentários suportam edição/exclusão).
- [ ] **Upload de imagens**: Integração com serviços de armazenamento (Cloudinary ou AWS S3) para permitir postagens e fotos de perfil reais no banco de dados.
- [ ] **Busca avançada de usuários**: Filtros finos na pesquisa de usuários baseados em interesses em comum e status de proximidade.
- [ ] **Sistema de hashtags**: Indexação de postagens por tags arcanas no feed.
- [ ] **Menções (@usuario)**: Marcação e vinculação de usuários nas postagens e comentários.
- [ ] **Migração de convenção de dados**: Mapear de forma consistente todo o fluxo para camelCase ou snake_case nativo.
- [ ] **Camada centralizada de transformadores**: Substituir a normalização pontual das requisições por um middleware centralizador de dados.

### Planejado para v4.0.0
- [ ] **Chat em tempo real**: Migrar o polling assíncrono atual de 10s para conexões bidirecionais contínuas via WebSocket (Socket.io).
- [ ] **Chamadas de vídeo**: Integração ponto a ponto via WebRTC.
- [ ] **Stories**: Conteúdo temporário com expiração em 24 horas.
- [ ] **Grupos e Comunidades**: Criação de canais públicos e privados por interesses.
- [ ] **Testes automatizados**: Cobertura de testes de integração e unitários integrados via Jest/Vitest.

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
