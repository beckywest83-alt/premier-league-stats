import type {
  Fixture,
  FixtureSnapshot,
  FixtureStatus,
  SnapshotMetadata,
} from "../types/football";

const FIXTURES_PATH = "data/premier-league-2023-24-fixtures.json";
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
  if (["finished", "awarded"].includes(fixture.status) && !hasBoth)
    throw new Error(`${label} must include both scores.`);
  if (
    ["scheduled", "postponed", "suspended", "cancelled"].includes(
      fixture.status,
    ) &&
    !hasNeither
  )
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
): void {
  if (fixtures.length !== expectedCount)
    throw new Error(
      `Expected ${expectedCount} fixtures, received ${fixtures.length}.`,
    );
  if (new Set(fixtures.map(({ id }) => id)).size !== fixtures.length)
    throw new Error("Fixture IDs must be unique.");
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
  expectedCount = 10,
): FixtureSnapshot {
  const payload = object(input, "Fixture snapshot");
  if (payload.schemaVersion !== 1)
    throw new Error("Unsupported snapshot schema version.");
  if (!Array.isArray(payload.fixtures))
    throw new Error("fixtures must be an array.");
  const fixtures = payload.fixtures.map((value, index) => {
    const fixture = object(value, `fixtures[${index}]`);
    const status = nonEmptyString(fixture.status, `fixtures[${index}].status`);
    if (!Object.values(UPSTREAM_STATUS_MAP).includes(status as FixtureStatus))
      throw new Error(`fixtures[${index}].status is invalid.`);
    const parsed: Fixture = {
      id: nonEmptyString(fixture.id, `fixtures[${index}].id`),
      kickoff: isoDate(fixture.kickoff, `fixtures[${index}].kickoff`),
      matchweek: integer(fixture.matchweek, `fixtures[${index}].matchweek`, 1),
      homeTeam: nonEmptyString(fixture.homeTeam, `fixtures[${index}].homeTeam`),
      awayTeam: nonEmptyString(fixture.awayTeam, `fixtures[${index}].awayTeam`),
      status: status as FixtureStatus,
      homeScore: nullableScore(
        fixture.homeScore,
        `fixtures[${index}].homeScore`,
      ),
      awayScore: nullableScore(
        fixture.awayScore,
        `fixtures[${index}].awayScore`,
      ),
    };
    if (parsed.homeTeam === parsed.awayTeam)
      throw new Error(`fixtures[${index}] repeats a club.`);
    validateScores(parsed, `fixtures[${index}]`);
    return parsed;
  });
  validateFixtureSet(fixtures, expectedCount);
  return {
    schemaVersion: 1,
    metadata: parseMetadata(payload.metadata),
    fixtures,
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
  return parseFixtureSnapshot(await response.json()).fixtures;
}
