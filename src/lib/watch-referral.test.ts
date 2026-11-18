import { test } from "node:test";
import assert from "node:assert/strict";
import { decodeWatchReferral, encodeWatchReferral, watchRequestOffer, WATCH_REFERRAL_TTL_MS, type WatchOfferInput } from "./watch-referral";

const base: WatchOfferInput = {
  selfId: "marcus", referrerId: "justin", laneActive: true, laneTitle: "Daily Prayer",
  referrerWatching: false, requestStatus: null, seatsUsed: 0, pairPaths: 0,
};

test("someone who arrived through Justin's link is offered Invite Justin on a custom Path", () => {
  assert.equal(watchRequestOffer(base), "offer");
});
test("the offer never appears on the Send Scripture starter Path", () => {
  assert.equal(watchRequestOffer({ ...base, laneTitle: "Send Scripture" }), "none");
});
test("a sent request shows as waiting instead of offering again", () => {
  assert.equal(watchRequestOffer({ ...base, requestStatus: "pending" }), "requested");
});
test("a declined request is never offered again on the same Path", () => {
  assert.equal(watchRequestOffer({ ...base, requestStatus: "declined" }), "none");
});
test("no offer when the Path already has two Watchmen", () => {
  assert.equal(watchRequestOffer({ ...base, seatsUsed: 2 }), "none");
});
test("no offer when Justin already watches two of this person's Paths", () => {
  assert.equal(watchRequestOffer({ ...base, pairPaths: 2 }), "none");
});
test("you are never offered to invite yourself", () => {
  assert.equal(watchRequestOffer({ ...base, referrerId: "marcus" }), "none");
});
test("a remembered link older than 60 days is forgotten", () => {
  const raw = encodeWatchReferral("token-abcdefghij", 0);
  assert.equal(decodeWatchReferral(raw, WATCH_REFERRAL_TTL_MS + 1), null);
  assert.deepEqual(decodeWatchReferral(raw, 1000), { token: "token-abcdefghij" });
});
