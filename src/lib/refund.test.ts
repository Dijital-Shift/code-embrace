import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isWithinRefundWindow } from "./refund";

const DAY = 86_400_000;
const now = Date.UTC(2026, 9, 17);

describe("self-serve refund window", () => {
  it("allows a refund 29 days after the charge", () => {
    assert.equal(isWithinRefundWindow(now - 29 * DAY, now), true);
  });
  it("allows a refund on day 30", () => {
    assert.equal(isWithinRefundWindow(now - 30 * DAY, now), true);
  });
  it("refuses a refund 31 days after the charge", () => {
    assert.equal(isWithinRefundWindow(now - 31 * DAY, now), false);
  });
});
