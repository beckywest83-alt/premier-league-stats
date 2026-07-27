import type { Fixture } from "./types/football";

export type FixtureStatus = "FINISHED" | "SCHEDULED";

export interface NormalizedFixture {
  id: number;
  kickoff: Date;
  status: FixtureStatus;
  matchday: number | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
}

export interface FixtureFilters {
  team?: string;
  status?: FixtureStatus | "ALL";
}

export function normalizeFixture(fixture: Fixture): NormalizedFixture {
  const kickoff = new Date(fixture.utcDate);
  if (Number.isNaN(kickoff.valueOf())) {
    throw new Error(`Fixture ${fixture.id} has an invalid kickoff date.`);
  }
  if (fixture.status !== "FINISHED" && fixture.status !== "SCHEDULED") {
    throw new Error(`Fixture ${fixture.id} has an unsupported status.`);
  }

  return {
    id: fixture.id,
    kickoff,
    status: fixture.status,
    matchday: fixture.matchday,
    homeTeam: fixture.homeTeam.shortName ?? fixture.homeTeam.name,
    awayTeam: fixture.awayTeam.shortName ?? fixture.awayTeam.name,
    homeScore: fixture.score.fullTime.home,
    awayScore: fixture.score.fullTime.away,
  };
}

export function filterFixtures(
  fixtures: NormalizedFixture[],
  { team = "", status = "ALL" }: FixtureFilters,
): NormalizedFixture[] {
  const query = team.trim().toLocaleLowerCase();
  return fixtures.filter(
    (fixture) =>
      (status === "ALL" || fixture.status === status) &&
      (!query ||
        fixture.homeTeam.toLocaleLowerCase().includes(query) ||
        fixture.awayTeam.toLocaleLowerCase().includes(query)),
  );
}

export function sortFixtures(
  fixtures: NormalizedFixture[],
): NormalizedFixture[] {
  return [...fixtures].sort(
    (left, right) =>
      left.kickoff.valueOf() - right.kickoff.valueOf() || left.id - right.id,
  );
}

export function renderFixtures(fixtures: NormalizedFixture[]): string {
  if (fixtures.length === 0) {
    return '<tr><td colspan="4" class="empty-state">No matches match these filters.</td></tr>';
  }

  return fixtures
    .map((fixture) => {
      const unplayed = fixture.homeScore === null || fixture.awayScore === null;
      const homeScore = unplayed ? "—" : fixture.homeScore;
      const awayScore = unplayed ? "—" : fixture.awayScore;
      const label = unplayed
        ? '<span class="match-state">Not played</span>'
        : "";
      return `<tr><th scope="row">${fixture.homeTeam}${label}</th><td>${homeScore}</td><td>${awayScore}</td><td>${fixture.awayTeam}</td></tr>`;
    })
    .join("");
}
