import type { DatasetMetadata, Scorer } from "../types/football";

export const scorersMetadata: DatasetMetadata = {
  season: "2023/24",
  status: "final",
  note: "Final Premier League Golden Boot standings.",
};

export const scorers: Scorer[] = [
  {
    position: 1,
    player: "Erling Haaland",
    club: "Manchester City",
    goals: 27,
    appearances: 31,
  },
  {
    position: 2,
    player: "Cole Palmer",
    club: "Chelsea",
    goals: 22,
    appearances: 31,
  },
  {
    position: 3,
    player: "Alexander Isak",
    club: "Newcastle United",
    goals: 21,
    appearances: 30,
  },
  {
    position: 4,
    player: "Ollie Watkins",
    club: "Aston Villa",
    goals: 19,
    appearances: 37,
  },
  {
    position: 4,
    player: "Dominic Solanke",
    club: "Bournemouth",
    goals: 19,
    appearances: 38,
  },
  {
    position: 4,
    player: "Phil Foden",
    club: "Manchester City",
    goals: 19,
    appearances: 35,
  },
  {
    position: 7,
    player: "Mohamed Salah",
    club: "Liverpool",
    goals: 18,
    appearances: 32,
  },
  {
    position: 8,
    player: "Son Heung-min",
    club: "Tottenham Hotspur",
    goals: 17,
    appearances: 35,
  },
];
