import { describe, expect, test } from 'bun:test';
import { removalNotice, removalReasonSchema, REMOVAL_CONFIRM_MS } from './watchman-removal';

describe('Watchman removal rules', () => {
  test('rejects reasons shorter than 15 characters after trimming', () => {
    expect(removalReasonSchema.safeParse('  Bye  ').success).toBe(false);
    expect(removalReasonSchema.safeParse('12345678901234').success).toBe(false);
    expect(removalReasonSchema.parse('  123456789012345  ')).toBe('123456789012345');
  });
  test('limits the reason to 500 characters', () => {
    expect(removalReasonSchema.safeParse('a'.repeat(501)).success).toBe(false);
    expect(removalReasonSchema.safeParse('a'.repeat(500)).success).toBe(true);
  });
  test('preserves the exact reason, including additional reason markers', () => {
    expect(removalNotice('Justin removed you from Prayer on October 17, 2026. Reason: We agreed to pause. Reason: Work.')).toEqual({
      message: 'Justin removed you from Prayer on October 17, 2026.',
      reason: 'We agreed to pause. Reason: Work.',
    });
  });
  test('confirmation expires after five seconds', () => {
    expect(REMOVAL_CONFIRM_MS).toBe(5000);
  });
});