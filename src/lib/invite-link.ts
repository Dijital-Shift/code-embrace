/** Client-safe rules for Watchman invitation links. A Path holds at most two Watchmen. */
export const WATCHMEN_PER_PATH = 2;
/** Longest private "Sent to" note an owner can put on a link. */
export const SENT_TO_MAX = 40;

export type InviteLinkPreview = {
  found: boolean;
  pathGone?: boolean;
  full?: boolean;
  status?: string;
  expired?: boolean;
};

/**
 * What a person opening a link should see. Only a Path with both seats manned reads as full.
 * Shared links stay pending until the wall fills, so a used link that is no longer pending
 * (closed by an earlier full wall) reads as expired, never as full.
 */
export function inviteLinkState(p: InviteLinkPreview | null | undefined): "missing" | "pathGone" | "full" | "closed" | "open" {
  if (!p || !p.found) return "missing";
  if (p.pathGone) return "pathGone";
  if (p.full) return "full";
  if (p.expired || p.status === "accepted" || p.status === "revoked" || p.status === "expired" || p.status === "declined") return "closed";
  return "open";
}

/**
 * After someone accepts through a shared link: it stays open until both seats are manned,
 * then every open link on the Path closes.
 */
export function linkAfterAccept(activeWatchmen: number): "keep-open" | "close-all" {
  return activeWatchmen >= WATCHMEN_PER_PATH ? "close-all" : "keep-open";
}

/** Trim the owner's private "Sent to" note; blank means no note. */
export function cleanSentTo(raw: string | null | undefined): string | null {
  const v = (raw ?? "").replace(/\s+/g, " ").trim().slice(0, SENT_TO_MAX);
  return v || null;
}
