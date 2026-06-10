import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { lovable } from "@/integrations/lovable/index";
import { claimReferral } from "@/lib/referrals.functions";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Kingdom Protocol" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const claim = useServerFn(claimReferral);
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function tryClaim() {
    try {
      const code = typeof window !== "undefined" ? window.localStorage.getItem("kp_ref") : null;
      if (code) {
        await claim({ data: { code } });
        window.localStorage.removeItem("kp_ref");
      }
    } catch {}
  }

  useEffect(() => {
    if (!loading && user) {
      tryClaim().finally(() => navigate({ to: "/dashboard" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: "email",
    });
    setBusy(false);
    if (error || !data.user) {
      setErr("Invalid or expired code. Try again.");
      return;
    }
    await tryClaim();
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6" style={{ background: "#0a0800" }}>
      <div className="w-full max-w-sm flex flex-col items-center">
        <img src="/kingdom-protocol-logo.png" alt="Kingdom Protocol" className="w-40 block" style={{ filter: "drop-shadow(0 0 28px rgba(201,168,76,0.3))" }} />
        <p className="text-sm text-[#666] mt-1 mb-6">
          {step === "email" ? "Enter your email to continue" : `Code sent to ${email}`}
        </p>
        {step === "email" ? (
          <>
            <button
              type="button"
              onClick={async () => {
                setErr(null);
                const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
                if (r.error) setErr("Google sign-in failed. Try email instead.");
              }}
              className="w-full py-3 bg-white text-black rounded-md font-semibold flex items-center justify-center gap-2 mb-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <div className="flex items-center gap-2 my-3 text-[0.65rem] text-[#444] uppercase tracking-wider">
              <div className="flex-1 h-px bg-[#222]" /> or <div className="flex-1 h-px bg-[#222]" />
            </div>
            <form onSubmit={sendOtp} className="w-full flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none"
              />
              {err && <p className="text-red-400 text-xs">{err}</p>}
              <button disabled={busy} className="py-3 bg-[#161210] border border-[#222] text-white rounded-md font-semibold">
                {busy ? "Sending…" : "Send code to email"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={verify} className="w-full flex flex-col gap-3">
            <input
              type="text"
              required
              autoFocus
              maxLength={8}
              inputMode="numeric"
              placeholder="Enter code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none text-center tracking-[0.3em] text-xl"
            />
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <button disabled={busy} className="py-3 bg-white text-black rounded-md font-semibold">
              {busy ? "Verifying…" : "Verify"}
            </button>
            <button type="button" onClick={() => setStep("email")} className="text-[#555] text-xs">
              Use a different email
            </button>
          </form>
        )}
        <Link to="/" className="mt-8 text-xs text-[#444]">← Back home</Link>
      </div>
    </main>
  );
}
