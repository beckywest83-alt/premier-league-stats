import { describe, expect, it } from "vitest";
import { validateStanding } from "../../src/components/standings";
import type { Standing } from "../../src/types/football";

const standing: Standing = {
  position: 1,
  club: "Example FC",
  shortName: "EXA",
  played: 3,
  won: 2,
  drawn: 1,
  lost: 0,
  goalsFor: 7,
  goalsAgainst: 2,
  points: 7,
};

describe("standing validation", () => {
  it("calculates and validates goal difference", () => {
    expect(validateStanding(standing)).toBe(5);
    expect(
      validateStanding({ ...standing, goalsFor: 1, goalsAgainst: 4 }),
    ).toBe(-3);
  });

  it("rejects inconsistent match totals", () => {
    expect(() => validateStanding({ ...standing, played: 4 })).toThrow(
      /do not balance/,
    );
  });
});
