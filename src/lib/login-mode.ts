export type LoginMode = "signin" | "signup";
export type LoginSearch = { mode?: "signup" };

/** Only "signup" is carried in the URL; anything else falls back to Sign In. */
export function parseLoginSearch(search: Record<string, unknown>): LoginSearch {
  return search["mode"] === "signup" ? { mode: "signup" } : {};
}

/** "Start free" buttons open Create Account; plain sign-in links open Sign In. */
export function initialLoginMode(search: LoginSearch): LoginMode {
  return search.mode === "signup" ? "signup" : "signin";
}
