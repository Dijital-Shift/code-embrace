export const ENCOURAGEMENT_UNDO_MS = 5000;

/** Do not send or alert the recipient until the recall window has closed. */
export function scheduleEncouragementSend(send: () => void, schedule = setTimeout, cancel = clearTimeout) {
  const timer = schedule(send, ENCOURAGEMENT_UNDO_MS);
  return () => cancel(timer);
}