import { test } from 'node:test';
import assert from 'node:assert/strict';
import { courseComplete, courseTally } from './path-endlock';
import { inviteLinkState } from './invite-link';

test('a course is finished only after its final day', () => {
  assert.equal(courseComplete('2026-11-18', '2026-11-18'), false);
  assert.equal(courseComplete('2026-11-18', '2026-11-19'), true);
});
test('final ledger counts held, breached, silent and Sabbath', () => {
  assert.deepEqual(courseTally(['completed', 'completed', 'breached', 'missed', 'skipped']), { held: 2, breached: 1, silent: 1, sabbath: 1 });
});
test('invite to an archived Path reads as concluded, not an error', () => {
  assert.equal(inviteLinkState({ found: true, concluded: true, status: 'pending' }), 'concluded');
});
