import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { getInvitePreview, acceptLaneInvite } from "@/lib/invites.functions";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/invite/$token")({
  head: ({ params }) => ({ meta: [
    { title: "You've been invited — Kingdom Protocol" },
    { name: "description", content: "You've been asked to stand watch. Watching is free forever." },
    { property: "og:title", content: "You've been invited to stand watch." },
    { property: "og:description", content: "Watching a brother is free forever. No subscription, no payment required." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: `https://kingdomprotocol.app/invite/${params.token}` },
    { property: "og:image", content: "https://kingdomprotocol.app/og-card.jpg?v=7" },
    { property: "og:image:secure_url", content: "https://kingdomprotocol.app/og-card.jpg?v=7" },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Kingdom Protocol — accountability with a watchman." },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: "https://kingdomprotocol.app/og-card.jpg?v=7" },
  ], links: [
    // Older Android message apps look for this instead of og:image.
    { rel: "image_src", href: "https://kingdomprotocol.app/og-card.jpg?v=7" },
  ] }),
  // Fetch the invite on the server so the card is already rendered when the
  // page paints — no "Loading invite…" flash on the phone.
  loader: async ({ params }) => {
    try {
      return { preview: await getInvitePreview({ data: { token: params.token } }) };
    } catch {
      return { preview: null };
    }
  },
  component: InvitePage,
});

function InvitePage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const previewFn = useServerFn(getInvitePreview);
  const acceptFn = useServerFn(acceptLaneInvite);
  const loaderData = Route.useLoaderData() as { preview?: Awaited<ReturnType<typeof getInvitePreview>> | null };

  const [accepting, setAccepting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [authStep, setAuthStep] = useState<"choose" | "email" | "code">("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const verifyingRef = useRef(false);
  const autoAcceptRef = useRef(false);
  const acceptingRef = useRef(false);

  const { data: preview, isLoading } = useQuery({
    queryKey: ["invite-preview", token],
    queryFn: () => previewFn({ data: { token } }),
    // The loader already fetched this server-side; reuse it and skip the
    // client refetch so the card never flashes a loading state.
    initialData: loaderData?.preview ?? undefined,
  });

  async function accept() {
    if (acceptingRef.current) return;
    acceptingRef.current = true;
    setAccepting(true);
    setErr(null);
    const r: any = await acceptFn({ data: { token } }).catch(() => ({ error: "Couldn't accept. Try again." }));
    acceptingRef.current = false;
    setAccepting(false);
    if (r?.alreadyWatchman) {
      navigate({ to: "/partner" });
      return;
    }
    if (r?.error) {
      setErr(r.error);
      return;
    }
    navigate({ to: "/invite/$token/welcome", params: { token } });
  }

  async function signInWithGoogle() {
    setErr(null);
    sessionStorage.setItem("watchman-auto-accept", token);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.href,
    });
    if (result.error) {
      sessionStorage.removeItem("watchman-auto-accept");
      setErr("Sign-in failed. Try again.");
    }
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

  async function runVerify(value: string) {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    autoAcceptRef.current = true;
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: value.trim(),
      type: "email",
    });
    setBusy(false);
    verifyingRef.current = false;
    if (error) {
      autoAcceptRef.current = false;
      setErr("Invalid or expired code.");
      return;
    }
    // Signed in just for this invite — accept right away, no extra tap.
    (document.activeElement as HTMLElement | null)?.blur?.();
  }

  function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    runVerify(code);
  }

  useEffect(() => {
    const returningFromSignIn = sessionStorage.getItem("watchman-auto-accept") === token;
    if (user && (autoAcceptRef.current || returningFromSignIn) && !accepting) {
      autoAcceptRef.current = false;
      sessionStorage.removeItem("watchman-auto-accept");
      accept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (isLoading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#c9a84c]/25 border-t-[#c9a84c] animate-spin" />
          <p className="text-[#9e968a] text-sm mt-5">Loading invite…</p>
        </div>
      </Shell>
    );
  }

  if (!preview || !preview.found) {
    return (
      <StatusCard
        eyebrow="Link not recognized"
        title="Invite Not Found"
        body="This link is no longer active. Reach out to whoever sent it to check in or get a fresh link."
      />
    );
  }

  if (preview.pathGone) {
    const who = preview.ownerFirstName;
    return (
      <StatusCard
        eyebrow="Invite closed"
        title={who ? `Reach out to ${who}` : "Reach out to the sender"}
        body={`This path is no longer active. Reach out to ${who ?? "them"} directly to check in on them or ask for a fresh link.`}
      />
    );
  }

  if (preview.status === "accepted") {
    return (
      <StatusCard
        eyebrow="On the wall"
        title="Already Standing"
        body="This invite has already been accepted. If it was you, your watch is waiting."
        action={user ? { to: "/partner", label: "Go to The Watch" } : { to: "/login", label: "Sign in to The Watch" }}
      />
    );
  }

  if (preview.status === "revoked") {
    return (
      <StatusCard
        eyebrow="Invite closed"
        title="Invite Cancelled"
        body={`${preview.ownerFirstName ?? "The sender"} cancelled this invite. If that was a mistake, ask them for a fresh link.`}
      />
    );
  }

  if (preview.expired) {
    return (
      <StatusCard
        eyebrow="Link timed out"
        title="Invite Expired"
        body={`Invites last 48 hours. Ask ${preview.ownerFirstName ?? "the sender"} to send a fresh link — it takes them one tap.`}
      />
    );
  }

  const ownerName = preview.ownerFirstName || preview.ownerEmail || "Someone";

  return (
    <Shell>
      <p className="text-[0.7rem] text-[#c9a84c] uppercase tracking-[0.2em] mb-4">You've been invited</p>
      <h1 className="text-2xl font-bold mb-3 leading-tight">
        {ownerName} is asking you to be their Watchman.
      </h1>
      <div className="p-4 rounded-md border border-[#2a2518] mb-6" style={{ background: "#161210" }}>
        <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-1">The path</p>
        <p className="text-base text-white font-semibold">"{preview.laneTitle}"</p>
        {preview.laneDescription && (
          <p className="text-xs text-[#b8b0a4] mt-1.5 leading-relaxed">{preview.laneDescription}</p>
        )}
      </div>
      <div className="mb-6 p-4 rounded-xl border border-[#c9a84c]/30 text-center" style={{ background: "#161210" }}>
        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#c9a84c] font-semibold mb-2">Why you were chosen</p>
        <p className="text-sm text-[#e8dfc4] leading-relaxed">
          {ownerName.split(" ")[0]} {(preview as any).isAvoid
            ? "is fighting to break a stronghold and refuses to fight it in the dark."
            : "is committed to building a disciplined walk and refuses to walk it alone."}{" "}
          They chose you personally to keep them honest before the Most High God.
        </p>
      </div>

      {user ? (
        <>
          <Button
            onClick={accept}
            disabled={accepting}
            className="w-full h-auto min-h-12 whitespace-normal font-semibold mb-3"
          >
            {accepting ? "Accepting…" : `Accept — Watch ${ownerName.split(" ")[0]}'s path`}
          </Button>
          {err && <p className="text-red-400 text-xs mb-3">{err}</p>}
        </>
      ) : loading ? (
        // Auth is still resolving (server render + first hydration beat) —
        // hold the slot quietly instead of flashing the sign-in buttons.
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 rounded-full border-2 border-[#c9a84c]/25 border-t-[#c9a84c] animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {authStep === "choose" && (
            <>
              <p className="text-xs text-[#a8a094] mb-1 text-center">Sign in to accept — it's free.</p>
              <button
                onClick={signInWithGoogle}
                className="w-full py-3.5 bg-[#c9a84c] text-[#0a0800] rounded-md font-semibold flex items-center justify-center gap-2"
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
                className="px-4 py-3 bg-[#161210] border border-[#2a2518] rounded-md text-white outline-none"
              />
              <button disabled={busy} className="py-3 bg-[#c9a84c] text-[#0a0800] rounded-md font-semibold">
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
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(v);
                  if (v.length === 6) runVerify(v);
                }}
                className="px-4 py-3 bg-[#161210] border border-[#2a2518] rounded-md text-white outline-none text-center tracking-[0.3em] text-xl"
              />
              <button disabled={busy || accepting} className="py-3 bg-[#c9a84c] text-[#0a0800] rounded-md font-semibold">
                {accepting ? "Accepting…" : busy ? "Verifying…" : "Verify & continue"}
              </button>
              {err && <p className="text-red-400 text-xs">{err}</p>}
            </form>
          )}
        </div>
      )}

      <AppTip />
      <p className="text-xs text-muted-foreground text-center mb-4">On iPhone, this link opens Safari. Your accepted Path also appears in the installed app when you use the same account.</p>
      <p className="text-xs text-muted-foreground text-center mb-6">Already watching two Paths for {ownerName.split(" ")[0]}? That's the limit for this person, not for everyone you watch.</p>
      <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#8f887c] text-center mb-4 mt-2">— What you're saying yes to —</p>
      <div className="mb-6 p-4 rounded-xl border border-[#c9a84c]/30" style={{ background: "linear-gradient(135deg, #1a1408 0%, #0a0800 100%)" }}>
        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#c9a84c] font-semibold mb-3 text-center">The commitment: under 5 minutes a week</p>
        <ul className="flex flex-col gap-2.5 text-sm text-[#e8dfc4] leading-relaxed list-none p-0 m-0">
          <li><span className="text-[#c9a84c]">◆</span> Zero daily homework. If they stay on the Path, your life isn't interrupted.</li>
          <li><span className="text-[#c9a84c]">◆</span> When an alert lands, a 30-second text or a quick call is all it takes. You are the lifeline.</li>
          <li><span className="text-[#c9a84c]">◆</span> Free forever. No trial, no card.</li>
        </ul>
      </div>
      <div className="mb-6 p-4 rounded-xl border border-[#c9a84c]/30" style={{ background: "linear-gradient(135deg, #1a1408 0%, #0a0800 100%)" }}>
        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-[#c9a84c] font-semibold mb-3 text-center">The Watchman's Role</p>
        <ul className="flex flex-col gap-2.5 text-sm text-[#e8dfc4] leading-relaxed list-none p-0 m-0">
          <li><span className="text-[#c9a84c]">◆</span> Stand watch over one Path — see its Standing and Fallen days in your app.</li>
          <li><span className="text-[#c9a84c]">◆</span> Get pinged only on a breach, or after two silent days. No daily noise.</li>
          <li><span className="text-[#c9a84c]">◆</span> When a ping lands, reach out — call, text, or send a word of Scripture.</li>
        </ul>
        <p className="text-xs italic text-[#c2af80] leading-relaxed mt-4 text-center">“So thou, O son of man, I have set thee a watchman unto the house of Israel.”</p>
        <p className="text-[0.65rem] uppercase tracking-[0.16em] text-[#f3d27a] font-bold mt-1 text-right">Ezekiel 33:7 (KJV)</p>
      </div>
      <div className="mb-6 p-4 rounded-xl border border-[#c9a84c]/40 text-center" style={{ background: "#161210" }}>
        <p className="text-sm font-semibold text-[#f3d27a]">Watching is free forever.</p>
        <p className="text-xs text-[#c8c0b4] mt-1 leading-relaxed">No subscription, no payment required. Just create an account. You'd only pay if you later start a Path of your own, after its 30-day free trial.</p>
      </div>
      <div className="text-center mb-6">
        <Link to="/demo" search={{ invite: token, name: ownerName }} className="inline-block text-xs text-[#c9a84c] underline">
          How does this work?
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center px-6 py-12" style={{ background: "#0a0800" }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/kingdom-protocol-logo.png" alt="" className="w-24" style={{ filter: "drop-shadow(0 0 28px rgba(201,168,76,0.3))" }} />
          <p
            className="mt-4 text-[0.8rem] uppercase tracking-[0.32em] text-[#e5af38]"
            style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif", textShadow: "0 0 18px rgba(229,175,56,0.35)" }}
          >
            Kingdom Protocol
          </p>
        </div>
        {children}
      </div>
    </main>
  );
}

function StatusCard({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: { to: "/partner" | "/login"; label: string };
}) {
  return (
    <Shell>
      <div
        className="rounded-xl border border-[#c9a84c]/40 px-6 py-8 text-center"
        style={{ background: "linear-gradient(180deg, #161210 0%, #0f0c08 100%)", boxShadow: "0 0 40px rgba(201,168,76,0.08)" }}
      >
        <p className="text-[0.65rem] text-[#c9a84c] uppercase tracking-[0.22em] mb-3">{eyebrow}</p>
        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
        <div className="mx-auto mb-4 h-px w-12 bg-[#c9a84c]/50" />
        <p className="text-sm text-[#b8b0a4] leading-relaxed">{body}</p>
        {action && (
          <Link
            to={action.to}
            className="mt-6 inline-block w-full py-3 rounded-md bg-[#c9a84c] text-[#0a0800] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5af38] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0800]"
          >
            {action.label}
          </Link>
        )}
      </div>
      <div className="mt-6 text-center">
        <Link to="/" className="text-xs text-[#9e968a] hover:text-[#c9a84c]">Learn about Kingdom Protocol</Link>
      </div>
    </Shell>
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

// Short tip for people who already have the app installed.
function AppTip() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      navigator.vibrate?.(25);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    } catch { /* clipboard blocked; the link stays in the address bar */ }
  }
  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[#2a2418] px-4 py-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="text-[#c9a84c] font-semibold">Already have the app?</span> Copy this link and paste it in The Watch tab — or accept above.
      </p>
      <button type="button" onClick={copy} className="shrink-0 rounded-md border border-[#c9a84c]/60 px-3 py-2 text-xs font-semibold text-[#c9a84c]">
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
