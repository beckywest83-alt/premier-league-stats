import { describe, expect, it } from "vitest";
import {
  parseFixtureSnapshot,
  parseUpstreamFixtures,
} from "../../src/services/fixtures";

const upstream = (overrides: Record<string, unknown> = {}) => ({
  competition: { code: "PL" },
  season: { startDate: "2023-08-11", endDate: "2024-05-19" },
  matches: [
    {
      id: 1,
      utcDate: "2024-05-19T15:00:00Z",
      status: "FINISHED",
      matchday: 38,
      homeTeam: { name: "Arsenal FC" },
      awayTeam: { name: "Everton FC" },
      score: { fullTime: { home: 2, away: 1 } },
      ...overrides,
    },
  ],
});

const options = {
  competitionCode: "PL",
  seasonStartYear: 2023,
  seasonEndYear: 2024,
  expectedCount: 1,
  clubs: ["Arsenal FC", "Everton FC"],
};

describe("shared fixture contract", () => {
  it("maps a validated v4 record into the local contract", () => {
    expect(parseUpstreamFixtures(upstream(), options)[0]).toEqual({
      id: "1",
      kickoff: "2024-05-19T15:00:00Z",
      matchweek: 38,
      homeTeam: "Arsenal FC",
      awayTeam: "Everton FC",
      status: "finished",
      homeScore: 2,
      awayScore: 1,
    });
  });

  it("rejects wrong competitions, clubs, counts, dates, and score states", () => {
    expect(() =>
      parseUpstreamFixtures(
        { ...upstream(), competition: { code: "CL" } },
        options,
      ),
    ).toThrow("Expected competition PL");
    expect(() =>
      parseUpstreamFixtures(
        upstream({ homeTeam: { name: "Unknown FC" } }),
        options,
      ),
    ).toThrow("unexpected club identity");
    expect(() =>
      parseUpstreamFixtures(upstream({ utcDate: "not-a-date" }), options),
    ).toThrow("utcDate is invalid");
    expect(() =>
      parseUpstreamFixtures(upstream({ status: "CANCELLED" }), options),
    ).toThrow("cannot include a score");
    expect(() =>
      parseUpstreamFixtures(upstream(), { ...options, expectedCount: 2 }),
    ).toThrow("Expected 2 fixtures");
  });

  it("validates metadata and duplicate snapshot IDs", () => {
    const fixture = parseUpstreamFixtures(upstream(), options)[0]!;
    const snapshot = {
      schemaVersion: 1,
      metadata: {
        provider: "provider",
        upstream: "https://example.test/fixtures",
        retrievedAt: "2025-08-01T00:00:00Z",
        season: "2023/24",
        dataCutoff: "2024-05-19T15:00:00Z",
        status: "final",
        note: "Complete.",
      },
      fixtures: [fixture],
    };
    expect(parseFixtureSnapshot(snapshot, 1).fixtures).toEqual([fixture]);
    expect(() =>
      parseFixtureSnapshot({ ...snapshot, fixtures: [fixture, fixture] }, 2),
    ).toThrow("Fixture IDs must be unique");
  });
});
