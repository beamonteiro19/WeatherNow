# WeatherNow

Um aplicativo simples de clima em TypeScript que recebe o nome da cidade do usuário, busca dados meteorológicos da API Open-Meteo e os exibe em um formato amigável.

## Como usar

1. Instale as dependências: `npm install`
2. Execute o aplicativo: `npm run dev` (para desenvolvimento) ou `npm run build` e `npm start` (para produção)

## Estrutura do projeto

- `src/`: Código fonte TypeScript
  - `index.ts`: Ponto de entrada principal
  - `weatherApi.ts`: Lógica para buscar dados da API
  - `display.ts`: Lógica para exibir os dados
- `dist/`: Código compilado JavaScript
- `package.json`: Dependências e scripts
- `tsconfig.json`: Configuração do TypeScript