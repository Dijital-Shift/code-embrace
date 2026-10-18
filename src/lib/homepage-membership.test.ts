import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { homepageMembership } from "./homepage-membership";

describe("homepage membership", () => {
  it("recognizes an existing lifetime purchase", () => {
    assert.equal(homepageMembership({ hasAccess: true, isLifetime: true, planLockedIn: true }), "lifetime");
  });
  it("recognizes an existing monthly plan", () => {
    assert.equal(homepageMembership({ hasAccess: true, isLifetime: false, planLockedIn: true }), "monthly");
  });
  it("does not treat a free trial as a purchased plan", () => {
    assert.equal(homepageMembership({ hasAccess: true, isLifetime: false, planLockedIn: false }), null);
  });
  it("does not present a resting account as an active membership", () => {
    assert.equal(homepageMembership({ hasAccess: false, isLifetime: false, planLockedIn: true }), null);
  });
});