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
  kickoff: "2025-08-16T19:00:00Z",
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
  kickoff: new Date("2026-05-19T15:00:00Z"),
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
      normalized({ id: "2", kickoff: new Date("2025-08-17T12:00:00Z") }),
      normalized({ id: "1", kickoff: new Date("2025-08-16T19:00:00Z") }),
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

import { readFileSync } from "node:fs";
import {
  parseFixtureSnapshot,
  PREMIER_LEAGUE_2025_26_CLUBS,
} from "../../src/services/fixtures";

const actualSnapshot = () =>
  JSON.parse(
    readFileSync(
      new URL(
        "../../public/data/premier-league-2025-26-fixtures.json",
        import.meta.url,
      ),
      "utf8",
    ),
  ) as Record<string, unknown>;

describe("2025/26 fixture snapshot", () => {
  it("parses the actual provider-derived snapshot envelope", () => {
    const parsed = parseFixtureSnapshot(actualSnapshot());
    expect(parsed.competition.code).toBe("PL");
    expect(parsed.season.label).toBe("2025/26");
    expect(parsed.matches).toHaveLength(380);
  });

  it("enforces season-level club, matchweek, pairing, and ID invariants", () => {
    const matches = parseFixtureSnapshot(actualSnapshot()).matches;
    expect(new Set(matches.map(({ id }) => id))).toHaveProperty("size", 380);
    expect(
      new Set(
        matches.flatMap(({ homeTeam, awayTeam }) => [homeTeam, awayTeam]),
      ),
    ).toEqual(new Set(PREMIER_LEAGUE_2025_26_CLUBS));
    for (const club of PREMIER_LEAGUE_2025_26_CLUBS) {
      expect(
        matches.filter(
          ({ homeTeam, awayTeam }) => homeTeam === club || awayTeam === club,
        ),
      ).toHaveLength(38);
    }
    for (let week = 1; week <= 38; week += 1) {
      expect(
        matches.filter(({ matchweek }) => matchweek === week),
      ).toHaveLength(10);
    }
  });

  it("rejects metadata mismatches before accepting matches", () => {
    expect(() =>
      parseFixtureSnapshot({
        ...actualSnapshot(),
        competition: { code: "CL" },
      }),
    ).toThrow("Expected competition PL");
    expect(() =>
      parseFixtureSnapshot({
        ...actualSnapshot(),
        season: {
          label: "2024/25",
          startDate: "2024-08-01",
          endDate: "2025-05-31",
        },
      }),
    ).toThrow("Expected season 2025/26");
    const snapshot = actualSnapshot();
    expect(() =>
      parseFixtureSnapshot({
        ...snapshot,
        metadata: { ...(snapshot.metadata as object), season: "2024/25" },
      }),
    ).toThrow("metadata season");
  });

  it("rejects malformed matches, unsupported statuses, and duplicate IDs", () => {
    const snapshot = actualSnapshot();
    const matches = snapshot.matches as Array<Record<string, unknown>>;
    const replace = (index: number, values: Record<string, unknown>) => ({
      ...snapshot,
      matches: matches.map((match, i) =>
        i === index ? { ...match, ...values } : match,
      ),
    });
    expect(() =>
      parseFixtureSnapshot(replace(0, { kickoff: "never" })),
    ).toThrow("kickoff is invalid");
    expect(() =>
      parseFixtureSnapshot(replace(0, { status: "UNKNOWN" })),
    ).toThrow("status is invalid");
    expect(() =>
      parseFixtureSnapshot(replace(0, { id: matches[1]?.id })),
    ).toThrow("Fixture IDs must be unique");
    expect(() =>
      parseFixtureSnapshot(
        replace(0, { status: "scheduled", homeScore: 1, awayScore: 0 }),
      ),
    ).toThrow("cannot include a score");
    expect(() =>
      parseFixtureSnapshot(
        replace(0, { status: "finished", homeScore: null, awayScore: null }),
      ),
    ).toThrow("must include both scores");
    expect(() => parseFixtureSnapshot(replace(0, { matchweek: 39 }))).toThrow(
      "must not exceed 38",
    );
  });
});
