/**
 * Build-time fixture ingestion. Requires Node 22.6+ (native TypeScript stripping).
 * The browser never contacts the provider and never receives the API token.
 */
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  PREMIER_LEAGUE_2025_26_CLUBS,
  parseFixtureSnapshot,
  parseUpstreamFixtures,
} from "../src/services/fixtures.ts";
import type { FixtureSnapshot } from "../src/types/football.ts";

const API_REVISION = "football-data.org API v4";
const UPSTREAM_ROUTE =
  "https://api.football-data.org/v4/competitions/PL/matches?season=2025";
const OUTPUT = resolve("public/data/premier-league-2025-26-fixtures.json");

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
  seasonStartYear: 2025,
  seasonEndYear: 2026,
  expectedCount: 380,
  clubs: PREMIER_LEAGUE_2025_26_CLUBS,
});
const matches = season.sort(
  (a, b) => a.kickoff.localeCompare(b.kickoff) || a.id.localeCompare(b.id),
);
const retrievedAt =
  process.env.SNAPSHOT_RETRIEVED_AT ?? new Date().toISOString();
const snapshot: FixtureSnapshot = {
  schemaVersion: 1,
  competition: { code: "PL" },
  season: { label: "2025/26", startDate: "2025-08-16", endDate: "2026-05-24" },
  metadata: {
    provider: API_REVISION,
    upstream: UPSTREAM_ROUTE,
    retrievedAt,
    season: "2025/26",
    dataCutoff: retrievedAt,
    status: "provisional",
    note: "Complete 380-match schedule snapshot; kickoff times and statuses remain provisional.",
  },
  matches,
};

// Validate repository format before touching the last known-good file. Rename is atomic.
parseFixtureSnapshot(snapshot, 380);
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
console.log(`Wrote ${matches.length} validated fixtures to ${OUTPUT}`);
