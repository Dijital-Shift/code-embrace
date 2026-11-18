/** Client-safe rules for Watchman invitation links. A Path holds at most two Watchmen. */
export const WATCHMEN_PER_PATH = 2;

export type InviteLinkPreview = {
  found: boolean;
  pathGone?: boolean;
  full?: boolean;
  status?: string;
  expired?: boolean;
};

/** What a person opening a link should see. A full Path outranks every other closed state. */
export function inviteLinkState(p: InviteLinkPreview | null | undefined): "missing" | "pathGone" | "full" | "closed" | "open" {
  if (!p || !p.found) return "missing";
  if (p.pathGone) return "pathGone";
  if (p.full || p.status === "accepted") return "full";
  if (p.expired || p.status === "revoked" || p.status === "expired" || p.status === "declined") return "closed";
  return "open";
}

/**
 * After someone accepts through a link: one link may be shared with several people,
 * first come first served. It stays open only while it alone covers the remaining seat.
 */
export function linkAfterAccept(activeWatchmen: number, otherOpenLinks: number): "keep-open" | "close" | "close-all" {
  const seatsLeft = WATCHMEN_PER_PATH - activeWatchmen;
  if (seatsLeft <= 0) return "close-all";
  if (otherOpenLinks + 1 > seatsLeft) return "close";
  return "keep-open";
}
