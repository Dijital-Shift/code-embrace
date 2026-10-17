import { describe, it as test } from 'node:test';
import assert from 'node:assert/strict';
import { removalNotice, removalReasonSchema, REMOVAL_CONFIRM_MS } from './watchman-removal';

describe('Watchman removal rules', () => {
  test('rejects reasons shorter than 15 characters after trimming', () => {
    assert.equal(removalReasonSchema.safeParse('  Bye  ').success, false);
    assert.equal(removalReasonSchema.safeParse('12345678901234').success, false);
    assert.equal(removalReasonSchema.parse('  123456789012345  '), '123456789012345');
  });
  test('limits the reason to 500 characters', () => {
    assert.equal(removalReasonSchema.safeParse('a'.repeat(501)).success, false);
    assert.equal(removalReasonSchema.safeParse('a'.repeat(500)).success, true);
  });
  test('preserves the exact reason, including additional reason markers', () => {
    assert.deepEqual(removalNotice('Justin removed you from Prayer on October 17, 2026. Reason: We agreed to pause. Reason: Work.'), {
      message: 'Justin removed you from Prayer on October 17, 2026.',
      reason: 'We agreed to pause. Reason: Work.',
    });
  });
  test('confirmation expires after five seconds', () => {
    assert.equal(REMOVAL_CONFIRM_MS, 5000);
  });
});