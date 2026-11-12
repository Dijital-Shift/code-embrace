import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { withLoggedCheckin } from './checkin-optimistic';

describe('instant check-in logging', () => {
  it('a Held tap logs today immediately with a fresh Undo window', () => {
    const now = new Date('2026-11-12T04:00:00Z');
    const out = withLoggedCheckin({ checkins: [], catchUp: [] }, 'p1', '2026-11-11', 'completed', 'today', now);
    assert.deepEqual(out.checkins, [{ lane_id: 'p1', checkin_date: '2026-11-11', status: 'completed', completion_time: now.toISOString() }]);
  });
  it('a yesterday answer leaves the Yesterday list', () => {
    const out = withLoggedCheckin({ checkins: [], catchUp: ['p1', 'p2'] }, 'p1', '2026-11-10', 'completed', 'yesterday');
    assert.deepEqual(out.catchUp, ['p2']);
  });
  it('replaces an existing row for the same Path and day instead of duplicating it', () => {
    const out = withLoggedCheckin({ checkins: [{ lane_id: 'p1', checkin_date: '2026-11-11', status: 'missed' }] }, 'p1', '2026-11-11', 'skipped', 'today');
    assert.equal(out.checkins.length, 1);
    assert.equal(out.checkins[0].status, 'skipped');
  });
});
