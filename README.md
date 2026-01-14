# WeatherNow

Aplicativo de previsão do tempo com foco em experiência mobile-first, usando Open-Meteo. Inclui cache com expiração, tema dinâmico por horário da cidade e interface moderna com efeito glass.

## Visão geral
- Consulta geocodificação e previsão (Open-Meteo) a partir do nome da cidade.
- Interface web estática (index.html + app.js + style.css) servida via HTTP local.
- Script CLI em TypeScript (src/index.ts) para consulta simples no terminal.

## Principais funcionalidades
- Cache com expiração baseada em tempo
  - Utilitário de cache (src/cache.ts) com armazenamento em localStorage (fallback em memória).
  - Função getOrSet(key, ttlMs, producer) para reutilizar respostas de API.
  - TTLs adotados: geocodificação 24h, clima atual 10min.
  - Integração no módulo src/weatherApi.ts.
- Design mobile-first
  - Topbar responsiva, inputs acessíveis e ações claras.
  - Painéis "glass" com leitura confortável em telas pequenas.
  - Carrossel horizontal de horas e previsão de 7 dias.
- Tema dinâmico por horário da cidade
  - Cores de fundo variam conforme sunrise/sunset da localização.

## Requisitos
- Node.js 18+ (para suporte nativo a fetch no CLI e build TS).

## Execução

### Web (localhost)
- Servir na raiz do projeto:
  - `npx serve -l 5173`
  - ou `npx http-server -p 5173 -c-1`
- Acessar: http://localhost:5173

### CLI (terminal)
- Desenvolvimento: `npm run dev`
- Build: `npm run build`
- Executar build: `npm start`

## Estrutura do projeto
- `index.html`, `style.css`, `app.js`: Interface web
- `src/`
  - `index.ts`: CLI (readline)
  - `weatherApi.ts`: Integração com Open-Meteo e cache (via getOrSet)
  - `cache.ts`: Utilitário de cache com TTL (localStorage + fallback memória)
  - `display.ts`: (se aplicável) lógicas auxiliares de exibição
- `package.json`, `tsconfig.json`, `README.md`

## Configuração e ajustes
- TTLs do cache
  - Ajuste no código que chama `getOrSet` em `src/weatherApi.ts`.
  - Padrões: 24h para geocodificação, 10min para clima atual.
- Tema por horário
  - Controle no `app.js` via `applyThemeByTime(currentIso, sunriseIso, sunsetIso)`.
  - CSS define gradientes para `theme-day`, `theme-evening`, `theme-night`.
- Imagem de fundo
  - Arquivo `paisagem.avif` deve estar na raiz do projeto (fallback `355655f3df061697299fa868317439ef.jpg`).
  - Efeito visual aplicado com `body::before` (grayscale/blur + mix-blend-mode).

## Dependências principais
- Web: APIs nativas do navegador (fetch).
- CLI: TypeScript, ts-node.

## Licença
ISC.
