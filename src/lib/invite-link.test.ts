import { test } from "node:test";
import assert from "node:assert/strict";
import { inviteLinkState, linkAfterAccept, cleanSentTo } from "./invite-link";

test("a link to a Path with two Watchmen shows the full-wall screen", () => {
  assert.equal(inviteLinkState({ found: true, status: "pending", full: true }), "full");
});
test("a used link is only full when both seats are manned", () => {
  assert.equal(inviteLinkState({ found: true, status: "accepted", full: false }), "closed");
  assert.equal(inviteLinkState({ found: true, status: "accepted", full: true }), "full");
});
test("an old 48-hour link that ran out still reads as closed", () => {
  assert.equal(inviteLinkState({ found: true, status: "pending", expired: true }), "closed");
});
test("a cancelled link reads as closed, never as cancelled", () => {
  assert.equal(inviteLinkState({ found: true, status: "revoked" }), "closed");
});
test("a pending link with a seat left stays open", () => {
  assert.equal(inviteLinkState({ found: true, status: "pending", full: false, expired: false }), "open");
});
test("a shared link stays open for the second seat after the first acceptance", () => {
  assert.equal(linkAfterAccept(1), "keep-open");
});
test("filling the second seat closes every open link on the Path", () => {
  assert.equal(linkAfterAccept(2), "close-all");
});
test("a declined watch request reads as closed", () => {
  assert.equal(inviteLinkState({ found: true, status: "declined" }), "closed");
});
test("the Sent to note is trimmed to 40 characters and blank means none", () => {
  assert.equal(cleanSentTo("   "), null);
  assert.equal(cleanSentTo("  LaSalle  "), "LaSalle");
  assert.equal(cleanSentTo("x".repeat(60))?.length, 40);
});
