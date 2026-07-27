# Premier League Stats

A Vite-powered dashboard for Premier League standings and top scorers.

## Run locally

This project requires a compatible Node.js version (Node.js 22 is recommended) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To check the production build locally, run:

```sh
npm run build
npm run preview
```

## Deploy to GitHub Pages

The repository includes a GitHub Actions workflow that type-checks and builds the site, then deploys the contents of `dist/` to GitHub Pages whenever a commit is pushed to `main`. It can also be started manually from the repository's **Actions** tab.

To enable the deployment:

1. On GitHub, open the repository and go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push a commit to `main`, or open **Actions → Deploy to GitHub Pages** and choose **Run workflow**.
4. After the deployment succeeds, its URL appears on the workflow run's deployment summary and in **Settings → Pages**. GitHub also records it in the `github-pages` environment on the repository's **Deployments** page.

Changing repository settings requires a GitHub user with the appropriate repository administration permission. The initial workflow deployment must likewise be triggered or approved by a GitHub user with the permissions required by the repository and its environment protection rules.

### Vite base path

The Vite configuration uses `base: "./"`, so generated asset URLs are relative to the built page rather than rooted at `/`. As a result, the same production build works both for a project site such as `https://OWNER.github.io/REPOSITORY/` and for a user or organization site at `https://OWNER.github.io/`; no repository name needs to be hard-coded in the configuration.
