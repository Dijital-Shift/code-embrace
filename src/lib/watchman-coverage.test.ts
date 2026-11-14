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
