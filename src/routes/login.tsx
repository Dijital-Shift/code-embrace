import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { claimReferral } from "@/lib/referrals.functions";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Kingdom Protocol" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const claim = useServerFn(claimReferral);
  const [step, setStep] = useState<"email" | "code">("email");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function tryClaim() {
    try {
      const code = typeof window !== "undefined" ? window.localStorage.getItem("kp_ref") : null;
      if (code) {
        await claim({ data: { code } });
        window.localStorage.removeItem("kp_ref");
      }
    } catch {}
  }


  async function requestCode(resend = false) {
    setErr(null);
    setNote(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      const m = error.message || "";
      if (/rate|too many|seconds/i.test(m)) {
        setErr("Too many requests. Wait a minute before asking for another code.");
      } else if (/network|fetch/i.test(m)) {
        setErr("Network problem — we couldn't reach the server. Check your connection and try again.");
      } else {
        setErr(m || "We couldn't send the code. Try again.");
      }
      return;
    }
    setStep("code");
    setToken("");
    setCooldown(45);
    if (resend) setNote("New code sent. Use the newest email — older codes stop working.");
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    await requestCode(false);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNote(null);
    setBusy(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: "email",
    });
    if (error || !data.user || !data.session) {
      setBusy(false);
      const m = error?.message || "";
      if (/expired/i.test(m)) {
        setErr("That code has expired. Send a new one below.");
      } else if (/rate|too many/i.test(m)) {
        setErr("Too many attempts. Wait a minute, then try again.");
      } else if (/network|fetch|failed to fetch/i.test(m)) {
        setErr("Network problem — the code wasn't checked. Check your connection and try again.");
      } else if (/invalid|token/i.test(m)) {
        setErr("That code didn't match. Codes are single-use — if you requested more than one, use the newest, or send a fresh code below.");
      } else {
        setErr(m || "Sign-in failed. Send a new code below.");
      }
      return;
    }
    // Make sure the session is actually persisted/readable before we navigate,
    // so the dashboard's auth gate never sees a stale null user.
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
    for (let i = 0; i < 20; i++) {
      const { data: s } = await supabase.auth.getSession();
      if (s.session) break;
      await new Promise((r) => setTimeout(r, 50));
    }
    setBusy(false);
    setVerified(true);
    tryClaim();
    setTimeout(() => {
      navigate({ to: "/dashboard", replace: true });
    }, 350);
  }


  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6" style={{ background: "#0a0800" }}>
      <div className="w-full max-w-sm flex flex-col items-center">
        <img src="/kingdom-protocol-logo.png" alt="Kingdom Protocol" className="w-40 block" style={{ filter: "drop-shadow(0 0 28px rgba(201,168,76,0.3))" }} />
        {step === "email" && (
          <div className="w-full grid grid-cols-2 gap-1 p-1 mt-3 mb-4 rounded-lg border border-[#222] bg-[#0f0c05]">
            {([["signin", "Sign In"], ["signup", "Create Account"]] as const).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-2 rounded-md text-sm font-semibold transition-colors ${
                  mode === m ? "bg-[#c9a84c] text-black" : "text-[#a49d8e]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {step === "email" ? (
          <>
            <h1 className="text-xl font-semibold text-white text-center">
              {mode === "signin" ? "Welcome back" : "Start your 30 days"}
            </h1>
            <p className="text-sm text-[#a8a094] mt-1 mb-6 text-center">
              {mode === "signin"
                ? "Enter your email and we'll send a 6-digit code."
                : "No card. Enter your email and we'll send a 6-digit code to create your account."}
            </p>
          </>
        ) : (
          <p className="text-sm text-[#a8a094] mt-1 mb-6 text-center">
            {`Enter the 6-digit code we sent to ${email}`}

          </p>
        )}

        {step === "email" ? (
          <>
            <button
              type="button"
              onClick={async () => {
                setErr(null);
                const r = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: `${window.location.origin}/dashboard`,
                });
                if (r.error) {
                  setErr("Google sign-in failed. Try email instead.");
                  return;
                }
                if (r.redirected) return;
                // Popup/preview variant: tokens are already set on the client.
                tryClaim();
                navigate({ to: "/dashboard", replace: true });
              }}
              className="w-full py-3 bg-white text-black rounded-md font-semibold flex items-center justify-center gap-2 mb-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
            <div className="flex items-center gap-2 my-3 text-[0.65rem] text-[#948d80] uppercase tracking-wider">
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
              minLength={6}
              maxLength={8}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6,8}"
              placeholder="Enter code"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none text-center tracking-[0.3em] text-xl"
            />
            <p className="text-[0.7rem] text-[#9e968a] text-center">
              The code expires in 1 hour and can only be used once.
            </p>
            {note && <p className="text-[#c9a84c] text-xs text-center">{note}</p>}
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <button
              disabled={busy || verified || token.length < 6}
              className="py-3 bg-white text-black rounded-md font-semibold disabled:opacity-60"
            >
              {verified ? "Verified" : busy ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              disabled={busy || cooldown > 0}
              onClick={() => requestCode(true)}
              className="text-[#c9a84c] text-xs"
              style={cooldown > 0 ? { color: "#7d766a" } : undefined}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
            <button type="button" onClick={() => setStep("email")} className="text-[#9e968a] text-xs">
              Use a different email
            </button>

          </form>
        )}
        <Link to="/" className="mt-8 text-xs text-[#948d80]">← Back home</Link>
      </div>
    </main>
  );
}
