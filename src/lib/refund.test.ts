import { describe, it, expect } from "vitest";
import { isWithinRefundWindow } from "./refund";

const DAY = 86_400_000;
const now = Date.UTC(2026, 9, 17);

describe("self-serve refund window", () => {
  it("allows a refund 29 days after the charge", () => {
    expect(isWithinRefundWindow(now - 29 * DAY, now)).toBe(true);
  });
  it("allows a refund on day 30", () => {
    expect(isWithinRefundWindow(now - 30 * DAY, now)).toBe(true);
  });
  it("refuses a refund 31 days after the charge", () => {
    expect(isWithinRefundWindow(now - 31 * DAY, now)).toBe(false);
  });
});
