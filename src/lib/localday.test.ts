import { describe, it, expect } from "vitest";
import { tzOffsetHours, reminderUtcHour } from "./localday";

const oct = new Date("2026-10-17T12:00:00Z");

describe("evening reminder timing", () => {
  it("Phoenix is UTC-7", () => {
    expect(tzOffsetHours("America/Phoenix", oct)).toBe(-7);
  });
  it("10 PM Phoenix bedtime reminds at 9 PM local (04:00 UTC)", () => {
    expect(reminderUtcHour("22:00", "America/Phoenix", oct)).toBe(4);
  });
  it("10 PM New York bedtime (DST) reminds at 01:00 UTC", () => {
    expect(reminderUtcHour("22:00", "America/New_York", oct)).toBe(1);
  });
});
