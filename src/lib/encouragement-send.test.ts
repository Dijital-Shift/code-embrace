import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isEncouragementPending, scheduleEncouragementSend } from './encouragement-send';

describe('encouragement recall', () => {
  it('protects the composer throughout the five-second recall window', () => {
    assert.equal(isEncouragementPending(true, false), true);
  });
  it('protects the composer while delivery is in flight', () => {
    assert.equal(isEncouragementPending(false, true), true);
  });
  it('allows leaving after Undo or a settled delivery attempt', () => {
    assert.equal(isEncouragementPending(false, false), false);
  });
  it('waits five seconds before sending', () => {
    let delay = 0;
    let sent = false;
    let run = () => {};
    scheduleEncouragementSend(() => { sent = true; }, ((callback: () => void, ms: number) => {
      run = callback; delay = ms; return 1;
    }) as unknown as typeof setTimeout);
    assert.equal(delay, 5000);
    assert.equal(sent, false);
    run();
    assert.equal(sent, true);
  });
  it('Undo cancels the pending send before recipient delivery', () => {
    let cancelled: unknown = null;
    const undo = scheduleEncouragementSend(() => assert.fail('must not send'), (() => 27) as unknown as typeof setTimeout,
      ((timer: unknown) => { cancelled = timer; }) as typeof clearTimeout);
    undo();
    assert.equal(cancelled, 27);
  });
});