import { test } from "node:test";
import assert from "node:assert/strict";
import { briefingDismissalKey } from "./role-briefing";

test("walker dismissal never dismisses the Watchman briefing", () => {
  assert.notEqual(briefingDismissalKey("member-1", "walker"), briefingDismissalKey("member-1", "watchman"));
});

test("briefing dismissal is specific to the signed-in member", () => {
  assert.notEqual(briefingDismissalKey("member-1", "walker"), briefingDismissalKey("member-2", "walker"));
});