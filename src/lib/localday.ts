// Single source of truth for "what day is it for this user".
// Pure + browser-safe. Both api.functions.ts (via day.server.ts) and
// escalation.server.ts must use these — never Date#toISOString() slicing,
// which silently computes the UTC day and disagrees with the user's clock.

export const DEFAULT_TZ = 'America/Chicago';

/** Local date (YYYY-MM-DD) and hour (0-23) for a UTC instant in an IANA tz. */
export function localParts(nowUtc: Date, tz: string): { date: string; hour: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', hour12: false,
    }).formatToParts(nowUtc);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    const hourStr = get('hour');
    const hour = hourStr === '24' ? 0 : parseInt(hourStr, 10);
    return { date: `${get('year')}-${get('month')}-${get('day')}`, hour };
  } catch {
    return { date: nowUtc.toISOString().split('T')[0], hour: nowUtc.getUTCHours() };
  }
}

/** The user's local calendar date, YYYY-MM-DD. */
export function localDate(tz: string, nowUtc: Date = new Date()): string {
  return localParts(nowUtc, tz || DEFAULT_TZ).date;
}

/** The user's local hour (0-23). */
export function localHour(tz: string, nowUtc: Date = new Date()): number {
  return localParts(nowUtc, tz || DEFAULT_TZ).hour;
}

export function prevDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

export function nextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
}

/** Current UTC offset in whole hours for an IANA tz (DST-aware). */
export function tzOffsetHours(tz: string, nowUtc: Date = new Date()): number {
  try {
    const utcH = parseInt(nowUtc.toLocaleString('en-US', { timeZone: 'UTC', hour12: false, hour: 'numeric' }), 10);
    const tzH = parseInt(nowUtc.toLocaleString('en-US', { timeZone: tz, hour12: false, hour: 'numeric' }), 10);
    return ((tzH - utcH + 36) % 24) - ((tzH - utcH + 36) % 24 > 12 ? 24 : 0);
  } catch {
    return 0;
  }
}

/** UTC hour at which the pre-bedtime reminder should fire. Reminder = 1h before bedtime, local. */
export function reminderUtcHour(bedtime: string, tz: string, nowUtc: Date = new Date()): number {
  const [hh] = bedtime.split(':').map(Number);
  const localReminder = (Number.isFinite(hh) ? hh : 22) === 0 ? 23 : (Number.isFinite(hh) ? hh : 22) - 1;
  const off = tzOffsetHours(tz || DEFAULT_TZ, nowUtc);
  return ((localReminder - off) % 24 + 24) % 24;
}

/** Timezone options for the Settings picker — labels must make DST/offset visible. */
export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: 'America/New_York', label: 'Eastern — UTC−5/−4 (DST)' },
  { value: 'America/Chicago', label: 'Central — UTC−6/−5 (DST)' },
  { value: 'America/Denver', label: 'Mountain — UTC−7/−6 (DST)' },
  { value: 'America/Phoenix', label: 'Arizona — UTC−7 (no DST)' },
  { value: 'America/Los_Angeles', label: 'Pacific — UTC−8/−7 (DST)' },
  { value: 'America/Anchorage', label: 'Alaska — UTC−9/−8 (DST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii — UTC−10 (no DST)' },
];
