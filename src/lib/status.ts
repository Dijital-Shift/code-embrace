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
