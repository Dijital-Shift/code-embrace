/** Identity on a lock-screen alert never falls back to account credentials. */
export function watchmanAlertName(profile?: { first_name?: string | null; last_name?: string | null } | null): string {
  const name = [profile?.first_name, profile?.last_name]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part && !part.includes('@'))
    .join(' ');
  return name || 'Someone you watch';
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