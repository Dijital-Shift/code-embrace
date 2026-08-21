import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getInvitePreview, acceptLaneInvite } from "@/lib/invites.functions";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/invite/$token")({
  head: () => ({ meta: [{ title: "You've been invited — Kingdom Protocol" }] }),
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const previewFn = useServerFn(getInvitePreview);
  const acceptFn = useServerFn(acceptLaneInvite);

  const [accepting, setAccepting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<"choose" | "email" | "code">("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: preview, isLoading } = useQuery({
    queryKey: ["invite-preview", token],
    queryFn: () => previewFn({ data: { token } }),
  });

  async function accept() {
    setAccepting(true);
    setErr(null);
    const r = await acceptFn({ data: { token } });
    setAccepting(false);
    if ("error" in r && r.error) {
      if ((r as any).alreadyWatchman) {
        navigate({ to: "/partner" });
        return;
      }
      setErr(r.error);
      return;
    }
    navigate({ to: "/invite/$token/welcome", params: { token } });
  }

  async function signInWithGoogle() {
    setErr(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.href,
    });
    if (result.error) setErr("Sign-in failed. Try again.");
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true, emailRedirectTo: window.location.href },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setAuthStep("code");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (error) setErr("Invalid or expired code.");
    // Once verified, AuthProvider flips user; useEffect-style branch below handles next step.
  }

  if (isLoading || loading) {
    return <Shell><p className="text-[#9e968a] text-sm">Loading invite…</p></Shell>;
  }

  if (!preview || !preview.found) {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-2">Invite not found</h1>
        <p className="text-sm text-[#b8b0a4] mb-6">This link is invalid. Ask whoever sent it to send a fresh one.</p>
        <Link to="/" className="text-xs text-[#c9a84c]">← Home</Link>
      </Shell>
    );
  }

  if (preview.status === "accepted") {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-2">Already used</h1>
        <p className="text-sm text-[#b8b0a4] mb-6">This invite has already been accepted.</p>
        <Link to="/" className="text-xs text-[#c9a84c]">← Home</Link>
      </Shell>
    );
  }

  if (preview.status === "revoked") {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-2">Invite cancelled</h1>
        <p className="text-sm text-[#b8b0a4] mb-6">The person who sent this cancelled the invite.</p>
        <Link to="/" className="text-xs text-[#c9a84c]">← Home</Link>
      </Shell>
    );
  }

  if (preview.expired) {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-2">Invite expired</h1>
        <p className="text-sm text-[#b8b0a4] mb-6">Ask {preview.ownerFirstName ?? "the sender"} to send a fresh link.</p>
        <Link to="/" className="text-xs text-[#c9a84c]">← Home</Link>
      </Shell>
    );
  }

  const ownerName = preview.ownerFirstName || preview.ownerEmail || "Someone";

  return (
    <Shell>
      <p className="text-[0.7rem] text-[#c9a84c] uppercase tracking-[0.2em] mb-4">You've been called</p>
      <h1 className="text-2xl font-bold mb-3 leading-tight">
        {ownerName} is asking you to be their Watchman.
      </h1>
      <div className="p-4 rounded-md border border-[#2a2518] mb-6" style={{ background: "#161210" }}>
        <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-1">The path</p>
        <p className="text-base text-white font-semibold">"{preview.laneTitle}"</p>
      </div>
      <p className="text-sm text-[#c8c0b4] mb-6 leading-relaxed">
        Here's what it costs you: a ping when {ownerName.split(" ")[0]} logs a breach on this path,
        and a ping if two days pass with no check-in at all. Nothing else — no daily noise.
        You'll see the path in your app, and you reach out when one of those pings lands.
      </p>

      {user ? (
        <>
          <button
            onClick={accept}
            disabled={accepting}
            className="w-full py-3.5 bg-white text-black rounded-md font-semibold mb-3"
          >
            {accepting ? "Accepting…" : `Accept — Watch ${ownerName.split(" ")[0]}'s path`}
          </button>
          {err && <p className="text-red-400 text-xs">{err}</p>}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          {authStep === "choose" && (
            <>
              <p className="text-xs text-[#a8a094] mb-1">Sign in to accept — takes 10 seconds.</p>
              <button
                onClick={signInWithGoogle}
                className="w-full py-3.5 bg-white text-black rounded-md font-semibold flex items-center justify-center gap-2"
              >
                <GoogleIcon /> Continue with Google
              </button>
              <button
                onClick={() => setAuthStep("email")}
                className="w-full py-3 rounded-md border border-[#222] text-[#c8c0b4] text-sm"
                style={{ background: "#161210" }}
              >
                Use email instead
              </button>
              {err && <p className="text-red-400 text-xs">{err}</p>}
            </>
          )}
          {authStep === "email" && (
            <form onSubmit={sendOtp} className="flex flex-col gap-3">
              <input
                type="email"
                required
                autoFocus
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none"
              />
              <button disabled={busy} className="py-3 bg-white text-black rounded-md font-semibold">
                {busy ? "Sending…" : "Send code"}
              </button>
              <button type="button" onClick={() => setAuthStep("choose")} className="text-xs text-[#9e968a]">
                ← Back
              </button>
              {err && <p className="text-red-400 text-xs">{err}</p>}
            </form>
          )}
          {authStep === "code" && (
            <form onSubmit={verifyOtp} className="flex flex-col gap-3">
              <p className="text-xs text-[#b8b0a4]">Code sent to {email}</p>
              <input
                type="text"
                required
                autoFocus
                maxLength={8}
                inputMode="numeric"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none text-center tracking-[0.3em] text-xl"
              />
              <button disabled={busy} className="py-3 bg-white text-black rounded-md font-semibold">
                {busy ? "Verifying…" : "Verify & continue"}
              </button>
              {err && <p className="text-red-400 text-xs">{err}</p>}
            </form>
          )}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6 py-12" style={{ background: "#0a0800" }}>
      <div className="w-full max-w-md">
        <img src="/kingdom-protocol-logo.png" alt="Kingdom Protocol" className="w-28 mb-8 mx-auto" style={{ filter: "drop-shadow(0 0 28px rgba(201,168,76,0.3))" }} />
        {children}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
