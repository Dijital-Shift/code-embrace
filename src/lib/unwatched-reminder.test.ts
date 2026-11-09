import { describe, it, expect } from 'vitest';
import { isUnwatchedReminderSlot, unwatchedReminderPush } from './unwatched-reminder';

describe('unwatched Path reminder', () => {
  it('fires Thursday at noon local', () => {
    expect(isUnwatchedReminderSlot('2026-11-12', 12)).toBe(true);
  });
  it('fires Sunday at 6 PM local', () => {
    expect(isUnwatchedReminderSlot('2026-11-15', 18)).toBe(true);
  });
  it('never fires on Monday', () => {
    expect(isUnwatchedReminderSlot('2026-11-09', 12)).toBe(false);
    expect(isUnwatchedReminderSlot('2026-11-09', 18)).toBe(false);
  });
  it('never fires at other hours on Thursday', () => {
    expect(isUnwatchedReminderSlot('2026-11-12', 13)).toBe(false);
  });
  it('sends one push to the Path list for three unwatched Paths', () => {
    const p = unwatchedReminderPush(['a', 'b', 'c'])!;
    expect(p.url).toBe('/paths');
    expect(p.body).toContain('3 active Paths');
  });
  it('links straight to the single unwatched Path', () => {
    expect(unwatchedReminderPush(['a'])!.url).toBe('/paths/a');
  });
  it('sends nothing when every Path is watched', () => {
    expect(unwatchedReminderPush([])).toBeNull();
  });
});
