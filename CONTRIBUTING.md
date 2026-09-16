# Fluxo de desenvolvimento e publicação

<p align="center">
  <img src="https://img.shields.io/badge/YourLife-master-6D5EF7?style=for-the-badge" alt="YourLife master" />
  <img src="https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions" />
  <img src="https://img.shields.io/badge/Preview-Vercel-111827?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Preview" />
</p>

Este guia descreve como uma alteração percorre o YourLife até a produção. O objetivo é manter cada mudança revisável, testada e fácil de reverter.

O YourLife usa duas branches permanentes:

* `master`: integração e homologação. Toda atualização entra primeiro aqui.
* `main`: produção. Recebe somente pull requests vindos de `master` depois do CI e da validação do Preview.

## Fluxo obrigatório

1. Criar uma branch curta a partir de `master` para mudanças maiores.
2. Abrir pull request para `master` ou enviar a alteração diretamente para `master` quando o trabalho for individual.
3. Aguardar o workflow `CI` concluir testes, tipos, auditoria e carregamento do servidor.
4. Validar o Preview criado pela integração Git da Vercel para a branch `master`.
5. Abrir pull request de `master` para `main`.
6. Fazer merge somente após o CI e a validação manual do Preview.

O workflow `Gate de publicação da main` falha quando um pull request para `main` parte de outra branch. Para impedir também pushes diretos, configure no GitHub uma regra de proteção para `main` exigindo pull request e os checks `Testes e validações` e `Exigir origem master`.

## Critérios antes do pull request

```text
[mudança] -> [npm test] -> [type-check] -> [audit] -> [Preview] -> [revisão]
```

Antes de abrir o pull request, confirme que os testes locais passam, que nenhuma credencial foi adicionada e que a alteração está descrita no README ou na documentação correspondente em `doc/`.

## Vercel

A integração Git existente faz o CD:

* push em `master`: Preview isolado;
* merge em `main`: deploy de produção pela configuração já existente do projeto.

Não use `vercel --prod`, `vercel promote` ou deploy manual durante o desenvolvimento. Tokens e IDs da Vercel ficam somente nos ambientes protegidos e nunca entram no repositório.

## Validação local

```bash
npm ci
npm test
npm run type-check
npm audit --omit=dev --audit-level=high
```

Para carregar o servidor sem acessar o banco durante uma verificação estrutural:

```bash
JWT_SECRET=local-test-secret node -e "require('./server')"
```
