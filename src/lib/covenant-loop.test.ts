import { test } from "node:test";
import assert from "node:assert/strict";
import { LOOP_BEATS, loopDurationMs, loopFrameMs, loopFrameRole, nextLoopPosition } from "./covenant-loop";

test("loop runs create → invite → check in → alarm → watch", () => {
  assert.deepEqual(LOOP_BEATS.map((b) => b.id), ["create", "invite", "checkin", "alarm", "watch"]);
});

test("after the Watchman answers, the loop begins again at creating a Path", () => {
  const last = { beat: LOOP_BEATS.length - 1, frame: LOOP_BEATS[LOOP_BEATS.length - 1].frames - 1 };
  assert.deepEqual(nextLoopPosition(last), { beat: 0, frame: 0 });
});

test("the whole loop plays in about 45 seconds", () => {
  assert.ok(loopDurationMs() >= 42_000 && loopDurationMs() <= 46_000);
});

test("the alarm and the answer are shown on the Watchman's phone", () => {
  assert.equal(loopFrameRole({ beat: 3, frame: 0 }), "watchman");
  assert.equal(loopFrameRole({ beat: 4, frame: 2 }), "watchman");
  assert.equal(loopFrameRole({ beat: 2, frame: 0 }), "walker");
});

test("quick taps snap while alarm and answer frames hold longer", () => {
  assert.equal(loopFrameMs({ beat: 0, frame: 0 }), 1800);
  assert.equal(loopFrameMs({ beat: 3, frame: 1 }), 3200);
  for (const b of LOOP_BEATS) assert.equal(b.dwell.length, b.frames);
});
