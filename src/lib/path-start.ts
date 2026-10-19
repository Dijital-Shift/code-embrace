import { DEFAULT_TZ, localDate, nextDay } from './localday';

/** Date-only accountability, shared by forms, reads, writes and reminder jobs. */
export function defaultPathStart(tz: string, bedtime: string, now = new Date()): 'today' | 'tomorrow' {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz || DEFAULT_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const [hh, mm] = bedtime.split(':').map(Number);
  const bed = Number.isFinite(hh) && Number.isFinite(mm) ? hh * 60 + mm : 22 * 60;
  return hour * 60 + minute >= Math.max(0, bed - 60) ? 'tomorrow' : 'today';
}

export function resolvePathStart(choice: 'today' | 'tomorrow', today: string): string {
  return choice === 'tomorrow' ? nextDay(today) : today;
}

export function pathStartDate(path: { starts_at?: string | null; created_at: string }, tz: string): string {
  return path.starts_at ?? localDate(tz, new Date(path.created_at));
}

export function pathIsDue(path: { starts_at?: string | null; created_at: string }, date: string, tz: string): boolean {
  return date >= pathStartDate(path, tz);
}

export function pathStartLabel(start: string, today: string): string {
  if (start === nextDay(today)) return 'Starts tomorrow';
  return `Starts ${new Date(start + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}`;
}