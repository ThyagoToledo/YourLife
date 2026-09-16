# Arquitetura de portfólio e rede privada

Este documento registra a separação entre a vitrine pública do Your Life e a aplicação social privada.

## Objetivos

- `main` representa o portfólio público e não solicita login.
- `master` continua sendo a branch de homologação da aplicação social completa.
- `local-full` preserva o fluxo social completo para desenvolvimento local, com banco local e dados fictícios.
- O login, as solicitações de acesso e a aprovação manual de membros serão reativados em uma etapa posterior.

## Estado das branches

| Branch | Finalidade | Dados esperados | Login |
| --- | --- | --- | --- |
| `main` | Portfólio público | Conteúdo demonstrativo, sem membros reais | Não |
| `master` | Homologação da rede privada | Banco de homologação protegido | Mantido para desenvolvimento |
| `local-full` | Desenvolvimento local completo | Banco local e seed fictício | Mantido |

As branches não são uma barreira de segurança. Segredos, permissões e conexão com banco devem ser controlados por variáveis de ambiente e por autorização no servidor.

## Portfólio público

A `main` deve permanecer somente leitura:

- apresentação do projeto e das funcionalidades;
- exemplos fictícios de feed, correspondências, grupos e comunidades;
- nenhuma conta, sessão, postagem, comentário ou mensagem real;
- nenhuma consulta pública às tabelas privadas;
- nenhum upload ou chamada de áudio/vídeo;
- solicitação de acesso será adicionada em uma etapa posterior.

O conteúdo exibido publicamente deve ser sintético ou ter autorização específica para aparecer na vitrine. Perfis privados não devem ser listados no portfólio.

## Rede privada planejada

Quando for reativada, a rede privada deverá usar cadastro desativado e aprovação manual:

1. A pessoa envia uma solicitação mínima de acesso.
2. O administrador analisa e aprova ou recusa.
3. Um convite de uso único é gerado com validade curta.
4. A conta é criada somente após o convite.
5. O perfil começa privado e qualquer publicação na vitrine exige autorização separada.

A primeira versão privada será restrita a maiores de 18 anos. Um fluxo para responsável legal deverá existir antes de qualquer abertura a menores.

## Proteção de dados

O projeto continuará tratando dados pessoais quando houver membros reais. Por isso, a fase privada deverá manter:

- coleta mínima de dados;
- canal de privacidade configurado por `PRIVACY_CONTACT_EMAIL`;
- exportação, correção, revogação e exclusão;
- política de retenção;
- logs de auditoria com acesso restrito;
- controle de sessão e autorização no servidor;
- revisão jurídica dos Termos e do Aviso de Privacidade.

O caráter educacional ou a ausência de fins lucrativos não elimina automaticamente as obrigações aplicáveis ao tratamento de dados pessoais.

## Próximas etapas

- [x] Criar uma vitrine pública inicial na `main`.
- [x] Remover login e cadastro da vitrine pública.
- [x] Documentar o plano nas branches de portfólio e homologação.
- [ ] Criar banco local e seed fictício para `local-full`.
- [ ] Implementar solicitação de acesso sem cadastro automático.
- [ ] Implementar convite de uso único e aprovação manual.
- [ ] Migrar autenticação para cookie seguro.
- [ ] Restringir CORS e configurar `PRIVACY_CONTACT_EMAIL`.
- [ ] Fazer revisão jurídica antes de convidar membros reais.
