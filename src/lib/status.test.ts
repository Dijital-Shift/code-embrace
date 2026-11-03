import { test } from "node:test";
import assert from "node:assert/strict";
import { orderBarStatuses, settledWatchState } from "./status";

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

test("two breaches out of five logged Paths settle accountability without declaring clear", () => {
  assert.equal(settledWatchState(["completed", "breached", "completed", "breached", "completed"]), "recorded");
});

test("logged silence is recorded rather than clear", () => {
  assert.equal(settledWatchState(["completed", "missed"]), "recorded");
});

test("held Paths and legitimate Sabbath settle clear", () => {
  assert.equal(settledWatchState(["completed", "skipped"]), "clear");
  assert.equal(settledWatchState([]), "clear");
});

test("a breach never settles a day with another Path still open", () => {
  assert.equal(settledWatchState(["breached", "pending"]), "open");
});
