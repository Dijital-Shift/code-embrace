import { test } from 'node:test';
import assert from 'node:assert/strict';
import { alertRevealDistance, silenceIncidentRange, watchmanAlertName } from './watchman-alert';

test('alert identity uses the saved personal name, not credentials', () => {
  assert.equal(watchmanAlertName({ first_name: ' Justin ', last_name: ' J ' }), 'Justin J');
  assert.equal(watchmanAlertName({ first_name: 'person@example.com', last_name: null }), 'Someone you watch');
  assert.equal(watchmanAlertName(null), 'Someone you watch');
});

test('history reveal scrolls down enough to clear the mobile dock', () => {
  assert.equal(alertRevealDistance(650, 950, 800, 60), 230);
});

test('already visible alerts never scroll upward or move unnecessarily', () => {
  assert.equal(alertRevealDistance(200, 600, 800, 60), 0);
  assert.equal(alertRevealDistance(-20, 1200, 800, 60), 0);
});

test('long history keeps the first newly revealed alert in view', () => {
  assert.equal(alertRevealDistance(650, 1600, 800, 60), 550);
});

test('a lone silence alert covers two silent days, backdated one day', () => {
  const end = new Date('2026-10-24T17:00:00.000Z');
  const range = silenceIncidentRange(1, end);
  assert.equal(range.days, 2);
  assert.equal(range.start.getTime(), end.getTime() - 24 * 3600_000);
});

test('four consecutive alerts Oct 27–30 represent five silent days Oct 26–30', () => {
  const earliestAlert = new Date('2026-10-27T17:00:00.000Z');
  const range = silenceIncidentRange(4, earliestAlert);
  assert.equal(range.days, 5);
  assert.equal(range.start.toISOString(), '2026-10-26T17:00:00.000Z');
  assert.equal(earliestAlert.toISOString(), '2026-10-27T17:00:00.000Z');
});

test('two consecutive alerts Oct 23–24 include the private silent day Oct 22', () => {
  const range = silenceIncidentRange(2, new Date('2026-10-23T17:00:00.000Z'));
  assert.equal(range.days, 3);
  assert.equal(range.start.toISOString(), '2026-10-22T17:00:00.000Z');
});

test('silence range crosses month and year boundaries', () => {
  const range = silenceIncidentRange(1, new Date('2027-01-01T17:00:00.000Z'));
  assert.equal(range.days, 2);
  assert.equal(range.start.toISOString(), '2026-12-31T17:00:00.000Z');
});