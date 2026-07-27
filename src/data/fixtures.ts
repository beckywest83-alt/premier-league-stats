import type { Fixture } from "../types/football";

export const fixtures: Fixture[] = [
  {
    id: "1",
    kickoff: "2024-05-19T15:00:00Z",
    status: "finished",
    matchweek: 38,
    homeTeam: "Arsenal FC",
    awayTeam: "Everton FC",
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: "2",
    kickoff: "2024-05-19T15:00:00Z",
    status: "finished",
    matchweek: 38,
    homeTeam: "Manchester City FC",
    awayTeam: "West Ham United FC",
    homeScore: 3,
    awayScore: 1,
  },
  {
    id: "3",
    kickoff: "2024-08-16T19:00:00Z",
    status: "scheduled",
    matchweek: 1,
    homeTeam: "Manchester United FC",
    awayTeam: "Fulham FC",
    homeScore: null,
    awayScore: null,
  },
];
