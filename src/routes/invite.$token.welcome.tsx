import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { acceptLaneInvite, getInvitePreview } from "@/lib/invites.functions";
import { getVapidPublicKey } from "@/lib/api.functions";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/invite/$token/welcome")({
  head: () => ({ meta: [{ title: "You're a Watchman — Kingdom Protocol" }] }),
  component: Welcome,
});

function Welcome() {
  const { token } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const acceptFn = useServerFn(acceptLaneInvite);
  const previewFn = useServerFn(getInvitePreview);
  const vapidFn = useServerFn(getVapidPublicKey);

  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<"idle" | "asking" | "granted" | "denied">("idle");
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  // Ensure invite is accepted (covers OAuth return path)
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/invite/$token", params: { token } });
      return;
    }
    (async () => {
      await acceptFn({ data: { token } }).catch(() => {});
      const p = await previewFn({ data: { token } }).catch(() => null);
      if (p && p.found) setOwnerName(p.ownerFirstName || p.ownerEmail || "your friend");
    })();
  }, [loading, user, token, acceptFn, previewFn, navigate]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }

  async function enablePush() {
    setPushStatus("asking");
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus("denied");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPushStatus("denied");
        return;
      }
      // Register the service worker first — `ready` never resolves without one.
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const reg = await navigator.serviceWorker.ready;
      const vapidRes = await vapidFn().catch(() => null);
      const vapid = vapidRes?.key;
      if (!vapid) {
        setPushStatus("denied");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      const { data } = await supabase.auth.getSession();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(data.session?.access_token ? { authorization: `Bearer ${data.session.access_token}` } : {}),
        },
        body: JSON.stringify(sub.toJSON()),
      });
      setPushStatus("granted");
    } catch {
      setPushStatus("denied");
    }
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6 py-12" style={{ background: "#0a0800" }}>
      <div className="w-full max-w-md">
        <img src="/kingdom-protocol-logo.png" alt="Kingdom Protocol" className="w-28 mb-8 mx-auto" style={{ filter: "drop-shadow(0 0 28px rgba(201,168,76,0.3))" }} />

        <p className="text-[0.7rem] text-[#c9a84c] uppercase tracking-[0.2em] mb-3 text-center">You're in</p>
        <h1 className="text-2xl font-bold mb-3 text-center leading-tight">
          You're now watching {ownerName ?? "their"} path.
        </h1>
        <p className="text-sm text-[#888] text-center mb-8 leading-relaxed">
          Two quick setup steps so you don't miss a ping.
        </p>

        <Step
          number={1}
          title="Install the app"
          body="Adds Kingdom Protocol to your home screen so it opens like a real app."
          action={
            installed ? (
              <div className="text-xs text-[#4ade80]">✓ Installed</div>
            ) : installPrompt ? (
              <button onClick={install} className="px-4 py-2 bg-white text-black rounded-md font-semibold text-xs">Install</button>
            ) : (
              <div className="text-[0.65rem] text-[#666] text-right max-w-[140px]">Use your browser's "Add to Home Screen"</div>
            )
          }
        />

        <Step
          number={2}
          title="Enable pings"
          body={`Get notified the moment ${ownerName ?? "they"} misses or breaches a check-in.`}
          action={
            pushStatus === "granted" ? (
              <div className="text-xs text-[#4ade80]">✓ Pings on</div>
            ) : pushStatus === "denied" ? (
              <div className="text-xs text-[#f87171]">Blocked — enable in settings</div>
            ) : (
              <button onClick={enablePush} disabled={pushStatus === "asking"} className="px-4 py-2 bg-[#c9a84c] text-black rounded-md font-semibold text-xs">
                {pushStatus === "asking" ? "Asking…" : "Enable pings"}
              </button>
            )
          }
        />

        <Link to="/partner" className="block w-full py-3.5 bg-white text-black rounded-md font-semibold text-center mt-8">
          Go to Watchman view →
        </Link>
      </div>
    </main>
  );
}

function Step({ number, title, body, action }: { number: number; title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-4 rounded-md border border-[#2a2518] mb-3" style={{ background: "#161210" }}>
      <div className="w-7 h-7 rounded-full bg-[#c9a84c] text-black flex items-center justify-center font-bold text-sm flex-shrink-0">{number}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white mb-1">{title}</p>
        <p className="text-xs text-[#888] leading-relaxed">{body}</p>
      </div>
      <div className="flex-shrink-0 flex items-center">{action}</div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
