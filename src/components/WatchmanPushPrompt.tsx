import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getVapidPublicKey } from "@/lib/push.functions";

function b64ToUint8(base64: string): Uint8Array {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

type Platform = "ios" | "android" | "desktop";
function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

type Perm = "granted" | "default" | "denied" | "unsupported";

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
}

const gold = "text-[#c9a84c] font-semibold";
const btn = "px-4 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold disabled:opacity-40";

/**
 * Watchman alert status panel. Checks install, permission, device
 * registration, and offers a test alert. Collapses to one line once all pass.
 */
export function WatchmanPushPrompt({ variant = "watchman", onReadinessChange }: { variant?: "watchman" | "owner"; onReadinessChange?: (ready: boolean) => void } = {}) {
  const vapidFn = useServerFn(getVapidPublicKey);
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [perm, setPerm] = useState<Perm>("default");
  const [registered, setRegistered] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const [testSent, setTestSent] = useState(false);
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<any>(null);
  const [otherDevices, setOtherDevices] = useState(0);
  const [setupHere, setSetupHere] = useState(false);

  const check = useCallback(async () => {
    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    const p: Perm = supported ? (Notification.permission as Perm) : "unsupported";
    setPerm(p);
    let reg = false;
    try {
      if (supported && p === "granted") {
        const r = await navigator.serviceWorker.getRegistration();
        const sub = await r?.pushManager.getSubscription();
        if (sub) {
          const res = await fetch(`/api/push/test?endpoint=${encodeURIComponent(sub.endpoint)}`, {
            headers: await authHeader(),
          });
          reg = res.ok && Boolean((await res.json()).registered);
        }
      }
    } catch {
      reg = false;
    }
    setRegistered(reg);
    if (!reg) {
      try {
        const res = await fetch("/api/push/test", { headers: await authHeader() });
        setOtherDevices(res.ok ? Number((await res.json()).devices) || 0 : 0);
      } catch { setOtherDevices(0); }
    } else setOtherDevices(0);
    setReady(true);
  }, []);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const resume = () => { if (document.visibilityState === "visible") void check(); };
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", resume);
    void check();
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [check]);

  async function enablePush() {
    setBusy(true);
    setErr(null);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("This browser can't receive alerts. Install the app first.");
      }
      const { key } = await vapidFn();
      if (!key) throw new Error("Alerts aren't configured yet. Try again shortly.");
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const p = await Notification.requestPermission();
      setPerm(p as Perm);
      if (p !== "granted") throw new Error("Alerts were blocked. Follow the steps below to allow them.");
      // Clear any stale subscription first — an orphaned endpoint makes the
      // browser's push service reject the new one ("push service error").
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe().catch(() => {});
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: b64ToUint8(key) as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("Couldn't register this device. Try again.");
      setRegistered(true);
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      const isBrave = await ((navigator as any).brave?.isBrave?.() ?? Promise.resolve(false)).catch(() => false);
      if (/push service error|Registration failed/i.test(msg) && isBrave) {
        setErr(
          "Brave blocks alerts by default. Open Brave Settings → Privacy and security, turn on \"Use Google services for push messaging\", restart Brave, then tap Reconnect this device.",
        );
      } else if (/push service error|Registration failed/i.test(msg)) {
        setErr(
          platform === "desktop"
            ? "Your computer's notification service didn't answer. Turn off any VPN or ad-blocker, check that notifications for this app are allowed in System Settings, then tap Reconnect this device."
            : "Your device's notification service didn't answer. Turn off any VPN, then tap Reconnect this device.",
        );
      } else {
        setErr(msg || "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setTestMsg(null);
    try {
      const r = await navigator.serviceWorker.getRegistration();
      const sub = await r?.pushManager.getSubscription();
      if (!sub) {
        setRegistered(false);
        throw new Error("This device isn't registered. Tap Reconnect this device.");
      }
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeader()) },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      const { result } = await res.json().catch(() => ({ result: "failed" }));
      if (result === "sent") {
        setTestSent(true);
        setTestMsg("Test sent. It should arrive within a few seconds.");
      } else if (result === "rate_limited") setTestMsg("One test per minute. Try again shortly.");
      else if (result === "not_registered") {
        setRegistered(false);
        setTestMsg("This device isn't registered. Tap Reconnect this device.");
      } else setTestMsg("The test didn't go through. Tap Reconnect this device, then try again.");
    } catch (e: any) {
      setTestMsg(e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice?.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  // Alerts already reach another device on this account (e.g. the installed app) and this is just a browser.
  const armedElsewhere = !registered && !isStandalone() && otherDevices > 0;
  const alertReady = armedElsewhere || (perm === "granted" && registered && (platform !== "ios" || installed));
  useEffect(() => { onReadinessChange?.(ready && alertReady); }, [ready, alertReady, onReadinessChange]);
  if (!ready) return <p role="status" className="text-sm text-muted-foreground mb-6">Checking this device's alerts…</p>;
  if (armedElsewhere && !setupHere) {
    return (
      <div className="mb-6 rounded-xl border border-[#2a2000] px-4 py-3">
        <p className="text-xs text-[#ded8cc]">
          <span className="text-[#4ade80] mr-2">●</span>Alerts armed on your installed app
        </p>
        <p className="text-[0.7rem] text-[#a8a094] mt-1 leading-relaxed">
          You're in a browser right now. Alerts go to Kingdom Protocol on your Home Screen — open it there with the same account.
        </p>
        <button onClick={() => setSetupHere(true)} className="mt-2 text-[0.7rem] text-[#c9a84c] underline">Set up this browser too</button>
      </div>
    );
  }
  const allGood = installed && perm === "granted" && registered;
  const expanded = !allGood || open;

  const Row = ({ ok, label, children }: { ok: boolean; label: string; children?: React.ReactNode }) => (
    <div className="rounded-lg border border-[#2a2000] p-3">
      <p className="text-xs font-semibold flex items-center gap-2">
        <span className={ok ? "text-[#4ade80]" : "text-[#c9a84c]"}>{ok ? "✓" : "!"}</span>
        <span className="text-[#ded8cc]">{label}</span>
      </p>
      {!ok && children && <div className="mt-2 text-xs text-[#ded8cc] leading-relaxed">{children}</div>}
    </div>
  );

  if (!expanded) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 w-full flex items-center justify-between rounded-xl border border-[#2a2000] px-4 py-3 text-left"
      >
        <span className="text-xs text-[#ded8cc]">
          <span className="text-[#4ade80] mr-2">●</span>Alerts on · this device
        </span>
        <span className="text-[0.65rem] text-[#c9a84c] uppercase tracking-wider">Status ›</span>
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-[#c9a84c]/60 p-5" style={{ background: "linear-gradient(135deg, #1a1408 0%, #0a0800 100%)" }}>
      <div className="flex justify-between items-start mb-1">
        <p className="text-[0.6rem] uppercase tracking-wider text-[#c9a84c] font-semibold">Alert status</p>
        {allGood && (
          <button onClick={() => setOpen(false)} className="text-[0.65rem] text-[#a8a094]">Hide</button>
        )}
      </div>
      <p className="font-semibold text-sm mb-1">{variant === "owner" ? (allGood ? "Reminders are on." : "Turn on your reminders.") : allGood ? "You're on watch." : "You're standing watch for someone."}</p>
      <p className="text-xs text-[#c2af80] leading-relaxed mb-3">
        {variant === "owner"
          ? "One nudge at 9 AM if a check-in is still open, and one an hour before bedtime. Without this, nothing reaches your phone."
          : "Alerts only fire when they breach or go silent two days running. If this device can't receive them, you won't hear it — and neither will they."}
      </p>

      <div className="space-y-2">
        <Row ok={installed} label={installed ? "App installed" : "App not installed"}>
          {platform === "ios" && (
            <ol className="list-decimal list-inside space-y-1.5">
              <li>Make sure you're in <span className={gold}>Safari</span> (tap the Safari compass icon if you're inside another app's preview).</li>
              <li>Tap the <span className={gold}>Share</span> button — the square with an arrow pointing up, at the bottom of the screen.</li>
              <li>Scroll down and tap <span className={gold}>Add to Home Screen</span>, then open Kingdom Protocol from your home screen icon.</li>
            </ol>
          )}
          {platform === "android" && (
            <p className="mb-2">In Chrome, tap the <span className={gold}>⋮</span> menu → <span className={gold}>Add to Home screen</span>.</p>
          )}
          {platform === "desktop" && (
            <p className="mb-2">Use the install icon in your browser's address bar to install Kingdom Protocol.</p>
          )}
          {platform !== "ios" && deferred && <button onClick={install} className={btn}>Install app</button>}
        </Row>

        <Row
          ok={perm === "granted"}
          label={
            perm === "granted" ? "Notifications allowed" : perm === "denied" ? "Notifications blocked" :
            perm === "unsupported" ? "This browser can't receive alerts" : "Notifications not turned on"
          }
        >
          {perm === "default" && <button onClick={enablePush} disabled={busy} className={btn}>{busy ? "Enabling…" : "Enable alerts"}</button>}
          {perm === "unsupported" && (
            <p>{platform === "ios" ? "Install the app from Safari (above), then open it from your home screen." : "Open this page in Chrome, Edge, or Safari."}</p>
          )}
          {perm === "denied" && (
            <>
              {platform === "ios" && <p>Open the iPhone <span className={gold}>Settings</span> app → <span className={gold}>Notifications</span> → <span className={gold}>Kingdom Protocol</span> → turn on <span className={gold}>Allow Notifications</span>. Then come back here.</p>}
              {platform === "android" && <p>Long-press the Kingdom Protocol icon → <span className={gold}>App info</span> → <span className={gold}>Notifications</span> → turn <span className={gold}>On</span>. Then come back here.</p>}
              {platform === "desktop" && <p>Click the <span className={gold}>padlock</span> next to the web address → <span className={gold}>Notifications</span> → <span className={gold}>Allow</span>, then reload this page.</p>}
              <button onClick={() => void check()} className="mt-2 text-[#c9a84c] underline">I've changed it — check again</button>
            </>
          )}
        </Row>

        {perm === "granted" && (
          <Row ok={registered} label={registered ? "This device registered" : "This device isn't registered"}>
            <button onClick={enablePush} disabled={busy} className={btn}>{busy ? "Connecting…" : "Reconnect this device"}</button>
          </Row>
        )}

        {perm === "granted" && registered && (
          <div className="rounded-lg border border-[#2a2000] p-3">
            <p className="text-xs font-semibold text-[#ded8cc] mb-2">Test alert</p>
            <button onClick={sendTest} disabled={busy} className={btn}>{busy ? "Sending…" : "Send test alert"}</button>
            {testMsg && <p className="text-xs text-[#c2af80] mt-2">{testMsg}</p>}
            {testSent && (
              <p className="text-[0.7rem] text-[#8f887c] mt-2 leading-relaxed">
                Nothing showed up? Check that Focus / Do Not Disturb is off, and that Kingdom Protocol isn't set to
                deliver quietly in your notification settings.
              </p>
            )}
          </div>
        )}
      </div>
      {err && <p className="text-xs text-[#f87171] mt-2">{err}</p>}
    </div>
  );
}
