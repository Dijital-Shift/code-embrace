import { test } from "node:test";
import assert from "node:assert/strict";
import { encodePendingInvite, installBrowser, installSteps, mustOpenInApp, readPendingInvite, shouldResumeInvite } from "./app-mode";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1";

test("locks phone browsers but not the installed app, desktop or preview frame", () => {
  assert.equal(mustOpenInApp({ kind: "ios", standalone: false, embedded: false }), true);
  assert.equal(mustOpenInApp({ kind: "ios", standalone: true, embedded: false }), false);
  assert.equal(mustOpenInApp({ kind: "desktop", standalone: false, embedded: false }), false);
  assert.equal(mustOpenInApp({ kind: "android", standalone: false, embedded: true }), false);
});
test("tells in-app browser users to open Safari first", () => {
  assert.equal(installBrowser(IPHONE + " Instagram 300.0"), "inapp");
  assert.equal(installSteps("ios", "inapp")[0].copyLink, true);
  assert.equal(installSteps("ios", "safari")[0].copyLink, undefined);
});
test("remembers an invitation for 48 hours only", () => {
  const raw = encodePendingInvite("abc123token", 1000);
  assert.equal(readPendingInvite(raw, 1000 + 47 * 3600e3), "abc123token");
  assert.equal(readPendingInvite(raw, 1000 + 49 * 3600e3), null);
  assert.equal(readPendingInvite("garbage", 0), null);
});
test("resumes the invitation only inside the installed app", () => {
  assert.equal(shouldResumeInvite({ standalone: true, pathname: "/dashboard", token: "t" }), true);
  assert.equal(shouldResumeInvite({ standalone: false, pathname: "/dashboard", token: "t" }), false);
  assert.equal(shouldResumeInvite({ standalone: true, pathname: "/invite/t", token: "t" }), false);
});
