// Pure rules for "Watchmen on a phone stand watch from the installed Home Screen app", because lock-screen alarms reach only that app.
export type DeviceKind = "ios" | "android" | "desktop";

export function deviceKind(ua: string, maxTouchPoints = 0, platform = ""): DeviceKind {
  if (/iPhone|iPad|iPod/i.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

/** Message, social and mail apps open links in their own browser, which can't add to the Home Screen. */
export function isInAppBrowser(ua: string) {
  return /FBAN|FBAV|Instagram|LinkedInApp|Snapchat|GSA\/|Line\/|; wv\)|GmailApp|Outlook/i.test(ua);
}

/** Phones must use the installed app. Desktop and the editor preview frame pass through. */
export function mustOpenInApp(o: { kind: DeviceKind; standalone: boolean; embedded: boolean }) {
  return o.kind !== "desktop" && !o.standalone && !o.embedded;
}

export type InstallBrowser = "safari" | "ios-other" | "inapp" | "chrome" | "samsung" | "android-other" | "desktop";

export function installBrowser(ua: string, maxTouchPoints = 0, platform = ""): InstallBrowser {
  const kind = deviceKind(ua, maxTouchPoints, platform);
  if (kind === "desktop") return "desktop";
  if (isInAppBrowser(ua)) return "inapp";
  if (kind === "ios") return /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua) ? "ios-other" : "safari";
  if (/SamsungBrowser/i.test(ua)) return "samsung";
  return /Chrome\//i.test(ua) && !/EdgA|OPR|Firefox/i.test(ua) ? "chrome" : "android-other";
}

export type InstallStep = { text: string; copyLink?: boolean };

export function installSteps(tab: "ios" | "android", browser: InstallBrowser): InstallStep[] {
  if (tab === "ios") {
    const open: InstallStep[] = browser === "inapp" || browser === "ios-other"
      ? [{ text: "Open this page in Safari. Copy the link, open Safari, and paste it in the address bar.", copyLink: true }] : [];
    return [...open,
      { text: "Tap Share: the square with an arrow pointing up. Don't see it? Tap ••• first." },
      { text: "Scroll down and tap “Add to Home Screen”." },
      { text: "Tap “Add” in the top right corner." },
      { text: "Close Safari and open Kingdom Protocol from its icon." }];
  }
  const finish = { text: "Open Kingdom Protocol from its icon on your Home Screen." };
  if (browser === "samsung") return [{ text: "Tap the ≡ menu at the bottom right." }, { text: "Tap “Add page to”, then “Home screen”, then “Add”." }, finish];
  const open: InstallStep[] = browser === "inapp" || browser === "android-other"
    ? [{ text: "Open this page in Chrome. Copy the link, open Chrome, and paste it in the address bar.", copyLink: true }] : [];
  return [...open, { text: "Tap the ⋮ menu at the top right of Chrome." }, { text: "Tap “Install app” or “Add to Home screen”, then “Install”." }, finish];
}

/** An invitation opened in the browser is remembered so the installed app can return to it if it wasn't accepted first. */
export const PENDING_INVITE_KEY = "kp_pending_invite";
const PENDING_TTL_MS = 48 * 60 * 60 * 1000;

export function encodePendingInvite(token: string, now: number) { return JSON.stringify({ token, at: now }); }

export function readPendingInvite(raw: string | null, now: number): string | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { token?: unknown; at?: unknown };
    if (typeof v.token !== "string" || !/^[\w-]{6,200}$/.test(v.token) || typeof v.at !== "number") return null;
    return now - v.at <= PENDING_TTL_MS ? v.token : null;
  } catch { return null; }
}

/** Only the installed app on a page that isn't already the invitation resumes it. */
export function shouldResumeInvite(o: { standalone: boolean; pathname: string; token: string | null }) {
  return o.standalone && !!o.token && !o.pathname.startsWith("/invite/");
}
