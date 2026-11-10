/** Breach confessions seal only after a deliberate 2.5-second hold. */
export const HOLD_MS = 2500;

/** Late confession is open for a Held Flee record: today always, yesterday until 10 AM local. */
export function canDeclareLateBreach(laneType: string, status: string, day: "today" | "yesterday", graceOpen: boolean): boolean {
  if (laneType !== "avoid" || status !== "completed") return false;
  return day === "today" || graceOpen;
}
