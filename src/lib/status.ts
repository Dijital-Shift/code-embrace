// Single source of truth for how a day's check-in status is shown to the user.
// DB values stay as-is (completed | breached | missed | skipped); this is display only.

export type CheckinStatus = "completed" | "breached" | "missed" | "skipped" | "pending";

export const STATUS_LABEL: Record<CheckinStatus, string> = {
  completed: "Held",
  breached: "Breach",
  missed: "Silent",
  skipped: "Sabbath",
  pending: "Open",
};

export const STATUS_COLOR: Record<CheckinStatus, string> = {
  completed: "#4ade80",
  breached: "#f87171",
  missed: "#f59e0b",
  skipped: "#c9a84c",
  pending: "#666",
};

export function statusLabel(status: string): string {
  return STATUS_LABEL[status as CheckinStatus] ?? "Open";
}

export function statusColor(status: string): string {
  return STATUS_COLOR[status as CheckinStatus] ?? "#444";
}

/** Tonight's bar fills left-to-right: every settled slot leads, open slots trail. */
export function orderBarStatuses(statuses: string[]): string[] {
  const settled: string[] = [];
  const open: string[] = [];
  for (const s of statuses) (s === "pending" ? open : settled).push(s);
  return [...settled, ...open];
}

/** Classify only today's due Paths; upcoming Paths are not accountability owed. */
export function settledWatchState(statuses: string[]): "open" | "clear" | "recorded" {
  if (statuses.some((s) => s === "pending")) return "open";
  return statuses.some((s) => s === "breached" || s === "missed") ? "recorded" : "clear";
}

/** Plain tally for a settled day: "4 held · 2 breached · 1 silent". Sabbath counts as held. */
export function settledTally(statuses: string[]): string {
  const held = statuses.filter((s) => s === "completed" || s === "skipped").length;
  const breached = statuses.filter((s) => s === "breached").length;
  const silent = statuses.filter((s) => s === "missed").length;
  const parts = [`${held} held`];
  if (breached) parts.push(`${breached} breached`);
  if (silent) parts.push(`${silent} silent`);
  return parts.join(" · ");
}
