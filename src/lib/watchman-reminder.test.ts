import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { needsWatchman, hasPendingWatchman } from './watchman-reminder';

describe('Watchman reminder eligibility', () => {
  const path = { id: 'path', title: 'Read', status: 'active', watchmen: 0 };
  it('reminds an owner to add at least one Watchman', () => {
    assert.equal(needsWatchman(path), true);
    assert.equal(needsWatchman({ ...path, watchmen: 1 }), false);
  });
  it('does not call for Watchmen on paused, archived or completed Paths', () => {
    assert.equal(needsWatchman({ ...path, status: 'paused' }), false);
    assert.equal(needsWatchman({ ...path, status: 'archived' }), false);
    assert.equal(needsWatchman({ ...path, endsAt: '2026-10-26', today: '2026-10-27' }), false);
    assert.equal(needsWatchman({ ...path, endsAt: '2026-10-27', today: '2026-10-27' }), true);
  });
  it('distinguishes a live invitation from expired or canceled links', () => {
    const now = Date.parse('2026-10-27T22:58:00Z');
    assert.equal(hasPendingWatchman([{ status: 'pending', expires_at: '2026-10-28T22:58:00Z' }], now), true);
    assert.equal(hasPendingWatchman([{ status: 'pending', expires_at: '2026-10-27T22:58:00Z' }], now), false);
    assert.equal(hasPendingWatchman([{ status: 'revoked', expires_at: '2026-10-28T22:58:00Z' }], now), false);
  });
});