import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pathIdentityEditable, pathIdentityChanged } from './path-identity';

describe('Path identity protection', () => {
  const created = '2026-10-26T07:00:00Z';
  it('allows corrections only in the first 30 minutes', () => {
    assert.equal(pathIdentityEditable(created, 0, 0, new Date('2026-10-26T07:29:59Z')), true);
    assert.equal(pathIdentityEditable(created, 0, 0, new Date('2026-10-26T07:30:00Z')), false);
  });
  it('locks identity when a check-in exists', () => {
    assert.equal(pathIdentityEditable(created, 1, 0, new Date('2026-10-26T07:01:00Z')), false);
  });
  it('locks identity when a Watchman is assigned', () => {
    assert.equal(pathIdentityEditable(created, 0, 1, new Date('2026-10-26T07:01:00Z')), false);
  });
  it('detects a changed title', () => {
    assert.equal(pathIdentityChanged({ title: 'Flee fornication' }, { title: 'Read daily' }), true);
  });
  it('detects a changed description, including removal', () => {
    assert.equal(pathIdentityChanged({ title: 'Pray', description: 'Every morning' }, { title: 'Pray', description: 'Sometimes' }), true);
    assert.equal(pathIdentityChanged({ title: 'Pray', description: 'Every morning' }, { title: 'Pray', description: null }), true);
  });
  it('permits unchanged identity for notes and Scripture saves', () => {
    assert.equal(pathIdentityChanged({ title: 'Pray', description: null }, { title: 'Pray', description: '' }), false);
  });
});