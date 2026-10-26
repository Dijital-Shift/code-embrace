import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scriptureUndoValue, SCRIPTURE_UNDO_MS } from "./scripture-undo";

describe("Scripture clear Undo", () => {
  it("restores the exact verse within the five-second window", () => {
    assert.equal(SCRIPTURE_UNDO_MS, 5000);
    assert.equal(scriptureUndoValue("Psalm 23:1\nThe LORD is my shepherd.", "", 1000, 5999), "Psalm 23:1\nThe LORD is my shepherd.");
    assert.equal(scriptureUndoValue("Psalm 23:1", "", 1000, 6000), null);
  });
  it("does not overwrite new typing or a fetched replacement", () => {
    assert.equal(scriptureUndoValue("Psalm 23:1", "John 3:16", 1000, 2000), null);
  });
});