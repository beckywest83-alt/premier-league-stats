# Quality checks

The repository uses npm 11.4.2. Match the `packageManager` declaration before
installing dependencies:

```sh
npm install --global npm@11.4.2
npm --version
```

Install dependencies and the Chromium test browser before running the complete quality gate:

```sh
npm ci
npx playwright install --with-deps chromium
npm run check
```

Unlike `npm install`, `npm ci` rejects a stale lockfile and installs the exact dependency
graph committed to the repository. The gate runs the production TypeScript check,
type-aware ESLint, Prettier verification,
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

## GitHub Pages deployment prerequisite

Repository administrators must select **GitHub Actions** under **Settings → Pages → Build
and deployment → Source**. The workflow deliberately grants `pages: write` and
`id-token: write` only to the `deploy` job. If `actions/configure-pages` or
`actions/deploy-pages` fails after the quality job passes, inspect that repository setting
and the `github-pages` environment/deployment history before changing application code.

## Run 30267451970 investigation

The first failing step in job 89981456412 was `actions/configure-pages@v5`. Its complete
error output was:

```text
Error: Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions, or consider using the `enablement` parameter for this action. Error: HttpError: Not Found
Error: HttpError: Not Found
```

This maps to the `Configure GitHub Pages` step in `.github/workflows/quality-and-deploy.yml`,
not to `npm run check` or the application build. The step retains `enablement: true` for a
new repository, while the repository setting above remains the authoritative configuration.
