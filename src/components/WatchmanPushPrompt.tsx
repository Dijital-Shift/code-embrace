import { useEffect, useState } from "react";
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

/**
 * Persistent (non-dismissible) prompt for watchmen. Reappears every session
 * until the app is installed AND push is actually subscribed.
 */
export function WatchmanPushPrompt() {
  const vapidFn = useServerFn(getVapidPublicKey);
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [deferred, setDeferred] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    setPlatform(detectPlatform());
    setInstalled(isStandalone());

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    (async () => {
      let on = false;
      try {
        if ("serviceWorker" in navigator && "PushManager" in window && Notification.permission === "granted") {
          const reg = await navigator.serviceWorker.getRegistration();
          const sub = await reg?.pushManager.getSubscription();
          on = Boolean(sub);
        }
      } catch {
        on = false;
      }
      if (!cancelled) {
        setPushOn(on);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

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

      const perm = await Notification.requestPermission();
      if (perm !== "granted") throw new Error("Alerts were blocked. Enable notifications in your browser settings.");

      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64ToUint8(key) as BufferSource,
        }));

      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session?.access_token ?? ""}`,
        },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("Couldn't register for alerts. Try again.");
      setPushOn(true);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
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

  if (!ready) return null;
  if (installed && pushOn) return null;

  return (
    <div className="mb-6 rounded-xl border border-[#c9a84c]/60 p-5" style={{ background: "linear-gradient(135deg, #1a1408 0%, #0a0800 100%)" }}>
      <p className="text-[0.6rem] uppercase tracking-wider text-[#c9a84c] font-semibold mb-1">Set the watch</p>
      <p className="font-semibold text-sm mb-1">You're standing watch for someone.</p>
      <p className="text-xs text-[#c2af80] leading-relaxed mb-3">
        Alerts only fire when they breach or go silent two days running. If this app isn't installed with
        notifications on, you won't hear it — and neither will they.
      </p>

      {!installed && (
        <div className="mb-3 rounded-lg border border-[#2a2000] p-3">
          <p className="text-[0.65rem] uppercase tracking-wider text-[#a8a094] font-semibold mb-1.5">Step 1 · Install</p>
          {platform === "ios" && (
            <p className="text-xs text-[#ded8cc] leading-relaxed">
              In Safari, tap <span className="text-[#c9a84c] font-semibold">Share</span> →{" "}
              <span className="text-[#c9a84c] font-semibold">Add to Home Screen</span>, then open Kingdom Protocol
              from your home screen.
            </p>
          )}
          {platform === "android" && (
            <>
              <p className="text-xs text-[#ded8cc] leading-relaxed mb-2">
                In Chrome, tap the <span className="text-[#c9a84c] font-semibold">⋮</span> menu →{" "}
                <span className="text-[#c9a84c] font-semibold">Add to Home screen</span>.
              </p>
              {deferred && (
                <button onClick={install} className="px-4 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold">
                  Install app
                </button>
              )}
            </>
          )}
          {platform === "desktop" && (
            <>
              <p className="text-xs text-[#ded8cc] leading-relaxed mb-2">
                Use the install icon in your browser's address bar to install Kingdom Protocol.
              </p>
              {deferred && (
                <button onClick={install} className="px-4 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold">
                  Install app
                </button>
              )}
            </>
          )}
        </div>
      )}

      {!pushOn && (
        <div className="rounded-lg border border-[#2a2000] p-3">
          <p className="text-[0.65rem] uppercase tracking-wider text-[#a8a094] font-semibold mb-1.5">
            {installed ? "Turn on alerts" : "Step 2 · Turn on alerts"}
          </p>
          <button
            onClick={enablePush}
            disabled={busy}
            className="px-5 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold disabled:opacity-40"
          >
            {busy ? "Enabling…" : "Enable alerts"}
          </button>
          {err && <p className="text-xs text-[#f87171] mt-2">{err}</p>}
        </div>
      )}
    </div>
  );
}
