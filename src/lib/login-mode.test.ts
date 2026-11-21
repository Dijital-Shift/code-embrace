import { test } from "node:test";
import assert from "node:assert/strict";
import { initialLoginMode, parseLoginSearch } from "./login-mode";

test("Start free opens Create Account, not Welcome back", () => {
  assert.equal(initialLoginMode(parseLoginSearch({ mode: "signup" })), "signup");
});

test("a plain sign-in link opens Sign In", () => {
  assert.equal(initialLoginMode(parseLoginSearch({})), "signin");
  assert.equal(initialLoginMode(parseLoginSearch({ mode: "admin" })), "signin");
});
