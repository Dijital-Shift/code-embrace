import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Kingdom Protocol" }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

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
          <form onSubmit={sendOtp} className="w-full flex flex-col gap-3">
            <input
              type="email"
              required
              autoFocus
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none"
            />
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <button disabled={busy} className="py-3 bg-white text-black rounded-md font-semibold">
              {busy ? "Sending…" : "Send Code"}
            </button>
          </form>
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
