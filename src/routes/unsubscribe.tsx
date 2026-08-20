import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/unsubscribe")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Unsubscribe — Kingdom Protocol" },
      { name: "description", content: "Stop receiving emails from Kingdom Protocol." },
      { property: "og:title", content: "Unsubscribe — Kingdom Protocol" },
      { property: "og:description", content: "Stop receiving emails from Kingdom Protocol." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Unsubscribe,
});

function Unsubscribe() {
  const [state, setState] = useState<"loading" | "ready" | "done" | "error">("loading");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
    if (!t) {
      setState("error");
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then((r) => setState(r.ok ? "ready" : "error"))
      .catch(() => setState("error"));
  }, []);

  async function confirm() {
    if (!token) return;
    setState("loading");
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setState(r.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6" style={{ background: "#0a0800" }}>
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl text-white" style={{ fontFamily: "Cinzel, Georgia, serif", letterSpacing: "0.05em" }}>
          Kingdom Protocol
        </h1>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[#c9a84c] mt-1 mb-8">Accountability. No noise.</p>

        {state === "loading" && <p className="text-[#b8b0a4] text-sm">One moment…</p>}
        {state === "ready" && (
          <>
            <p className="text-[#d0c8bc] text-sm mb-6">Stop receiving emails from Kingdom Protocol?</p>
            <button onClick={confirm} className="w-full py-3 bg-white text-black rounded-md font-semibold">
              Confirm unsubscribe
            </button>
          </>
        )}
        {state === "done" && <p className="text-[#d0c8bc] text-sm">You&rsquo;re unsubscribed. No further emails will be sent.</p>}
        {state === "error" && <p className="text-red-400 text-sm">This unsubscribe link is invalid or has expired.</p>}
      </div>
    </main>
  );
}
