import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { getInvitePreview, acceptLaneInvite } from "@/lib/invites.functions";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Eye, BellRing, ShieldCheck } from "lucide-react";
import { revealWatchmanAlert } from "@/lib/watchman-alert";
import { PENDING_INVITE_KEY, encodePendingInvite, installBrowser } from "@/lib/app-mode";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { InstallWalkthrough } from "@/components/InstallWalkthrough";
import { Smartphone, Compass, Copy } from "lucide-react";

export const Route = createFileRoute("/invite/$token")({
  head: ({ params }) => ({ meta: [
    { title: "You've been invited — Kingdom Protocol" },
    { name: "description", content: "You've been asked to stand watch. Watching is free forever." },
    { property: "og:title", content: "You've been invited to stand watch." },
    { property: "og:description", content: "Stand watch over someone you know. No subscription, no payment required." },
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
  const dutyRef = useRef<HTMLDivElement>(null);
  const [dutyOpen, setDutyOpen] = useState("");

  useEffect(() => {
    if (!dutyOpen) return;
    const timer = window.setTimeout(() => revealWatchmanAlert(dutyRef.current), 240);
    return () => window.clearTimeout(timer);
  }, [dutyOpen]);

  const { data: preview, isLoading } = useQuery({
    queryKey: ["invite-preview", token],
    queryFn: () => previewFn({ data: { token } }),
    // The loader already fetched this server-side; reuse it and skip the
    // client refetch so the card never flashes a loading state.
    initialData: loaderData?.preview ?? undefined,
  });

  // Remember an open invitation so installing first never loses it; closed invitations are forgotten.
  useEffect(() => {
    try {
      if (preview?.found && !preview.pathGone && !preview.expired && preview.status !== "accepted" && preview.status !== "revoked") localStorage.setItem(PENDING_INVITE_KEY, encodePendingInvite(token, Date.now()));
      else if (preview) localStorage.removeItem(PENDING_INVITE_KEY);
    } catch { /* storage blocked */ }
  }, [preview, token]);

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

  const ownerName = preview.ownerFirstName || "Someone";

  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-5 leading-tight text-center text-parchment">
        {ownerName} is asking you to be their Watchman.
      </h1>
      <div className="kp-watch-card relative p-5 rounded-md border border-action-gold-edge mb-5 text-center">
        <span className={`absolute top-3 right-3 text-xs font-semibold border rounded px-2 py-1 ${preview.isAvoid ? "text-history-breach border-action-ember-edge" : "text-history-held border-action-gold-edge"}`}>
          {preview.isAvoid ? "Flee" : "Pursue"}
        </span>
        <p className="kp-briefing-title text-lg text-parchment font-semibold mb-3">The Path</p>
        <p className="text-lg text-parchment font-semibold break-words">“{preview.laneTitle}”</p>
        {preview.laneDescription && (
          <p className="text-sm text-stone mt-2 leading-relaxed break-words">{preview.laneDescription}</p>
        )}
      </div>
      <div className="mb-5 text-center">
        <p className="text-xs uppercase text-primary font-semibold mb-2">Why you were chosen</p>
        <p className="text-sm text-secondary-foreground leading-relaxed">
          {ownerName.split(" ")[0]} {preview.isAvoid
            ? "is fighting to break a stronghold and refuses to fight it in the dark."
            : "is committed to building a disciplined walk and refuses to stand alone."}{" "}
          They chose you personally to keep them honest.
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
              <Button
                onClick={signInWithGoogle}
                className="w-full min-h-12 h-auto py-3 font-semibold"
              >
                <GoogleIcon /> Continue with Google
              </Button>
              <Button
                variant="outline"
                onClick={() => setAuthStep("email")}
                className="w-full min-h-12 h-auto text-secondary-foreground"
              >
                Use email instead
              </Button>
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
              <Button disabled={busy} className="min-h-12 h-auto py-3 font-semibold">
                {busy ? "Sending…" : "Send code"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAuthStep("choose")} className="text-xs text-stone">
                ← Back
              </Button>
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
              <Button disabled={busy || accepting} className="min-h-12 h-auto py-3 font-semibold">
                {accepting ? "Accepting…" : busy ? "Verifying…" : "Verify & continue"}
              </Button>
              {err && <p className="text-red-400 text-xs">{err}</p>}
            </form>
          )}
        </div>
      )}

      <AppTip />
      <SafariBanner />
      <Accordion type="single" collapsible value={dutyOpen} onValueChange={setDutyOpen} className="kp-invite-duty mb-6 border-y border-action-gold-edge">
        <AccordionItem ref={dutyRef} value="watchman-duty" className="border-0">
          <AccordionTrigger className="kp-briefing-title text-parchment text-lg font-semibold hover:no-underline py-5 gap-4 text-left [&_svg]:text-primary [&_svg]:h-5 [&_svg]:w-5">
            What you're saying yes to
          </AccordionTrigger>
          <AccordionContent className="text-sm text-secondary-foreground leading-relaxed pb-6">
            <ul className="list-none p-0 m-0 divide-y divide-action-stone-edge">
              <li className="flex gap-4 pb-4"><Eye aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="kp-briefing-title text-base font-semibold text-parchment mb-1">See how they're doing.</h3><p>Open The Watch to see whether they kept their commitment, reported a breach, or missed a check-in. You don't need to check in every day yourself.</p></div></li>
              <li className="flex gap-4 py-4"><BellRing aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="kp-briefing-title text-base font-semibold text-parchment mb-1">Reach out when alerted.</h3><p>If they report a breach or miss two days in a row, you receive an alert. Call, text, or send Scripture to encourage them and ask what happened. One silent day is visible in The Watch, but does not send you a silence alert.</p></div></li>
              <li className="flex gap-4 pt-4"><ShieldCheck aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="kp-briefing-title text-base font-semibold text-parchment mb-1">Watching is free forever.</h3><p>No subscription, payment card, or trial is required to be their Watchman. Walking a Path of your own is separate.</p></div></li>
            </ul>
            <p className="text-xs text-stone leading-relaxed mt-5">You can watch up to two active Paths for {ownerName.split(" ")[0]}. There is no total limit across different people — you choose how much to take on.</p>
            <blockquote className="border-l border-action-gold-edge pl-4 mt-5 text-stone text-sm italic">
              “So thou, O son of man, I have set thee a watchman unto the house of Israel.”
              <cite className="block mt-2 text-xs text-primary not-italic text-right">— Ezekiel 33:7 (KJV)</cite>
            </blockquote>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <InstallDrawer />
      <div className="text-center mb-6">
        <Link to="/demo" search={{ invite: token, name: ownerName }} className="inline-block text-xs text-primary underline">
          How does this work?
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] px-5 py-8 bg-background">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center mb-6">
          <img src="/kingdom-protocol-logo.png" alt="" className="w-24" />
          <p className="kp-invite-wordmark mt-3 text-2xl sm:text-3xl font-semibold uppercase text-center">Kingdom Protocol</p>
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
    <div className="mb-4 flex items-center justify-between gap-4 border-y border-border py-3">
      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="text-primary font-semibold">Already have the app?</span> Copy this link and paste it in The Watch tab — or accept above.
      </p>
      <Button type="button" variant="outline" onClick={copy} className="shrink-0 px-3 text-xs font-semibold text-primary">
        {copied ? "Copied ✓" : "Copy link"}
      </Button>
    </div>
  );
}

// Warns iPhone visitors who opened the invite inside Messages, Mail, Chrome, etc.
function SafariBanner() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const b = installBrowser(navigator.userAgent, navigator.maxTouchPoints, navigator.platform);
    setShow(b === "ios-other" || (b === "inapp" && /iPhone|iPad|iPod/i.test(navigator.userAgent)));
  }, []);
  if (!show) return null;
  async function copy() {
    try { await navigator.clipboard.writeText(window.location.href); navigator.vibrate?.(25); setCopied(true); setTimeout(() => setCopied(false), 3000); } catch { /* blocked */ }
  }
  return (
    <div role="note" className="mb-4 flex items-start gap-3 rounded-lg border border-primary/50 bg-card px-4 py-3">
      <Compass aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
      <div className="flex-1 text-xs leading-relaxed text-foreground">
        <p><span className="font-semibold text-primary">Open this page in Safari.</span> On iPhone, Watchman alarms only reach you when Kingdom Protocol is installed from Safari.</p>
        <button type="button" onClick={copy} className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-md border border-primary px-3 font-semibold text-primary">
          <Copy aria-hidden="true" size={13} />{copied ? "Link copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

// Quiet trigger that opens the install guide without leaving the invitation.
function InstallDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button type="button" className="mb-4 flex min-h-11 w-full items-center justify-center gap-2 text-xs font-semibold text-primary">
          <Smartphone aria-hidden="true" size={14} /> Installing on your phone? Tap for steps
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <SheetHeader className="text-left">
          <SheetTitle className="kp-briefing-title text-parchment">How to install</SheetTitle>
          <SheetDescription>On iPhone, use Safari. On Android, use Chrome. Accept the invitation first, then install.</SheetDescription>
        </SheetHeader>
        <InstallWalkthrough />
      </SheetContent>
    </Sheet>
  );
}
