import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { allowsAutomaticTimezone } from './timezone-sync';

describe('automatic timezone protection', () => {
  it('blocks local sandbox clocks', () => {
    assert.equal(allowsAutomaticTimezone('localhost'), false);
    assert.equal(allowsAutomaticTimezone('127.0.0.1'), false);
  });
  it('blocks editor preview clocks', () => {
    assert.equal(allowsAutomaticTimezone('id-preview--a731ae5b-dc40-4afc-bb77-1f42a61635d0.lovable.app'), false);
  });
  it('allows real devices on each published app host', () => {
    for (const host of ['kingdomprotocol.app', 'www.kingdomprotocol.app', 'kingdomprotocol.lovable.app']) {
      assert.equal(allowsAutomaticTimezone(host), true);
    }
  });
  it('blocks automated browsers even on the published host', () => {
    assert.equal(allowsAutomaticTimezone('kingdomprotocol.app', true), false);
  });
  it('rejects lookalike app hosts', () => {
    assert.equal(allowsAutomaticTimezone('kingdomprotocol.app.example.com'), false);
  });
});