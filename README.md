# Premier League Stats

> **Unofficial fan project.** This site is not affiliated with or endorsed by the
> Premier League, its clubs, or football-data.org.

An accessible Vite dashboard representing the **2025/26 Premier League** from a
single, dated repository snapshot. The current data cutoff is **27 July 2025**,
so the schedule, zero-match table, and empty scorer list are explicitly
**provisional**, not live or final statistics.

## Run locally

Node.js 22 and npm are recommended.

```sh
npm ci
npm run dev
npm run check
```

The development server prints its URL. `npm run build && npm run preview` serves
the production build locally. Vite's `/premier-league-stats/` base keeps built
assets and the fixture request beneath the GitHub Pages project path.

## Data provenance, freshness, and coverage

| Dataset | Coverage at cutoff | Status | Repository source | Provenance |
| --- | --- | --- | --- | --- |
| Fixtures | 2025/26 matchweeks 1–38; 380 matches | Provisional | `public/data/premier-league-2025-26-fixtures.json` | football-data.org API v4 competition feed, season parameter `2025`; retrieved 27 July 2025 |
| Standings | 20 clubs; no completed matches at the shared cutoff | Provisional | `src/data/standings.ts` | Derived from the validated fixture club set and completed-match count |
| Top scorers | No scorers before a completed match | Provisional | `src/data/scorers.ts` | Derived from the same pre-season cutoff |

The checked-in snapshot preserves provider UTC timestamps and IDs while mapping
provider statuses into the repository contract. Its envelope records the
competition, represented season, upstream URL, retrieval timestamp, and cutoff.
Kickoff times can change, so the schedule remains provisional even though all
380 fixtures are represented. No open-data licence is asserted; confirm the
provider's current terms before redistributing or refreshing its data.

The browser makes **no live provider request** and receives no API token. It
loads the checked-in snapshot only. If that static file cannot be loaded or
validated, the results panel shows an error and retry action; it does not fall
back to an older season or silently present stale fixtures.

### Approved fixture ingestion

`npm run ingest:fixtures` is the sole fixture import mechanism. It requires Node
22.6+ and `FOOTBALL_DATA_API_TOKEN`; the token is read from the environment and
is never written to browser assets. The importer:

1. requests the football-data.org Premier League `season=2025` feed;
2. validates competition and season metadata before reading matches;
3. validates exactly 380 unique fixtures, 20 recognized clubs, 38 matches per
   club, ten matches/every club once per matchweek, every ordered home/away
   pairing once, UTC dates, supported statuses, and score/status consistency;
4. writes a schema-versioned temporary file and atomically renames it over the
   last known-good snapshot only after the complete snapshot passes validation.

Set `SNAPSHOT_RETRIEVED_AT` only when reproducing a documented retrieval. A
failed request or validation leaves the existing file unchanged. Standings,
scorers, visible labels, cutoff notes, tests, and this provenance table must be
reviewed and updated in the same commit as a refresh. Use `provisional` unless a
source verifies the imported dataset as final at its documented cutoff.

## Dataset contracts and derived totals

`src/types/football.ts` owns the fixture and statistics types;
`src/services/fixtures.ts` is the shared upstream/snapshot parser used by both
ingestion and browser loading. There is no TypeScript sample fixture collection,
so the JSON snapshot is the only fixture source of truth. The overview fixture
and goal totals are calculated after that snapshot validates rather than copied
into UI text. Standing arithmetic is also checked while rendering.

## Testing

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
```

Unit tests exercise the real snapshot envelope, malformed records, metadata
mismatches, unsupported status values, duplicate IDs, and full-season
invariants. Playwright covers the complete matchweek selector, early/middle/final
weeks, team filtering, scheduled and finished presentation, failure recovery,
keyboard operation, responsive table overflow, and automated accessibility.

## Deployment

The generated `dist/` directory is suitable for GitHub Pages but should not be
committed. Configure a GitHub Actions Pages workflow to use a supported Node
version, run `npm ci` and `npm run build`, upload `dist/`, and deploy with only
`contents: read`, `pages: write`, and `id-token: write` permissions. Configure
**Settings → Pages → Source** as **GitHub Actions**.

## Season rollover checklist

Treat a rollover atomically: update all three datasets, provider season
parameter, snapshot path, metadata and visible copy together. Validate club
identity, counts, pairings, dates, score states, table arithmetic, and scorer
ordering. Search every tracked file for the old season labels, endpoint, and
snapshot filename; retain historical references only when they are deliberately
documented. Finally run `npm run check` and inspect narrow and wide layouts.
