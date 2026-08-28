// Turns the check-in an encouragement was sent in response to into one short line.
// e.g. "In response to Tuesday's breach" / "In response to Tuesday's silent day".

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function alertLabel(status: string): string | null {
  if (status === 'breached') return 'breach';
  if (status === 'missed') return 'silent day';
  return null;
}

/** date is a plain YYYY-MM-DD string — parsed without timezone drift. */
export function alertContextLabel(checkinDate: string, status: string): string | null {
  const label = alertLabel(status);
  if (!label) return null;
  const [y, m, d] = checkinDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  const now = new Date();
  const ageDays = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - dt.getTime()) / 86400000);
  const when = ageDays >= 0 && ageDays < 7
    ? `${WEEKDAYS[dt.getUTCDay()]}'s`
    : `the ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`;
  return `In response to ${when} ${label}`;
}
