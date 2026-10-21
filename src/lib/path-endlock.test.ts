import { describe, it, expect } from 'vitest';
import { endDateEditable, courseComplete, validExtension } from './path-endlock';

describe('path end-date lock', () => {
  const created = '2026-10-21T12:00:00Z';
  it('end date editable within 30 minutes of creation', () => {
    expect(endDateEditable(created, new Date('2026-10-21T12:29:00Z'))).toBe(true);
  });
  it('end date locked after 30 minutes', () => {
    expect(endDateEditable(created, new Date('2026-10-21T12:30:00Z'))).toBe(false);
  });
  it('course is complete only after its end date passes', () => {
    expect(courseComplete('2026-10-20', '2026-10-21')).toBe(true);
    expect(courseComplete('2026-10-21', '2026-10-21')).toBe(false);
  });
  it('extension must be future or open-ended', () => {
    expect(validExtension('2026-10-21', '2026-10-21')).toBe(false);
    expect(validExtension('2026-11-20', '2026-10-21')).toBe(true);
    expect(validExtension(null, '2026-10-21')).toBe(true);
  });
});
