# Funcionalidades e Regras de Design

Este documento detalha o comportamento funcional da rede social YourLife, as regras estritas de design visual da interface do usuário (UI) e as boas práticas de programação aplicadas.

---

## Índice

* [Detalhamento das Funcionalidades](#detalhamento-das-funcionalidades)
* [Interface do Usuário e Visual](#interface-do-usuário-e-visual)
* [Regras Estritas de Design (Símbolos ASCII)](#regras-estritas-de-design-símbolos-ascii)
* [Notas Técnicas e Boas Práticas](#notas-técnicas-e-boas-práticas)

---

## Detalhamento das Funcionalidades

### 1. Autenticação e Cadastro
* **Registro de Nova Conta**: Formulário com campos de nome, e-mail e senha. As senhas são criptografadas antes de serem armazenadas no banco Neon.
* **Login Seguro**: Autenticação que gera e retorna um token JWT válido por 7 dias, salvando-o no navegador.

### 2. Feed de Notícias
* **Visualização de Postagens**: Linha do tempo contendo até 50 publicações recentes. O feed é atualizado automaticamente via polling de 10s e conta com o suporte de "pull-to-refresh".
* **Interações**: Opções de curtir/descurtir e ver/adicionar comentários abaixo de cada postagem.

### 3. Gerenciamento de Perfil
* **Dados Pessoais**: Exibição da foto do usuário (avatar), imagem de capa, biografia e tags de interesse pessoal.
* **Edição de Perfil**: Janela modal para alteração imediata de foto, capa, biografia e tags de interesse.

### 4. Sistema de Amizades
* **Adicionar Amigo**: Botão rápido de "+ Adicionar" localizado ao lado do nome do autor em cada postagem. O botão é ocultado para postagens de autoria própria.
* **Categoria de Pedidos**: Aba dedicada que centraliza as solicitações pendentes recebidas.
* **Ações**: Botões de "[OK] Aceitar" (confirma a amizade reciprocamente) e "[X] Recusar" (remove a solicitação).

### 5. Chat Privado (Correspondências)
* **Aba Correspondências**: Chat moderno em tela dividida, exibindo a lista de conversas ativas no lado esquerdo e a área de mensagens ativas no lado direito.
* **Mensagens Privadas**: Canal de texto rápido. As mensagens enviadas são azuis (alinhadas à direita) e as recebidas são cinzas (alinhadas à esquerda).
* **Segurança de Chat**: O chat é restrito apenas a usuários que possuem amizade mútua aceita no banco de dados.

### 6. Sistema de Conselhos
* **Conselhos Temáticos**: Feed específico contendo conselhos diários organizados por categorias como saúde, carreira, relacionamentos, etc.

### 7. Central de Notificações
* **Header Indicativo**: Um sino localizado na barra de cabeçalho exibe badges vermelhos com a contagem de novas interações.
* **Eventos Notificados**: Novas curtidas, novos comentários, solicitações de amizade e convites aceitos.

---

## Interface do Usuário e Visual

* **Design Minimalista**: Interface focada no conteúdo com contrastes suaves e elementos bem delimitados.
* **Tema Escuro (Dark Mode)**:
  * Ativação imediata sem recarregar a página através do menu do cabeçalho.
  * Persistência de estado salva no navegador para futuros acessos.
  * Paleta de cores baseada em tons cinzas escuros (`gray-800` e `gray-700`) e textos brilhantes (`white` e `gray-300`).
* **Menu do Usuário**: Dropdown expansível ao clicar na imagem de perfil que agrupa a troca de temas e o encerramento de sessão (Logout).

---

## Regras Estritas de Design (Símbolos ASCII)

O projeto YourLife possui uma diretriz rígida de design que proíbe o uso de emojis gráficos Unicode (como 😊, 👍, ✉️) na interface. Em vez disso, a interface utiliza exclusivamente símbolos textuais padrão ASCII.

### Motivos do Padrão
* **Consistência**: Aparência uniforme independente do sistema operacional (Windows, Android, Linux, iOS).
* **Acessibilidade**: Leitores de tela processam melhor caracteres de texto padrão.
* **Estética**: Visual retrô-moderno limpo focado na seriedade da interface.

### Tabela de Mapeamento Visual

| Função de Interface | Padrão ASCII Adotado |
|:---|:---:|
| Enviar/Adicionar/Novo | `+` |
| Aguardando/Processando | `...` |
| Sucesso/Confirmado/Aceito | `[OK]` |
| Cancelar/Excluir/Recusar | `[X]` |
| Alerta/Notificação | `(!)` |
| Mensagem/Chat | `[msg]` |
| Identificador de Usuário | `[@]` |
| Curtir/Gostar | `<3` |
| Comentário/Responder | `[...]` |
| Postagem/Tópico | `#` |

---

## Notas Técnicas e Boas Práticas

No desenvolvimento do frontend (no arquivo `app.js` e utilitários), aplicamos padrões modernos para robustez da aplicação:

* **Normalização de Timestamps**: Implementação de tratamento no `formatRelativeTime()` utilizando verificações de data inválida com `isNaN()` e `null check` para prevenir o bug de exibição de data quebrada.
* **Evitar Loops de Erro de Renderização**: Uso sistemático de fallbacks de array vazio (`|| []`) antes de realizar varreduras de mapeamento (ex: `post.comments.map(...)`) para evitar travamentos da interface caso o backend retorne dados ausentes.
* **Modularização**: Separação clara de responsabilidades:
  * `api.js` gerencia a comunicação de rede.
  * `state.js` gerencia o estado da sessão e de dados.
  * `utils.js` fornece utilitários reutilizáveis de tempo e formatação de strings.
  * `app.js` gerencia o fluxo de controle e a manipulação do DOM da interface.
