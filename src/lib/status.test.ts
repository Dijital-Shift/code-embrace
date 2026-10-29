import { test } from "node:test";
import assert from "node:assert/strict";
import { orderBarStatuses } from "./status";

test("settled slots lead the bar and open slots trail", () => {
  assert.deepEqual(
    orderBarStatuses(["pending", "completed", "pending", "breached"]),
    ["completed", "breached", "pending", "pending"],
  );
});

test("settled slots keep the order they were checked in", () => {
  assert.deepEqual(orderBarStatuses(["skipped", "missed", "completed"]), ["skipped", "missed", "completed"]);
});

test("an all-open night is untouched and the segment count never changes", () => {
  assert.deepEqual(orderBarStatuses(["pending", "pending"]), ["pending", "pending"]);
  assert.equal(orderBarStatuses(["pending", "completed", "pending"]).length, 3);
  assert.deepEqual(orderBarStatuses([]), []);
});
