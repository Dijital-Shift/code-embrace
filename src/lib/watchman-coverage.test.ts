import { test } from "node:test";
import assert from "node:assert/strict";
import { watchmanCoverage } from "./watchman-coverage";

test("a Path with an open invitation and no Watchman is invited", () => {
  assert.equal(watchmanCoverage(0, 1), "invited");
});
test("a Path with no Watchman and no invitation is unwatched", () => {
  assert.equal(watchmanCoverage(0, 0), "unwatched");
});
test("an accepted Watchman outranks a pending invitation", () => {
  assert.equal(watchmanCoverage(1, 1), "watched");
});

import { seatPips } from "./watchman-coverage";
test("one Watchman plus two open links draws exactly two pips", () => {
  assert.deepEqual(seatPips(1, 2), ["manned", "pending"]);
});
test("no Watchman and four open links draws two pending pips, never more", () => {
  assert.deepEqual(seatPips(0, 4), ["pending", "pending"]);
});
test("a full Path draws two manned pips even with stale links", () => {
  assert.deepEqual(seatPips(2, 3), ["manned", "manned"]);
});
test("an empty Path draws two empty pips", () => {
  assert.deepEqual(seatPips(0, 0), ["empty", "empty"]);
});
