import { describe, expect, it } from "vitest";
import {
  filterFixtures,
  normalizeFixture,
  renderFixtures,
  sortFixtures,
} from "../../src/fixtures";
import type { NormalizedFixture } from "../../src/fixtures";
import type { Fixture } from "../../src/types/football";

const feedFixture: Fixture = {
  id: "12",
  kickoff: "2024-08-16T19:00:00Z",
  status: "scheduled",
  matchweek: 1,
  homeTeam: "Manchester United FC",
  awayTeam: "Fulham FC",
  homeScore: null,
  awayScore: null,
};

const normalized = (
  overrides: Partial<NormalizedFixture>,
): NormalizedFixture => ({
  id: "1",
  kickoff: new Date("2024-05-19T15:00:00Z"),
  status: "finished",
  matchweek: 38,
  homeTeam: "Arsenal",
  awayTeam: "Everton",
  homeScore: 2,
  awayScore: 1,
  ...overrides,
});

describe("fixture utilities", () => {
  it("normalizes fixture fields", () => {
    expect(normalizeFixture(feedFixture)).toMatchObject({
      id: "12",
      status: "scheduled",
      homeTeam: "Manchester United FC",
      awayTeam: "Fulham FC",
      homeScore: null,
    });
  });

  it("combines team and status filters", () => {
    const fixtures = [
      normalized({ id: "1" }),
      normalized({
        id: "2",
        homeTeam: "Everton",
        awayTeam: "Fulham",
        status: "scheduled",
      }),
      normalized({ id: "3", homeTeam: "Fulham", awayTeam: "Chelsea" }),
    ];
    expect(
      filterFixtures(fixtures, { team: "everton", status: "scheduled" }),
    ).toHaveLength(1);
    expect(
      filterFixtures(fixtures, { team: "everton", status: "scheduled" })[0]?.id,
    ).toBe("2");
  });

  it("sorts chronologically without changing the input", () => {
    const fixtures = [
      normalized({ id: "2", kickoff: new Date("2024-08-17T12:00:00Z") }),
      normalized({ id: "1", kickoff: new Date("2024-08-16T19:00:00Z") }),
    ];
    expect(sortFixtures(fixtures).map(({ id }) => id)).toEqual(["1", "2"]);
    expect(fixtures.map(({ id }) => id)).toEqual(["2", "1"]);
  });

  it("renders unplayed matches without inventing scores", () => {
    const html = renderFixtures([
      normalized({ status: "scheduled", homeScore: null, awayScore: null }),
    ]);
    expect(html).toContain("Not played");
    expect(html.match(/<td>—<\/td>/g)).toHaveLength(2);
  });
});
