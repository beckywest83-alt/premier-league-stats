export type DatasetStatus = "projected" | "provisional" | "final";

export interface DatasetMetadata {
  season: string;
  status: DatasetStatus;
  note: string;
}

export interface Standing {
  position: number;
  club: string;
  shortName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  pointsAdjustment?: number;
  state?: "everton" | "relegated";
}

export interface Scorer {
  position: number;
  player: string;
  club: string;
  goals: number;
  appearances?: number;
}

export interface Fixture {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  homeTeam: { id: number; name: string; shortName?: string };
  awayTeam: { id: number; name: string; shortName?: string };
  score: {
    winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    fullTime: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
}

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

/** Shape returned by the external football-data fixture feed. */
export interface FixtureFeedResponse {
  count: number;
  filters: Record<string, unknown>;
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem?: string;
  };
  matches: Fixture[];
}
