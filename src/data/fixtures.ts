import type { Fixture } from "../types/football";

export const fixtures: Fixture[] = [
  {
    id: 1,
    utcDate: "2024-05-19T15:00:00Z",
    status: "FINISHED",
    matchday: 38,
    homeTeam: { id: 57, name: "Arsenal FC", shortName: "Arsenal" },
    awayTeam: { id: 62, name: "Everton FC", shortName: "Everton" },
    score: { winner: "HOME_TEAM", fullTime: { home: 2, away: 1 } },
  },
  {
    id: 2,
    utcDate: "2024-05-19T15:00:00Z",
    status: "FINISHED",
    matchday: 38,
    homeTeam: { id: 65, name: "Manchester City FC", shortName: "Man City" },
    awayTeam: { id: 563, name: "West Ham United FC", shortName: "West Ham" },
    score: { winner: "HOME_TEAM", fullTime: { home: 3, away: 1 } },
  },
  {
    id: 3,
    utcDate: "2024-08-16T19:00:00Z",
    status: "SCHEDULED",
    matchday: 1,
    homeTeam: { id: 66, name: "Manchester United FC", shortName: "Man United" },
    awayTeam: { id: 63, name: "Fulham FC", shortName: "Fulham" },
    score: { winner: null, fullTime: { home: null, away: null } },
  },
];
