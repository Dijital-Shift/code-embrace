// Client-safe: the last three accountability days for one Path, oldest first.
// Absent rows are interpreted the same way the Check-In page does: yesterday
// stays open until the 10 AM grace close, older absent days are silence, and
// days before the Path started owe nothing.
import { prevDay } from "./localday";

export type TrailMark = "completed" | "breached" | "missed" | "skipped" | "open" | "grace" | "none";
export type TrailDay = { date: string; mark: TrailMark };

const RECORDED = new Set(["completed", "breached", "missed", "skipped"]);

export function trailDates(today: string): string[] {
  const yest = prevDay(today);
  return [prevDay(yest), yest, today];
}

export function buildTrail(opts: {
  today: string;
  graceOpen: boolean;
  isDue: (date: string) => boolean;
  statusOn: (date: string) => string | undefined;
}): TrailDay[] {
  const yest = prevDay(opts.today);
  return trailDates(opts.today).map((date) => {
    if (!opts.isDue(date)) return { date, mark: "none" };
    const row = opts.statusOn(date);
    if (row && RECORDED.has(row)) return { date, mark: row as TrailMark };
    if (date === opts.today) return { date, mark: "open" };
    if (date === yest && opts.graceOpen) return { date, mark: "grace" };
    return { date, mark: "missed" };
  });
}

export const TRAIL_LABEL: Record<TrailMark, string> = {
  completed: "Held",
  breached: "Breached",
  missed: "Silent",
  skipped: "Sabbath",
  open: "Open",
  grace: "Open until 10 AM",
  none: "Not started",
};

/** "Fri" for past days, "Today" for today. Dates are YYYY-MM-DD local days. */
export function trailDayName(date: string, today: string): string {
  if (date === today) return "Today";
  return new Date(date + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}
