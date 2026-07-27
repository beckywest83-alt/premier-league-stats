import type { Fixture } from "./types/football";

export type FixtureStatus = Fixture["status"];

export interface NormalizedFixture {
  id: string;
  kickoff: Date;
  status: FixtureStatus;
  matchweek: number;
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
  const kickoff = new Date(fixture.kickoff);
  if (Number.isNaN(kickoff.valueOf())) {
    throw new Error(`Fixture ${fixture.id} has an invalid kickoff date.`);
  }
  return {
    id: fixture.id,
    kickoff,
    status: fixture.status,
    matchweek: fixture.matchweek,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
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
      left.kickoff.valueOf() - right.kickoff.valueOf() ||
      left.id.localeCompare(right.id),
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
