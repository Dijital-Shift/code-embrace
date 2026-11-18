import { test } from "node:test";
import assert from "node:assert/strict";
import { inviteLinkState, linkAfterAccept } from "./invite-link";

test("a link to a Path with two Watchmen shows The Watch Is Set", () => {
  assert.equal(inviteLinkState({ found: true, status: "pending", full: true }), "full");
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
  assert.equal(linkAfterAccept(1, 0), "keep-open");
});
test("the used link closes when another open link already covers the second seat", () => {
  assert.equal(linkAfterAccept(1, 1), "close");
});
test("filling the second seat closes every open link on the Path", () => {
  assert.equal(linkAfterAccept(2, 1), "close-all");
});
test("a declined watch request reads as closed", () => {
  assert.equal(inviteLinkState({ found: true, status: "declined" }), "closed");
});
