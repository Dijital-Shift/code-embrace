import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { defaultPathStart, pathIsDue, pathStartDate, resolvePathStart } from './path-start';

describe('Path accountability start', () => {
  it('10 PM Phoenix bedtime defaults to tomorrow at the 9 PM reminder boundary', () => {
    assert.equal(defaultPathStart('America/Phoenix', '22:00', new Date('2026-10-19T03:59:00Z')), 'today');
    assert.equal(defaultPathStart('America/Phoenix', '22:00', new Date('2026-10-19T04:00:00Z')), 'tomorrow');
  });
  it('a Path created at 10:58 PM Phoenix starts on October 19, not the UTC next day', () => {
    assert.equal(defaultPathStart('America/Phoenix', '22:00:00', new Date('2026-10-19T05:58:58Z')), 'tomorrow');
    assert.equal(resolvePathStart('tomorrow', '2026-10-18'), '2026-10-19');
  });
  it('an explicit today choice is honored', () => {
    assert.equal(resolvePathStart('today', '2026-10-18'), '2026-10-18');
  });
  it('no pending check-in, reminder, or missed record is owed before the start date', () => {
    const path = { starts_at: '2026-10-19', created_at: '2026-10-19T05:58:58Z' };
    assert.equal(pathIsDue(path, '2026-10-18', 'America/Phoenix'), false);
    assert.equal(pathIsDue(path, '2026-10-19', 'America/Phoenix'), true);
  });
  it('saved bedtime minutes are respected', () => {
    assert.equal(defaultPathStart('America/Phoenix', '22:30', new Date('2026-10-19T04:29:00Z')), 'today');
    assert.equal(defaultPathStart('America/Phoenix', '22:30', new Date('2026-10-19T04:30:00Z')), 'tomorrow');
  });
  it('month rollover works and legacy history begins on its local creation day', () => {
    assert.equal(resolvePathStart('tomorrow', '2026-10-31'), '2026-11-01');
    assert.equal(pathStartDate({ created_at: '2026-10-19T05:58:58Z' }, 'America/Phoenix'), '2026-10-18');
  });
});