/** A breach note must say something real before the alarm can sound. */
export const MIN_BREACH_NOTE = 5;

export function breachNoteReady(note: string): boolean {
  return note.trim().length >= MIN_BREACH_NOTE;
}

/** Late confession is open for a Held Flee record: today always, yesterday until 10 AM local. */
export function canDeclareLateBreach(laneType: string, status: string, day: "today" | "yesterday", graceOpen: boolean): boolean {
  if (laneType !== "avoid" || status !== "completed") return false;
  return day === "today" || graceOpen;
}
