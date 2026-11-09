import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isUnwatchedReminderSlot, unwatchedReminderPush } from './unwatched-reminder';

test('fires Thursday at noon local', () => {
  assert.equal(isUnwatchedReminderSlot('2026-11-12', 12), true);
});
test('fires Sunday at 6 PM local', () => {
  assert.equal(isUnwatchedReminderSlot('2026-11-15', 18), true);
});
test('never fires on Monday', () => {
  assert.equal(isUnwatchedReminderSlot('2026-11-09', 12), false);
  assert.equal(isUnwatchedReminderSlot('2026-11-09', 18), false);
});
test('never fires at other hours on Thursday', () => {
  assert.equal(isUnwatchedReminderSlot('2026-11-12', 13), false);
});
test('sends one push to the Path list for three unwatched Paths', () => {
  const p = unwatchedReminderPush(['a', 'b', 'c'])!;
  assert.equal(p.url, '/paths');
  assert.ok(p.body.includes('3 active Paths'));
});
test('links straight to the single unwatched Path', () => {
  assert.equal(unwatchedReminderPush(['a'])!.url, '/paths/a');
});
test('sends nothing when every Path is watched', () => {
  assert.equal(unwatchedReminderPush([]), null);
});
