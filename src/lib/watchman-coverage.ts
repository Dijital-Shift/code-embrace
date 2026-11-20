/** Client-safe classifier for a Path card's Watchman posture. An accepted Watchman outranks a pending invitation. */
export type WatchmanCoverage = "watched" | "invited" | "unwatched";

export function watchmanCoverage(active: number, pending: number): WatchmanCoverage {
  if (active > 0) return "watched";
  if (pending > 0) return "invited";
  return "unwatched";
}

export type SeatPip = "manned" | "pending" | "empty";

/**
 * A Path has exactly two seats, so a card always draws two pips: manned seats first,
 * then one pending ring per open seat that has a link out, then empty rings.
 * Extra open links never add dots.
 */
export function seatPips(active: number, pending: number): SeatPip[] {
  const manned = Math.min(2, Math.max(0, active));
  const waiting = Math.min(2 - manned, Math.max(0, pending));
  return [
    ...Array<SeatPip>(manned).fill("manned"),
    ...Array<SeatPip>(waiting).fill("pending"),
    ...Array<SeatPip>(2 - manned - waiting).fill("empty"),
  ];
}
