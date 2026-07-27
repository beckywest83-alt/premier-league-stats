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

The Vite configuration uses `base: "/premier-league-stats/"`, so generated asset and data URLs remain under the GitHub Pages project path. The deployment workflow publishes the generated `dist/` directory; publishing the repository source directly will not work because browsers cannot run the TypeScript source entry point.
> **Unofficial fan project.** This site is not affiliated with, endorsed by, or
> sponsored by the Premier League, its clubs, or any statistics provider. Club,
> competition, and player names are used for identification only.

A small, accessible season-review dashboard for the English Premier League. It
turns typed, repository-owned data into a final league table, a Golden Boot list,
and selected final-day results. The current review covers the **2023/24 season**;
it is a historical snapshot, not a live scores service.

## Preview

There is not currently a public hosted preview. Run `npm run dev`, then open
[http://localhost:5173](http://localhost:5173), or run `npm run build && npm run
preview` and open [http://localhost:4173](http://localhost:4173) to preview the
production build. Vite prints the authoritative URL if either port is occupied.

## Data provenance and freshness

All figures displayed in the current snapshot are **verified final figures**,
not projections. `final`, `provisional`, and `projected` are the supported status
labels; the label beside each dataset should always match its metadata.

| Dataset | Season / coverage | Last updated through | Status | Repository source |
| --- | --- | --- | --- | --- |
| Standings | 2023/24, all 380 matches | 19 May 2024 (season complete) | Verified final; includes Everton's 8-point and Nottingham Forest's 4-point deductions | `src/data/standings.ts` |
| Top scorers | 2023/24, leading eight players | 19 May 2024 (season complete) | Verified final | `src/data/scorers.ts` |
| Results | All ten matchweek 38 results | 19 May 2024 | Verified final | `public/data/premier-league-2023-24-fixtures.json` |

The statistics were transcribed from the Premier League's official
[table](https://www.premierleague.com/tables) and [player statistics](https://www.premierleague.com/stats/top/players/goals),
with results checked against its [fixtures/results pages](https://www.premierleague.com/fixtures).
Those external statistics and associated marks remain the property of their
respective owners. **No open data licence for the statistics is asserted by this
repository**, and the source site's terms still apply; the repository's software
licence, if one is added, does not relicense third-party statistics. Verify reuse
or redistribution rights with the source. Record a different provider and its
licence here before importing data from it.

### Fixture availability and refreshes

The deployed application currently makes **no live API request**. The results
panel is a checked-in snapshot, so an unavailable fixture provider, missing API
key, rate limit, or network outage does not break the page: visitors continue to
see the dated 19 May 2024 results. The versioned `FixtureSnapshot` interface is
the checked-in browser contract and does not imply that live data is enabled.

To refresh fixture data:

1. Choose a provider whose terms permit this use and document the provider,
   exact source URL, licence/terms, and retrieval date in the table above. Never
   commit an API token.
2. Fetch the season's competition matches according to that provider's API. If
   using football-data.org, the commonly used competition route is
   `/v4/competitions/PL/matches?season=YYYY`; confirm the current route and season
   convention in the provider's documentation rather than assuming it is stable.
3. Run `npm run ingest:fixtures`; its shared parser validates and maps the API
   response into the `FixtureSnapshot` contract in `src/types/football.ts`.
4. Review the generated snapshot, then update the results markup and
   its visible date/caption in `src/main.ts`. Keep the last known-good snapshot
   when retrieval or validation fails; do not replace it with an empty panel.
5. Run `npm run check`, inspect the page, and commit the data, labels, provenance,
   and README freshness date in the same change.

If live fetching is implemented later, it should fall back to the checked-in
snapshot and visibly label it with its last-updated date. It should distinguish
“unavailable” from “no fixtures scheduled” and should never present cached data
as live.

## Technology choices

- **TypeScript** provides explicit football-data shapes and compile-time checks.
- **Vite** supplies a fast development server and emits a static `dist/` bundle
  suitable for GitHub Pages.
- **Native HTML and CSS** keep the site lightweight, framework-free, and usable
  without a runtime UI dependency.
- Data lives in TypeScript modules so the standings renderer can verify that
  played matches and points totals balance during rendering.

## Prerequisites

- Node.js `20.19.x` or `22.12.0` and newer (Node 21 is outside the declared range)
- npm `11.4.2` (the version pinned by `packageManager`)
- Git

## Local development

```bash
npm ci              # install the exact lockfile dependencies
npm run dev         # development server with hot reload
npm run typecheck   # TypeScript validation only
npm run build       # type-check and create dist/
npm run preview     # serve dist/ locally after a build
npm run check       # full project check (type-check plus production build)
```

## Directory structure

```text
.
├── index.html                 # document shell and accessible page regions
├── src/
│   ├── components/            # standings and scorers HTML renderers
│   ├── data/                  # checked-in standings and scorer snapshots
│   ├── types/football.ts      # shared dataset and fixture-feed contracts
│   ├── main.ts                # page composition and result snapshot
│   └── styles.css             # responsive presentation
├── package.json               # scripts and runtime requirements
├── package-lock.json          # reproducible dependency lock
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # relative asset base for static hosting
```

## Deploying to GitHub Pages

The Vite `base` is `/premier-league-stats/`, matching this repository's GitHub
Pages project path. Build from a clean checkout before deploying:

```bash
npm ci
npm run check
```

Then configure GitHub Pages to deploy with GitHub Actions (**Repository Settings
→ Pages → Build and deployment → Source: GitHub Actions**) and add
`.github/workflows/pages.yml` using GitHub's current “Static HTML” Pages workflow.
Its build job should check out the repository, set up a supported Node version,
run `npm ci` and `npm run build`, and upload `dist/` with
`actions/upload-pages-artifact`; its deploy job should use
`actions/deploy-pages`. Grant only `contents: read`, `pages: write`, and
`id-token: write`, and use the `github-pages` environment.

Push the workflow and application change to the repository's default branch,
watch the **Actions** tab, and use the URL shown by the successful `deploy` job.
Do not commit `dist/`; the workflow should build it. If the repository uses a
custom domain, configure it in Pages settings and test navigation and asset URLs
on that domain after deployment.

## Starting a new season

Treat a season rollover as **one atomic change**, not a series of independent
edits. This avoids a new title being paired with an old table, route, or cached
snapshot.

1. Create or replace the standings and scorer snapshots together. Update every
   `season`, `status`, and `note` field in `src/data/`, including deductions,
   promoted/relegated row state, scorer ties, and appearances.
2. Update the hero copy, result snapshot, result date and caption in `src/main.ts`,
   plus the footer season in `index.html`. Use `projected` or `provisional` until
   the source confirms final figures; never label an in-progress table `final`.
3. Update any provider season parameter and endpoint path together (for example,
   both `season=2024` and its stored/cache path). Search the whole tracked tree
   for the old long and short labels and the prior endpoint fragment:

   ```bash
   git grep -n -e '2023/24' -e '2023' -e '/v4/competitions/PL/matches'
   ```

   Review every match rather than blindly replacing years: dates and historical
   documentation may intentionally retain the old value.
4. Replace checked-in fixture/cache snapshots in the same commit. Do not mix an
   old snapshot with a new endpoint or silently retain records from relegated
   clubs. Validate competition, season, teams, dates, match counts, standings
   arithmetic, and scorer ordering.
5. Update this README's represented season, coverage, per-dataset retrieval dates,
   status, source, licence, preview, and any fallback wording. If adding snapshot
   tests, update their expected output in this same change—never regenerate them
   without reviewing the diff.
6. Run `npm run check`, preview both narrow and wide layouts, confirm all old-label
   search hits are intentional, and commit the coordinated rollover as one change.

For an in-progress season, refresh all related datasets on the same stated cutoff
date where possible. If their cutoffs differ, show each date explicitly rather
than implying that the dashboard is internally synchronized.

## Data ingestion, provider review, and redistribution

### Supported datasets and contracts

The application supports exactly three 2023/24 historical datasets: the final
20-club standings (`src/data/standings.ts`), the leading eight scorers
(`src/data/scorers.ts`), and all ten matchweek 38 fixtures
(`public/data/premier-league-2023-24-fixtures.json`). Only fixtures have an
automated ingestion path. The checked-in JSON is schema version 1 and uses the
repository-owned `FixtureSnapshot`, `SnapshotMetadata`, `Fixture`, and
`FixtureStatus` contracts in `src/types/football.ts`; browser and ingestion code
both validate it through `src/services/fixtures.ts`.

### Review of `tarun7r/Premier-League-API`

The GitHub project was evaluated as a possible source, but **no data from it is
imported or redistributed here**. Do not treat a public repository as a data
licence. Before it could be selected, a maintainer must record a reviewed commit
SHA (not a moving branch), enumerate and test its routes and response examples,
confirm its authentication and rate-limit behavior, and obtain terms granting
this project's intended caching and redistribution. At the time of this review,
this repository has no evidence of such a grant or a stable, authenticated
contract. An API that proxies or scrapes Premier League pages also cannot grant
rights it does not own. Its deployment availability, CORS policy, and undocumented
response shapes are not a suitable browser dependency. Consequently its routes
and payloads are deliberately not encoded into this application.

The Premier League [website terms](https://www.premierleague.com/terms-and-conditions)
and [copyright notice](https://www.premierleague.com/copyright) must be reviewed
for the intended territory and use before copying official-site material. In
particular, access to a website does not itself authorize systematic extraction,
creation of a competing database, commercial reuse, or redistribution of league
marks and data. This is a project policy summary, not legal advice; obtain
permission or counsel where necessary.

### Selected fixture provider

Fixture ingestion instead targets the documented football-data.org **API v4**
route `GET https://api.football-data.org/v4/competitions/PL/matches?season=2023`.
The `/v4` API generation, competition code, season parameter, expected 380-match
response, 20 exact club names, and local output count are pinned in
`scripts/ingest-fixtures.ts`. It sends `X-Auth-Token` from
`FOOTBALL_DATA_API_TOKEN`; that value is never written to output or shipped to
the browser. Review the provider's current
[terms](https://www.football-data.org/terms) and plan limits before each use.
Neither those terms nor this repository's software licence automatically grant
permission to republish the resulting statistics.

The upstream feed may report `FINISHED`, `SCHEDULED`, `TIMED`, `IN_PLAY`,
`PAUSED`, `POSTPONED`, `SUSPENDED`, `CANCELLED`, or `AWARDED`. They map to the
similarly named local states; `TIMED` maps to `scheduled`. Finished and awarded
records require scores, while scheduled, postponed, suspended, and cancelled
records prohibit them. Partial scores are always rejected.

### Refreshing fixtures safely

Use Node 22.6 or newer and a provider key kept in local/Actions secrets:

```bash
cp .env.example .env.local # do not commit this file; export values in your shell
export FOOTBALL_DATA_API_TOKEN='...'
export SNAPSHOT_RETRIEVED_AT='2026-07-27T00:00:00Z' # optional, aids reproducibility
npm run ingest:fixtures
npm run check
```

The script retrieves the complete season dataset, then validates competition,
season start, exact club identities, parseable UTC dates, matchweek, all known
statuses, score/status consistency, unique IDs, and exactly 380 upstream records.
It deterministically sorts and writes the ten matchweek 38 records with provider,
exact route, retrieval timestamp, represented season, cutoff, and finality
metadata. Serialization occurs to a temporary file only after retrieval, mapping,
and validation succeed; an atomic rename replaces the snapshot. A timeout,
HTTP/auth error, malformed response, unknown status or count mismatch exits
non-zero and leaves the last known-good snapshot untouched.

Refreshes are intentionally manual because this is a completed historical season;
there is no scheduled workflow and no freshness claim that requires one. If a
future live-season dataset needs automation, use a scheduled workflow with the
token in Actions secrets, run ingestion and `npm run check`, and have it open a
pull request for human provenance/licensing and data-diff review. It must not
commit directly to the publishing branch or deploy an unreviewed snapshot.
