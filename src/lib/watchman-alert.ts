/** Identity on a lock-screen alert never falls back to account credentials. */
export function watchmanAlertName(profile?: { first_name?: string | null; last_name?: string | null } | null): string {
  const name = [profile?.first_name, profile?.last_name]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part && !part.includes('@'))
    .join(' ');
  return name || 'Someone you watch';
}

const LATE_BREACH_MARK = /\bdeclared a breach on\b[\s\S]*\bafter check-in\b/;

/** A breach confessed after a Held check-in is named as such — the gap is what the Watchman must ask about. */
export function breachAlertCopy(who: string, pathTitle: string, late: boolean): { title: string; body: string; line: string } {
  if (late) {
    const line = `${who} declared a breach on "${pathTitle}" after check-in.`;
    return { title: 'Breach declared after check-in', body: `${line} Open The Watch to read their explanation and reach out.`, line };
  }
  const line = `${who} reported a breach on "${pathTitle}".`;
  return { title: 'Breach reported', body: `${line} Open The Watch to read their explanation and reach out.`, line };
}

/** Stored alert text carries the late marker, so history keeps the distinction without a schema change. */
export function isLateBreachMessage(content: string | null | undefined): boolean {
  return !!content && LATE_BREACH_MARK.test(content);
}

/** Reveal new content below the fold without pulling the viewport upward. */
export function alertRevealDistance(top: number, bottom: number, viewportHeight: number, dockHeight = 0): number {
  const availableBottom = viewportHeight - dockHeight - 20;
  if (bottom <= availableBottom) return 0;
  return Math.max(0, Math.min(bottom - availableBottom, top - 100));
}

export function revealWatchmanAlert(element: HTMLElement | null): void {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const dock = document.querySelector<HTMLElement>('.nav-mobile-dock');
  const dockHeight = dock && getComputedStyle(dock).display !== 'none' ? dock.getBoundingClientRect().height : 0;
  const distance = alertRevealDistance(rect.top, rect.bottom, window.innerHeight, dockHeight);
  if (distance > 0) window.scrollBy({ top: distance, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

export function contactHaptic(): void {
  try { navigator.vibrate?.(25); } catch { /* Device/browser does not support vibration. */ }
}

/** The first notified day is Day 2; retain the earliest alert and include its private preceding day. */
export function silenceIncidentRange(count: number, earliestAlert: Date): { start: Date; days: number } {
  const start = new Date(earliestAlert);
  start.setDate(start.getDate() - 1);
  return { start, days: count + 1 };
}