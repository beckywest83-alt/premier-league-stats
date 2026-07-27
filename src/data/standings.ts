import type { DatasetMetadata, Standing } from "../types/football";

export const standingsMetadata: DatasetMetadata = {
  season: "2023/24",
  status: "final",
  note: "Final table; Everton's eight-point deduction is included.",
};

export const standings: Standing[] = [
  { position: 1, club: "Manchester City", shortName: "MCI", played: 38, won: 28, drawn: 7, lost: 3, goalsFor: 96, goalsAgainst: 34, points: 91 },
  { position: 2, club: "Arsenal", shortName: "ARS", played: 38, won: 28, drawn: 5, lost: 5, goalsFor: 91, goalsAgainst: 29, points: 89 },
  { position: 3, club: "Liverpool", shortName: "LIV", played: 38, won: 24, drawn: 10, lost: 4, goalsFor: 86, goalsAgainst: 41, points: 82 },
  { position: 4, club: "Aston Villa", shortName: "AVL", played: 38, won: 20, drawn: 8, lost: 10, goalsFor: 76, goalsAgainst: 61, points: 68 },
  { position: 5, club: "Tottenham Hotspur", shortName: "TOT", played: 38, won: 20, drawn: 6, lost: 12, goalsFor: 74, goalsAgainst: 61, points: 66 },
  { position: 6, club: "Chelsea", shortName: "CHE", played: 38, won: 18, drawn: 9, lost: 11, goalsFor: 77, goalsAgainst: 63, points: 63 },
  { position: 7, club: "Newcastle United", shortName: "NEW", played: 38, won: 18, drawn: 6, lost: 14, goalsFor: 85, goalsAgainst: 62, points: 60 },
  { position: 8, club: "Manchester United", shortName: "MUN", played: 38, won: 18, drawn: 6, lost: 14, goalsFor: 57, goalsAgainst: 58, points: 60 },
  { position: 9, club: "West Ham United", shortName: "WHU", played: 38, won: 14, drawn: 10, lost: 14, goalsFor: 60, goalsAgainst: 74, points: 52 },
  { position: 10, club: "Crystal Palace", shortName: "CRY", played: 38, won: 13, drawn: 10, lost: 15, goalsFor: 57, goalsAgainst: 58, points: 49 },
  { position: 11, club: "Brighton & Hove Albion", shortName: "BHA", played: 38, won: 12, drawn: 12, lost: 14, goalsFor: 55, goalsAgainst: 62, points: 48 },
  { position: 12, club: "Bournemouth", shortName: "BOU", played: 38, won: 13, drawn: 9, lost: 16, goalsFor: 54, goalsAgainst: 67, points: 48 },
  { position: 13, club: "Fulham", shortName: "FUL", played: 38, won: 13, drawn: 8, lost: 17, goalsFor: 55, goalsAgainst: 61, points: 47 },
  { position: 14, club: "Wolverhampton Wanderers", shortName: "WOL", played: 38, won: 13, drawn: 7, lost: 18, goalsFor: 50, goalsAgainst: 65, points: 46 },
  { position: 15, club: "Everton", shortName: "EVE", played: 38, won: 13, drawn: 9, lost: 16, goalsFor: 40, goalsAgainst: 51, points: 40, pointsAdjustment: -8, state: "everton" },
  { position: 16, club: "Brentford", shortName: "BRE", played: 38, won: 10, drawn: 9, lost: 19, goalsFor: 56, goalsAgainst: 65, points: 39 },
  { position: 17, club: "Nottingham Forest", shortName: "NFO", played: 38, won: 9, drawn: 9, lost: 20, goalsFor: 49, goalsAgainst: 67, points: 32, pointsAdjustment: -4 },
  { position: 18, club: "Luton Town", shortName: "LUT", played: 38, won: 6, drawn: 8, lost: 24, goalsFor: 52, goalsAgainst: 85, points: 26, state: "relegated" },
  { position: 19, club: "Burnley", shortName: "BUR", played: 38, won: 5, drawn: 9, lost: 24, goalsFor: 41, goalsAgainst: 78, points: 24, state: "relegated" },
  { position: 20, club: "Sheffield United", shortName: "SHU", played: 38, won: 3, drawn: 7, lost: 28, goalsFor: 35, goalsAgainst: 104, points: 16, state: "relegated" },
];
