# Premier League Stats

A Vite and TypeScript season review with validated standings and filterable fixtures.

## Development

```sh
npm install
npm run dev
```

The production site uses the `/premier-league-stats/` base path. `npm run build` writes the
deployable site to `dist`, and `npm run preview` serves that build locally.

## Quality checks

```sh
npm run typecheck     # production TypeScript validation
npm run lint          # type-aware ESLint
npm run format:check  # Prettier verification
npm test              # Vitest unit tests
npm run build         # production bundle and base-path verification
npm run test:e2e      # Playwright browser and axe accessibility checks
npm run check         # complete local quality gate
```

Install the browser once before the browser suite with
`npx playwright install --with-deps chromium`. The CI workflow runs every check before its
GitHub Pages deployment job can start.
