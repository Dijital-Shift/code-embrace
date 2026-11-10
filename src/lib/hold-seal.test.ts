import { test } from "node:test";
import assert from "node:assert/strict";
import { HOLD_MS, canDeclareLateBreach } from "./hold-seal.ts";

test("seal requires a 2.5 second hold", () => assert.equal(HOLD_MS, 2500));
test("held Flee today can be confessed", () => assert.equal(canDeclareLateBreach("avoid", "completed", "today", false), true));
test("yesterday open before 10 AM", () => assert.equal(canDeclareLateBreach("avoid", "completed", "yesterday", true), true));
test("yesterday closed after 10 AM", () => assert.equal(canDeclareLateBreach("avoid", "completed", "yesterday", false), false));
test("Pursue Paths are excluded", () => assert.equal(canDeclareLateBreach("complete", "completed", "today", true), false));
test("already breached cannot be re-declared", () => assert.equal(canDeclareLateBreach("avoid", "breached", "today", true), false));
