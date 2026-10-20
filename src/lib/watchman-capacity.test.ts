import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canWatchAnotherPath, type WatchmanAssignment } from './watchman-capacity';

const assignment = (owner: string, status = 'active', pathStatus = 'active'): WatchmanAssignment =>
  ({ status, lanes: { user_id: owner, status: pathStatus } });

describe('Watchman capacity per person', () => {
  it('blocks a third active Path for one person', () => {
    assert.equal(canWatchAnotherPath([assignment('justin'), assignment('justin')], 'justin'), false);
  });
  it('allows a second active Path for one person', () => {
    assert.equal(canWatchAnotherPath([assignment('justin')], 'justin'), true);
  });
  it('two Paths for Justin do not block watching her mother', () => {
    assert.equal(canWatchAnotherPath([assignment('justin'), assignment('justin')], 'mother'), true);
  });
  it('has no total cap across different people', () => {
    const assignments = Array.from({ length: 40 }, (_, i) => assignment(`owner-${i}`));
    assert.equal(canWatchAnotherPath(assignments, 'another-owner'), true);
  });
  it('archived Paths and removed assignments do not consume capacity', () => {
    assert.equal(canWatchAnotherPath([
      assignment('justin'), assignment('justin', 'removed'), assignment('justin', 'active', 'archived'),
    ], 'justin'), true);
  });
});