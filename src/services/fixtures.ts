import type {
  Fixture,
  FixtureSnapshot,
  FixtureStatus,
  SnapshotMetadata,
} from "../types/football";

export const FIXTURES_PATH = "data/premier-league-2025-26-fixtures.json";
export const PREMIER_LEAGUE_2025_26_CLUBS = [
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
  "Leeds United FC",
  "Liverpool FC",
  "Manchester City FC",
  "Manchester United FC",
  "Newcastle United FC",
  "Nottingham Forest FC",
  "Sunderland AFC",
  "Tottenham Hotspur FC",
  "West Ham United FC",
  "Wolverhampton Wanderers FC",
] as const;
type JsonObject = Record<string, unknown>;

function object(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(`${label} must be an object.`);
  return value as JsonObject;
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} must be a non-empty string.`);
  return value;
}

function integer(value: unknown, label: string, minimum = 0): number {
  if (!Number.isInteger(value) || (value as number) < minimum)
    throw new Error(`${label} must be an integer of at least ${minimum}.`);
  return value as number;
}

function nullableScore(value: unknown, label: string): number | null {
  return value === null ? null : integer(value, label);
}

function isoDate(value: unknown, label: string): string {
  const result = nonEmptyString(value, label);
  if (Number.isNaN(Date.parse(result))) throw new Error(`${label} is invalid.`);
  return result;
}

export const UPSTREAM_STATUS_MAP: Readonly<Record<string, FixtureStatus>> = {
  FINISHED: "finished",
  SCHEDULED: "scheduled",
  TIMED: "scheduled",
  IN_PLAY: "in-play",
  PAUSED: "paused",
  POSTPONED: "postponed",
  SUSPENDED: "suspended",
  CANCELLED: "cancelled",
  AWARDED: "awarded",
};

function validateScores(fixture: Fixture, label: string): void {
  const hasBoth = fixture.homeScore !== null && fixture.awayScore !== null;
  const hasNeither = fixture.homeScore === null && fixture.awayScore === null;
  if (!hasBoth && !hasNeither) throw new Error(`${label} has a partial score.`);
  if (fixture.status === "finished" && !hasBoth)
    throw new Error(`${label} must include both scores.`);
  if (fixture.status !== "finished" && !hasNeither)
    throw new Error(`${label} cannot include a score.`);
}

export interface UpstreamValidationOptions {
  competitionCode: string;
  seasonStartYear: number;
  seasonEndYear: number;
  expectedCount: number;
  clubs: readonly string[];
}

/** Map football-data.org API v4 records into the repository-owned Fixture contract. */
export function parseUpstreamFixtures(
  input: unknown,
  options: UpstreamValidationOptions,
): Fixture[] {
  const payload = object(input, "Upstream response");
  const competition = object(payload.competition, "competition");
  const season = object(payload.season, "season");
  if (competition.code !== options.competitionCode)
    throw new Error(`Expected competition ${options.competitionCode}.`);
  const seasonStart = isoDate(season.startDate, "season.startDate");
  const seasonEnd = isoDate(season.endDate, "season.endDate");
  if (new Date(seasonStart).getUTCFullYear() !== options.seasonStartYear)
    throw new Error(`Expected season starting ${options.seasonStartYear}.`);
  if (new Date(seasonEnd).getUTCFullYear() !== options.seasonEndYear)
    throw new Error(`Expected season ending ${options.seasonEndYear}.`);
  if (!Array.isArray(payload.matches))
    throw new Error("matches must be an array.");

  const allowedClubs = new Set(options.clubs);
  const fixtures = payload.matches.map((value, index): Fixture => {
    const label = `matches[${index}]`;
    const match = object(value, label);
    const home = object(match.homeTeam, `${label}.homeTeam`);
    const away = object(match.awayTeam, `${label}.awayTeam`);
    const score = object(match.score, `${label}.score`);
    const fullTime = object(score.fullTime, `${label}.score.fullTime`);
    const homeTeam = nonEmptyString(home.name, `${label}.homeTeam.name`);
    const awayTeam = nonEmptyString(away.name, `${label}.awayTeam.name`);
    if (
      homeTeam === awayTeam ||
      !allowedClubs.has(homeTeam) ||
      !allowedClubs.has(awayTeam)
    )
      throw new Error(`${label} contains an unexpected club identity.`);
    const sourceStatus = nonEmptyString(match.status, `${label}.status`);
    const status = UPSTREAM_STATUS_MAP[sourceStatus];
    if (!status)
      throw new Error(`${label}.status ${sourceStatus} is unsupported.`);
    const id = match.id;
    if ((typeof id !== "number" && typeof id !== "string") || !String(id))
      throw new Error(`${label}.id is invalid.`);
    const fixture: Fixture = {
      id: String(id),
      kickoff: isoDate(match.utcDate, `${label}.utcDate`),
      matchweek: integer(match.matchday, `${label}.matchday`, 1),
      homeTeam,
      awayTeam,
      status,
      homeScore: nullableScore(fullTime.home, `${label}.score.fullTime.home`),
      awayScore: nullableScore(fullTime.away, `${label}.score.fullTime.away`),
    };
    if (fixture.matchweek > 38)
      throw new Error(`${label}.matchday must not exceed 38.`);
    if (
      fixture.kickoff.slice(0, 10) < seasonStart ||
      fixture.kickoff.slice(0, 10) > seasonEnd
    )
      throw new Error(`${label}.utcDate falls outside the represented season.`);
    validateScores(fixture, label);
    return fixture;
  });
  validateFixtureSet(fixtures, options.expectedCount);
  return fixtures;
}

export function validateFixtureSet(
  fixtures: Fixture[],
  expectedCount: number,
  clubs?: readonly string[],
): void {
  if (fixtures.length !== expectedCount)
    throw new Error(
      `Expected ${expectedCount} fixtures, received ${fixtures.length}.`,
    );
  if (new Set(fixtures.map(({ id }) => id)).size !== fixtures.length)
    throw new Error("Fixture IDs must be unique.");
  if (!clubs) return;
  const recognized = new Set(clubs);
  const represented = new Set(
    fixtures.flatMap(({ homeTeam, awayTeam }) => [homeTeam, awayTeam]),
  );
  if (
    recognized.size !== 20 ||
    represented.size !== 20 ||
    [...represented].some((club) => !recognized.has(club))
  )
    throw new Error("Fixture set must contain exactly 20 recognized clubs.");
  for (const club of clubs) {
    const appearances = fixtures.filter(
      ({ homeTeam, awayTeam }) => homeTeam === club || awayTeam === club,
    );
    if (appearances.length !== 38)
      throw new Error(`${club} must have exactly 38 matches.`);
  }
  for (let matchweek = 1; matchweek <= 38; matchweek += 1) {
    const matches = fixtures.filter(
      (fixture) => fixture.matchweek === matchweek,
    );
    const participants = new Set(
      matches.flatMap(({ homeTeam, awayTeam }) => [homeTeam, awayTeam]),
    );
    if (matches.length !== 10 || participants.size !== 20)
      throw new Error(
        `Matchweek ${matchweek} must contain ten matches and every club once.`,
      );
  }
  for (const home of clubs)
    for (const away of clubs) {
      if (home === away) continue;
      if (
        fixtures.filter(
          (fixture) => fixture.homeTeam === home && fixture.awayTeam === away,
        ).length !== 1
      )
        throw new Error(
          `Expected exactly one ${home} home fixture against ${away}.`,
        );
    }
}

function parseMetadata(value: unknown): SnapshotMetadata {
  const metadata = object(value, "metadata");
  const status = nonEmptyString(metadata.status, "metadata.status");
  if (
    !(["projected", "provisional", "final"] as const).includes(status as never)
  )
    throw new Error("metadata.status is invalid.");
  return {
    provider: nonEmptyString(metadata.provider, "metadata.provider"),
    upstream: nonEmptyString(metadata.upstream, "metadata.upstream"),
    retrievedAt: isoDate(metadata.retrievedAt, "metadata.retrievedAt"),
    season: nonEmptyString(metadata.season, "metadata.season"),
    dataCutoff: isoDate(metadata.dataCutoff, "metadata.dataCutoff"),
    status: status as SnapshotMetadata["status"],
    note: nonEmptyString(metadata.note, "metadata.note"),
  };
}

export function parseFixtureSnapshot(
  input: unknown,
  expectedCount = 380,
): FixtureSnapshot {
  const payload = object(input, "Fixture snapshot");
  if (payload.schemaVersion !== 1)
    throw new Error("Unsupported snapshot schema version.");
  const competition = object(payload.competition, "competition");
  const season = object(payload.season, "season");
  if (competition.code !== "PL") throw new Error("Expected competition PL.");
  if (season.label !== "2025/26") throw new Error("Expected season 2025/26.");
  const startDate = isoDate(season.startDate, "season.startDate");
  const endDate = isoDate(season.endDate, "season.endDate");
  if (!Array.isArray(payload.matches))
    throw new Error("matches must be an array.");
  const metadata = parseMetadata(payload.metadata);
  if (metadata.season !== season.label)
    throw new Error(
      "Snapshot metadata season does not match represented season.",
    );
  const fixtures = payload.matches.map((value, index) => {
    const fixture = object(value, `matches[${index}]`);
    const status = nonEmptyString(fixture.status, `matches[${index}].status`);
    if (!Object.values(UPSTREAM_STATUS_MAP).includes(status as FixtureStatus))
      throw new Error(`matches[${index}].status is invalid.`);
    const parsed: Fixture = {
      id: nonEmptyString(fixture.id, `matches[${index}].id`),
      kickoff: isoDate(fixture.kickoff, `matches[${index}].kickoff`),
      matchweek: integer(fixture.matchweek, `matches[${index}].matchweek`, 1),
      homeTeam: nonEmptyString(fixture.homeTeam, `matches[${index}].homeTeam`),
      awayTeam: nonEmptyString(fixture.awayTeam, `matches[${index}].awayTeam`),
      status: status as FixtureStatus,
      homeScore: nullableScore(
        fixture.homeScore,
        `matches[${index}].homeScore`,
      ),
      awayScore: nullableScore(
        fixture.awayScore,
        `matches[${index}].awayScore`,
      ),
    };
    if (parsed.matchweek > 38)
      throw new Error(`matches[${index}].matchweek must not exceed 38.`);
    if (parsed.homeTeam === parsed.awayTeam)
      throw new Error(`matches[${index}] repeats a club.`);
    if (
      parsed.kickoff.slice(0, 10) < startDate ||
      parsed.kickoff.slice(0, 10) > endDate
    )
      throw new Error(
        `matches[${index}].kickoff falls outside the represented season.`,
      );
    validateScores(parsed, `matches[${index}]`);
    return parsed;
  });
  validateFixtureSet(
    fixtures,
    expectedCount,
    expectedCount === 380 ? PREMIER_LEAGUE_2025_26_CLUBS : undefined,
  );
  return {
    schemaVersion: 1,
    competition: { code: "PL" },
    season: { label: "2025/26", startDate, endDate },
    metadata,
    matches: fixtures,
  };
}

export async function fetchFixtures(signal?: AbortSignal): Promise<Fixture[]> {
  const fixturesUrl = new URL(FIXTURES_PATH, document.baseURI);
  const response = await fetch(fixturesUrl, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(`Fixture request failed (${response.status}).`);
  return parseFixtureSnapshot(await response.json()).matches;
}
