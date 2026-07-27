/**
 * Build-time fixture ingestion. Requires Node 22.6+ (native TypeScript stripping).
 * The browser never contacts the provider and never receives the API token.
 */
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  parseFixtureSnapshot,
  parseUpstreamFixtures,
} from "../src/services/fixtures.ts";
import type { FixtureSnapshot } from "../src/types/football.ts";

const API_REVISION = "football-data.org API v4";
const UPSTREAM_ROUTE =
  "https://api.football-data.org/v4/competitions/PL/matches?season=2023";
const OUTPUT = resolve("public/data/premier-league-2023-24-fixtures.json");
const CLUBS = [
  "AFC Bournemouth",
  "Arsenal FC",
  "Aston Villa FC",
  "Brentford FC",
  "Brighton & Hove Albion FC",
  "Burnley FC",
  "Chelsea FC",
  "Crystal Palace FC",
  "Everton FC",
  "Fulham FC",
  "Liverpool FC",
  "Luton Town FC",
  "Manchester City FC",
  "Manchester United FC",
  "Newcastle United FC",
  "Nottingham Forest FC",
  "Sheffield United FC",
  "Tottenham Hotspur FC",
  "West Ham United FC",
  "Wolverhampton Wanderers FC",
] as const;

const token = process.env.FOOTBALL_DATA_API_TOKEN;
if (!token)
  throw new Error(
    "FOOTBALL_DATA_API_TOKEN is required; the snapshot was not changed.",
  );

const response = await fetch(UPSTREAM_ROUTE, {
  headers: { Accept: "application/json", "X-Auth-Token": token },
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok)
  throw new Error(
    `Upstream request failed (${response.status}); snapshot unchanged.`,
  );

const season = parseUpstreamFixtures(await response.json(), {
  competitionCode: "PL",
  seasonStartYear: 2023,
  seasonEndYear: 2024,
  expectedCount: 380,
  clubs: CLUBS,
});
const fixtures = season
  .filter(({ matchweek }) => matchweek === 38)
  .sort(
    (a, b) => a.kickoff.localeCompare(b.kickoff) || a.id.localeCompare(b.id),
  );
const retrievedAt =
  process.env.SNAPSHOT_RETRIEVED_AT ?? new Date().toISOString();
const snapshot: FixtureSnapshot = {
  schemaVersion: 1,
  metadata: {
    provider: API_REVISION,
    upstream: UPSTREAM_ROUTE,
    retrievedAt,
    season: "2023/24",
    dataCutoff: "2024-05-19T15:00:00Z",
    status: "final",
    note: "All ten Premier League matchweek 38 fixtures; season feed validated at 380 matches.",
  },
  fixtures,
};

// Validate repository format before touching the last known-good file. Rename is atomic.
parseFixtureSnapshot(snapshot, 10);
await mkdir(dirname(OUTPUT), { recursive: true });
const temporary = `${OUTPUT}.tmp-${process.pid}`;
try {
  await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, {
    flag: "wx",
    mode: 0o644,
  });
  await rename(temporary, OUTPUT);
} finally {
  await rm(temporary, { force: true });
}
console.log(`Wrote ${fixtures.length} validated fixtures to ${OUTPUT}`);
