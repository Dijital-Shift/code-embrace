import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTrail, trailDates, trailDayName } from "./recent-trail";

const today = "2026-11-15";
const rows: Record<string, string> = {};
const base = { today, isDue: () => true, statusOn: (d: string) => rows[d] };

test("covers two days ago, yesterday, and today, oldest first", () => {
  assert.deepEqual(trailDates(today), ["2026-11-13", "2026-11-14", "2026-11-15"]);
});

test("shows recorded statuses including a confessed breach", () => {
  const t = buildTrail({ ...base, graceOpen: false, statusOn: (d) => ({ "2026-11-13": "missed", "2026-11-14": "breached", "2026-11-15": "completed" } as Record<string, string>)[d] });
  assert.deepEqual(t.map((d) => d.mark), ["missed", "breached", "completed"]);
});

test("keeps an unlogged yesterday open before the 10 AM close", () => {
  assert.equal(buildTrail({ ...base, graceOpen: true })[1].mark, "grace");
});

test("treats an unlogged yesterday as silent after the 10 AM close", () => {
  assert.equal(buildTrail({ ...base, graceOpen: false })[1].mark, "missed");
});

test("leaves today open when nothing is logged", () => {
  assert.equal(buildTrail({ ...base, graceOpen: false })[2].mark, "open");
});

test("owes nothing on days before the Path started", () => {
  const t = buildTrail({ ...base, graceOpen: false, isDue: (d) => d >= "2026-11-14" });
  assert.deepEqual(t.map((d) => d.mark), ["none", "missed", "open"]);
});

test("names past days by weekday and today as Today", () => {
  assert.equal(trailDayName("2026-11-13", today), "Fri");
  assert.equal(trailDayName(today, today), "Today");
});
