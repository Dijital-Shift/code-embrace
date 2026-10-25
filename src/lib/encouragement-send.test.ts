import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scheduleEncouragementSend } from './encouragement-send';

describe('encouragement recall', () => {
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