import { describe, expect, it } from "bun:test";
import { homepageMembership } from "./homepage-membership";

describe("homepage membership", () => {
  it("recognizes an existing lifetime purchase", () => {
    expect(homepageMembership({ hasAccess: true, isLifetime: true, planLockedIn: true })).toBe("lifetime");
  });
  it("recognizes an existing monthly plan", () => {
    expect(homepageMembership({ hasAccess: true, isLifetime: false, planLockedIn: true })).toBe("monthly");
  });
  it("does not treat a free trial as a purchased plan", () => {
    expect(homepageMembership({ hasAccess: true, isLifetime: false, planLockedIn: false })).toBeNull();
  });
  it("does not present a resting account as an active membership", () => {
    expect(homepageMembership({ hasAccess: false, isLifetime: false, planLockedIn: true })).toBeNull();
  });
});