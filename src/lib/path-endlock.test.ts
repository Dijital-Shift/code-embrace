import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { endDateEditable, courseComplete, validExtension } from "./path-endlock";

describe("path end-date lock", () => {
  const created = "2026-10-21T12:00:00Z";
  it("end date editable within 30 minutes of creation", () => {
    assert.equal(endDateEditable(created, new Date("2026-10-21T12:29:00Z")), true);
  });
  it("end date locked after 30 minutes", () => {
    assert.equal(endDateEditable(created, new Date("2026-10-21T12:30:00Z")), false);
  });
  it("course is complete only after its end date passes", () => {
    assert.equal(courseComplete("2026-10-20", "2026-10-21"), true);
    assert.equal(courseComplete("2026-10-21", "2026-10-21"), false);
  });
  it("extension must be future or open-ended", () => {
    assert.equal(validExtension("2026-10-21", "2026-10-21"), false);
    assert.equal(validExtension("2026-11-20", "2026-10-21"), true);
    assert.equal(validExtension(null, "2026-10-21"), true);
  });
});
