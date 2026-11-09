// Twice-weekly nudge for owners walking Paths with no Watchman.
// Fires only Thursday 12 PM and Sunday 6 PM in the owner's local time.

/** 0 = Sunday … 4 = Thursday, from a local YYYY-MM-DD date. */
function weekday(localDate: string): number {
  const [y, m, d] = localDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isUnwatchedReminderSlot(localDate: string, localHour: number): boolean {
  const day = weekday(localDate);
  return (day === 4 && localHour === 12) || (day === 0 && localHour === 18);
}

/** One push per person, whatever the count. */
export function unwatchedReminderPush(pathIds: string[]): { title: string; body: string; url: string } | null {
  if (!pathIds.length) return null;
  const one = pathIds.length === 1;
  return {
    title: 'Kingdom Protocol',
    body: one
      ? 'An unmanned wall invites breach. You have an active Path without a Watchman.'
      : `An unmanned wall invites breach. You have ${pathIds.length} active Paths without a Watchman.`,
    url: one ? `/paths/${pathIds[0]}` : '/paths',
  };
}
