# Quality checks

Install dependencies and the Chromium test browser before running the complete quality gate:

```sh
npm install
npx playwright install --with-deps chromium
npm run check
```

The gate runs the production TypeScript check, type-aware ESLint, Prettier verification,
Vitest unit tests, the Vite production build, and Playwright browser/accessibility tests.
Individual commands are also available:

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
```

The production build and preview use the `/premier-league-stats/` project base path. The
GitHub Actions workflow runs every check before its GitHub Pages deployment job can start.
