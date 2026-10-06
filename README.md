# AniLater

Aplicativo React Native com Expo para pesquisar animes na AniList, guardar cards no aparelho e consultar detalhes. Desenvolvido como trabalho de Desenvolvimento Mobile.

## Integrantes

- Murilo Pessoni Cândido
- Francisco Rodrigues Rocha

## Requisitos atendidos

- Login com usuário (e-mail) e senha.
- Cadastro com nome, telefone, CPF, e-mail, curso e senha; salva localmente e volta ao login.
- Busca na AniList: o botão **ADD** adiciona um resultado por toque; a lista mostra imagem, nome, status, formato e episódios.
- **EXCLUIR** remove um card; **VER MAIS DETALHES** apresenta informações e sinopse.
- Cadastro e cards persistem no aparelho com AsyncStorage. A conexão à internet é necessária para adicionar animes.

## Executar

1. Instale Node.js 20.19 ou superior e o aplicativo Expo Go no celular.
2. Nesta pasta, execute `npm install` e depois `npx expo start`.
3. Leia o QR code no Expo Go. Celular e computador devem estar na mesma rede; se a rede bloquear a conexão, execute `npx expo start --tunnel`.
4. Cadastre o usuário; use o e-mail e a senha criados para entrar. Busque um anime, toque em ADD, abra seus detalhes e teste EXCLUIR.

## API

AniList GraphQL: `POST https://graphql.anilist.co`. A busca usa `Page(page, perPage: 10)` com `media(search, type: ANIME, isAdult: false)`. Retorna títulos, capa, status, formato, episódios, ano, nota, gêneros e descrição. Não precisa de chave de API para essas consultas públicas. Erros de conexão e limite de requisições são exibidos na interface. [Documentação AniList](https://docs.anilist.co/guide/graphql/queries/media).

## Organização

- `src/pages/login.js`: autenticação local.
- `src/pages/cadastro.js`: cadastro e armazenamento local.
- `src/pages/main.js`: busca, cards, adição e exclusão.
- `src/pages/detalhes.js`: dados do anime escolhido.
- `src/services/api.js`: consulta GraphQL via Axios.
- `src/routes.js`: navegação entre as telas.

**Observação:** este é um exercício com login local. AsyncStorage guarda dados sem criptografia; não utilize senha real. É possível cadastrar vários usuários no mesmo aparelho, e cada usuário possui sua própria lista de animes. Os dados permanecem salvos localmente e não são sincronizados entre navegador e celular.