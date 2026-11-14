/** Client-safe classifier for a Path card's Watchman posture. An accepted Watchman outranks a pending invitation. */
export type WatchmanCoverage = "watched" | "invited" | "unwatched";

export function watchmanCoverage(active: number, pending: number): WatchmanCoverage {
  if (active > 0) return "watched";
  if (pending > 0) return "invited";
  return "unwatched";
}
