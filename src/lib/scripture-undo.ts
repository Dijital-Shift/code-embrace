export const SCRIPTURE_UNDO_MS = 5000;

/** Never overwrite a replacement verse or newer typing when undoing a clear. */
export function scriptureUndoValue(previous: string, current: string, clearedAt: number, now: number): string | null {
  if (now - clearedAt >= SCRIPTURE_UNDO_MS || current !== "") return null;
  return previous;
}