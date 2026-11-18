/**
 * Client-safe rules for the reciprocal watch request: someone who opened your
 * Watchman link can later ask you to watch a Path of their own.
 */
export const WATCH_REFERRAL_KEY = "kp-watch-referral";
export const WATCH_REFERRAL_EVENT = "kp:watch-referral";
/** A remembered link is only useful while the visit is recent. */
export const WATCH_REFERRAL_TTL_MS = 60 * 24 * 60 * 60 * 1000;
export const STARTER_PATH_TITLE = "Send Scripture";

export function encodeWatchReferral(token: string, at: number): string {
  return JSON.stringify({ token, at });
}

export function decodeWatchReferral(raw: string | null, now: number): { token: string } | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { token?: unknown; at?: unknown };
    if (typeof v.token !== "string" || v.token.length < 10 || typeof v.at !== "number") return null;
    if (now - v.at > WATCH_REFERRAL_TTL_MS) return null;
    return { token: v.token };
  } catch {
    return null;
  }
}

export type WatchOfferInput = {
  selfId: string;
  referrerId: string | null;
  laneActive: boolean;
  laneTitle: string;
  /** The referrer already stands watch on this Path. */
  referrerWatching: boolean;
  /** Latest direct request this owner sent the referrer for this Path. */
  requestStatus: string | null;
  /** Active Watchmen plus direct requests still waiting on this Path. */
  seatsUsed: number;
  /** Active Paths of this owner the referrer already watches. */
  pairPaths: number;
};

/**
 * Whether to offer "Invite {name}" on a Path. Never on the starter Path, never
 * twice for the same Path, and never past the two-seat or two-Path limits.
 */
export function watchRequestOffer(i: WatchOfferInput): "offer" | "requested" | "none" {
  if (!i.referrerId || i.referrerId === i.selfId) return "none";
  if (i.referrerWatching) return "none";
  if (i.requestStatus === "pending") return "requested";
  if (i.requestStatus) return "none";
  if (!i.laneActive || i.laneTitle === STARTER_PATH_TITLE) return "none";
  if (i.seatsUsed >= 2 || i.pairPaths >= 2) return "none";
  return "offer";
}
