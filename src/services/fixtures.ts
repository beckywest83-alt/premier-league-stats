import type { Fixture } from "../types/football";

const FIXTURES_PATH = "data/premier-league-2023-24-fixtures.json";

type JsonObject = Record<string, unknown>;

function object(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as JsonObject;
}

function string(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string.`);
  return value;
}

function score(value: unknown, label: string): number | null {
  if (value === null) return null;
  if (!Number.isInteger(value) || (value as number) < 0) throw new Error(`${label} must be a non-negative integer or null.`);
  return value as number;
}

function normalizeMatch(value: unknown, index: number): Fixture {
  const match = object(value, `matches[${index}]`);
  const home = object(match.homeTeam, `matches[${index}].homeTeam`);
  const away = object(match.awayTeam, `matches[${index}].awayTeam`);
  const fullTime = object(object(match.score, `matches[${index}].score`).fullTime, `matches[${index}].score.fullTime`);
  const matchweek = match.matchday;
  if (!Number.isInteger(matchweek) || (matchweek as number) < 1) throw new Error(`matches[${index}].matchday is invalid.`);
  const kickoff = string(match.utcDate, `matches[${index}].utcDate`);
  if (Number.isNaN(Date.parse(kickoff))) throw new Error(`matches[${index}].utcDate is invalid.`);
  const sourceStatus = string(match.status, `matches[${index}].status`);
  const statuses: Record<string, Fixture["status"]> = { FINISHED: "finished", SCHEDULED: "scheduled", TIMED: "scheduled", POSTPONED: "postponed" };
  const status = statuses[sourceStatus];
  if (!status) throw new Error(`matches[${index}].status is unsupported.`);
  const homeScore = score(fullTime.home, `matches[${index}].score.fullTime.home`);
  const awayScore = score(fullTime.away, `matches[${index}].score.fullTime.away`);
  if (status === "finished" && (homeScore === null || awayScore === null)) throw new Error(`Finished match ${index} must include both scores.`);
  if (status !== "finished" && (homeScore !== null || awayScore !== null)) throw new Error(`Unplayed match ${index} cannot include a score.`);

  if ((typeof match.id !== "number" && typeof match.id !== "string") || String(match.id).length === 0) throw new Error(`matches[${index}].id is invalid.`);
  return {
    id: String(match.id), kickoff, matchweek: matchweek as number,
    homeTeam: string(home.name, `matches[${index}].homeTeam.name`),
    awayTeam: string(away.name, `matches[${index}].awayTeam.name`),
    status, homeScore, awayScore,
  };
}

export async function fetchFixtures(signal?: AbortSignal): Promise<Fixture[]> {
  // Resolve the snapshot from the document rather than the domain root. GitHub
  // Pages hosts project sites below /<repository>/, so a root-relative URL
  // would request another site's /data directory and return a 404.
  const fixturesUrl = new URL(FIXTURES_PATH, document.baseURI);
  const response = await fetch(fixturesUrl, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Fixture request failed (${response.status}).`);
  const payload = object(await response.json(), "Fixture response");
  if (!Array.isArray(payload.matches)) throw new Error("Fixture response must contain a matches array.");
  const fixtures = payload.matches.map(normalizeMatch);
  if (new Set(fixtures.map(({ id }) => id)).size !== fixtures.length) throw new Error("Fixture IDs must be unique.");
  return fixtures;
}
