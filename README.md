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
  - Cores de fundo variam conforme sunrise/sunset da localiza��ão.
  - Classes CSS: theme-day, theme-evening, theme-night aplicadas via JS.
- Imagem de fundo integrada
  - `paisagem.avif` (com fallback JPG) como plano de fundo.
  - Combinação com gradiente dinâmico usando `mix-blend-mode`.
  - Filtros (grayscale/blur) aplicados somente à camada de imagem via `body::before` (não afeta o conteúdo).
- Painéis com alturas alinhadas (desktop)
  - O painel de "MAIS DETALHES" acompanha a altura do painel principal quando em layout lado a lado.

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

## Privacidade, consentimento e cache
- Banner de consentimento (index.html)
  - Um banner solicita consentimento para uso do armazenamento local (cache de resultados) e oferece botão para limpar o cache.
  - A limpeza remove chaves `geo:*` e `weather:*` do `localStorage`.
  - O consentimento é salvo como `consent:local = '1'` no `localStorage`.
- Boas práticas
  - Não armazene dados sensíveis no cliente.
  - Se necessário desabilitar cache sem consentimento, verifique a key `consent:local` dentro do utilitário de cache.

## Variáveis de ambiente e chaves
- Modelo `.env.example`
  - Use como referência para configurar variáveis localmente (não comitar `.env`).
  - Em produção, injete variáveis no ambiente do servidor/CI.
- Importante
  - Evite expor chaves no front-end. Se uma API exigir chave, use um backend/proxy para proteger os segredos.

## Auditoria de licenças
- Comando disponível:
  - `npm run licenses` (executa `npx license-checker --summary`)
- Use este comando antes de incorporar novas dependências, verificando compatibilidade de licenças.

## Dependências principais
- Web: APIs nativas do navegador (fetch).
- CLI: TypeScript, ts-node.

## Licença
ISC.
