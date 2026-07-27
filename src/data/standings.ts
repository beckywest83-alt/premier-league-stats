import type { DatasetMetadata, Standing } from "../types/football";

export const standingsMetadata: DatasetMetadata = {
  season: "2025/26",
  status: "provisional",
  note: "Pre-season table at the 27 July 2025 fixture-snapshot cutoff; no league matches had been played.",
};

const clubs = [
  ["Arsenal", "ARS"], ["Aston Villa", "AVL"], ["Bournemouth", "BOU"],
  ["Brentford", "BRE"], ["Brighton & Hove Albion", "BHA"], ["Burnley", "BUR"],
  ["Chelsea", "CHE"], ["Crystal Palace", "CRY"], ["Everton", "EVE"],
  ["Fulham", "FUL"], ["Leeds United", "LEE"], ["Liverpool", "LIV"],
  ["Manchester City", "MCI"], ["Manchester United", "MUN"],
  ["Newcastle United", "NEW"], ["Nottingham Forest", "NFO"],
  ["Sunderland", "SUN"], ["Tottenham Hotspur", "TOT"],
  ["West Ham United", "WHU"], ["Wolverhampton Wanderers", "WOL"],
] as const;

export const standings: Standing[] = clubs.map(([club, shortName], index) => ({
  position: index + 1, club, shortName, played: 0, won: 0, drawn: 0, lost: 0,
  goalsFor: 0, goalsAgainst: 0, points: 0,
}));
