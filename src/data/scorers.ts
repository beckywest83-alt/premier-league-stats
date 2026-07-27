import type { DatasetMetadata, Scorer } from "../types/football";

export const scorersMetadata: DatasetMetadata = {
  season: "2025/26",
  status: "provisional",
  note: "No goals had been scored at the 27 July 2025 pre-season cutoff.",
};

/** The scorer list is intentionally empty until a completed fixture supplies goals. */
export const scorers: Scorer[] = [];
