export type DatasetStatus = "projected" | "provisional" | "final";

export interface DatasetMetadata {
  season: string;
  status: DatasetStatus;
  note: string;
}

export interface SnapshotMetadata extends DatasetMetadata {
  provider: string;
  upstream: string;
  retrievedAt: string;
  dataCutoff: string;
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
  /** Base-aware URL for a locally approved, decorative player avatar. */
  avatarSrc: string;
}

export interface Fixture {
  id: string;
  kickoff: string;
  matchweek: number;
  homeTeam: string;
  awayTeam: string;
  status: FixtureStatus;
  homeScore: number | null;
  awayScore: number | null;
}

export type FixtureStatus =
  | "finished"
  | "scheduled"
  | "in-play"
  | "paused"
  | "postponed"
  | "suspended"
  | "cancelled"
  | "awarded";

export interface FixtureSnapshot {
  schemaVersion: 1;
  competition: { code: string };
  season: { label: string; startDate: string; endDate: string };
  metadata: SnapshotMetadata;
  matches: Fixture[];
}
