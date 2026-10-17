import { describe, it as test } from "node:test";
import assert from "node:assert/strict";
import { tzOffsetHours, reminderUtcHour } from "./localday";

const oct = new Date("2026-10-17T12:00:00Z");

describe("evening reminder timing", () => {
  test("Phoenix is UTC-7", () => {
    assert.equal(tzOffsetHours("America/Phoenix", oct), -7);
  });
  test("10 PM Phoenix bedtime reminds at 9 PM local (04:00 UTC)", () => {
    assert.equal(reminderUtcHour("22:00", "America/Phoenix", oct), 4);
  });
  test("10 PM New York bedtime (DST) reminds at 01:00 UTC", () => {
    assert.equal(reminderUtcHour("22:00", "America/New_York", oct), 1);
  });
});
