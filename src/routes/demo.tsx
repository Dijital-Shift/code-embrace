import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Footprints,
  Heart,
  Mail,
  Moon,
  Send,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Kingdom Protocol demo — user and watchman, side by side" },
      { property: "og:title", content: "Kingdom Protocol demo — user and watchman, side by side" },
      { property: "og:description", content: "Follow a scripture-backed accountability walk with a real Watchman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      {
        name: "description",
        content:
          "End-to-end walkthrough of Kingdom Protocol — pick a path, name your watchman, check in nightly, and let the silence be heard.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { invite?: string; name?: string } => ({
    invite: typeof s.invite === "string" && s.invite ? s.invite.slice(0, 200) : undefined,
    name: typeof s.name === "string" && s.name ? s.name.slice(0, 60) : undefined,
  }),
  component: Demo,
});

type Role = "user" | "watchman";

const ROLE_META: Record<
  Role,
  { label: string; icon: React.ElementType; chipBg: string; frameBorder: string; titleBarBg: string }
> = {
  user:     { label: "User",     icon: User,  chipBg: "bg-[#c9a84c] text-black", frameBorder: "border-[#c9a84c]/40", titleBarBg: "bg-[#c9a84c]/10" },
  watchman: { label: "Watchman", icon: Users, chipBg: "bg-[#8a6f2e] text-white", frameBorder: "border-[#8a6f2e]",    titleBarBg: "bg-[#8a6f2e]/30" },
};

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Tone = "muted" | "primary" | "accent" | "danger";
function Pill({ label, tone = "muted" }: { label: string; tone?: Tone }) {
  const tones: Record<Tone, string> = {
    muted: "bg-[#1a1408] text-[#b8b0a4]",
    primary: "bg-[#c9a84c]/15 text-[#c9a84c]",
    accent: "bg-[#8a6f2e]/30 text-[#e6c97a]",
    danger: "bg-red-900/30 text-red-300",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", tones[tone])}>
      {label}
    </span>
  );
}

/* ---------------- Mock screens (mirror the real app) ---------------- */

function MockPathLibrary() {
  const cats = ["Devotion", "Body", "Purity", "Substances", "Speech", "Mind", "Stewardship", "Heart & Action"];
  const items: { title: string; type: "avoid" | "complete"; verse: string }[] = [
    { title: "Pray three times a day", type: "complete", verse: "Daniel 6:10" },
    { title: "Fast", type: "complete", verse: "Matthew 6:17-18" },
    { title: "Read Scripture daily", type: "complete", verse: "Joshua 1:8" },
  ];
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-[#c9a84c]/50 p-2.5" style={{ background: "linear-gradient(135deg, #1a1408 0%, #0a0800 100%)" }}>
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c9a84c]">Your Starter Walk</div>
        <div className="mt-0.5 text-[12px] font-semibold text-white">Your first Path is active</div>
        <div className="text-[10px] text-[#b8b0a4]">A starter discipline is ready on day one. Keep it, edit it, or replace it anytime.</div>
      </div>
      <div className="text-sm font-semibold text-white">Path Library</div>
      <div className="grid grid-cols-4 gap-1.5">
        {cats.map((c, i) => (
          <div key={c} className={cn("rounded-md border px-2 py-1.5 text-center text-[10px] font-semibold", i === 0 ? "border-[#c9a84c] text-[#c9a84c] bg-[#1a1408]" : "border-[#2a2518] text-[#b8b0a4] bg-[#161210]")}>{c}</div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {items.map((p) => (
          <div key={p.title} className="rounded-md border border-[#2a2518] bg-[#161210] p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="text-[12px] font-semibold leading-snug text-white">{p.title}</div>
              <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider" style={{ background: "#102a14", color: "#4ade80" }}>Pursue</span>
            </div>
            <div className="mt-1 text-[10px] italic text-[#9a8b5c]">— {p.verse} (KJV)</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockOnboard() {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-white">New Path</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-white bg-[#1e1a10] px-2.5 py-2 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-white">Pursue</div>
        </div>
        <div className="rounded-md border border-[#222] bg-[#161210] px-2.5 py-2 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#9e968a]">Flee</div>
        </div>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-[#a8a094]">Path</div>
        <div className="text-sm text-white">Fast</div>
      </div>
      <div className="rounded-md border border-[#c9a84c]/40 bg-[#1a1408] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-[#c9a84c]">Notes — your watchman sees this</div>
        <div className="text-[11px] text-white mt-0.5">No fried foods. Liquids only after 6pm.</div>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-[#a8a094]">Support scripture</div>
        <div className="text-[11px] italic text-[#c9a84c] mt-0.5">"When thou fastest, anoint thine head…" — Matt. 6:17</div>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-[#a8a094]">Ends on</div>
        <div className="text-sm text-white">Dec 20, 2026</div>
      </div>
      <button className="w-full rounded-md bg-white py-2 text-sm font-bold text-black">Create Path</button>
    </div>
  );
}

function MockInviteWatchman() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">Watchmen</div>
        <span className="ml-auto text-[10px] text-[#a8a094]">2/2 slots · 1 active, 1 pending</span>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] p-2.5">
        <div className="text-[11px] text-white">Marcus</div>
        <div className="text-[10px] text-[#4ade80]">Active · accepted yesterday</div>
      </div>
      <div className="rounded-md border border-[#3a2f12] bg-[#1a1408] p-3">
        <div className="text-[11px] text-[#c9a84c] mb-2">Invite pending · expires in 47h</div>
        <div className="flex items-center gap-2">
          <input readOnly value="kingdom-protocol.app/invite/x9k…" className="flex-1 truncate rounded border border-[#222] bg-[#0a0800] px-2 py-1.5 text-[10px] text-[#b8b0a4] outline-none" />
          <button className="rounded bg-[#c9a84c] px-2 py-1.5 text-[10px] font-bold text-black">Copy</button>
        </div>
      </div>
      <div className="text-[10px] leading-relaxed text-[#9e968a]">Up to two watchmen per path. Links expire in 48 hours.</div>
    </div>
  );
}

function MockPartnerInvite() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">You've been invited</div>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] p-3">
        <div className="text-[11px] text-[#b8b0a4]">From</div>
        <div className="text-sm text-white">David Jones</div>
        <div className="mt-2 text-[11px] text-[#b8b0a4]">Path</div>
        <div className="text-sm text-white">Fast · ends Dec 20</div>
        <div className="mt-2 text-[11px] text-[#b8b0a4]">Your role</div>
        <div className="text-sm text-[#c9a84c]">Watchman — pinged on a Breach, or after two Silent days running. Quiet means they're walking well.</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="rounded-md border border-[#2a2518] py-2 text-xs font-semibold text-[#b8b0a4]">Decline</button>
        <button className="rounded-md bg-[#c9a84c] py-2 text-xs font-bold text-black">Accept</button>
      </div>
    </div>
  );
}

function MockCheckin() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Moon className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">Check-In</div>
        <span className="ml-auto"><Pill label="Today" tone="primary" /></span>
      </div>

      <div className="text-[10px] font-bold uppercase tracking-wider text-[#a8a094]">Pursue</div>
      <div className="flex items-center gap-3 rounded-xl border border-[#166534] px-3 py-3" style={{ background: "linear-gradient(135deg, #052e16 0%, #031a0d 100%)" }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4ade80] text-[10px] font-bold text-black">✓</span>
        <span className="flex-1 text-sm text-[#4ade80]">Daily Scripture</span>
        <span className="text-[10px] text-[#a8a094] underline">Undo</span>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-[#2a2518] bg-[#161210] px-3 py-3">
        <span className="h-5 w-5 rounded-full border-2 border-[#333]" />
        <span className="flex-1 text-sm text-white">Fast</span>
        <span className="text-[10px] text-[#c9a84c]">Sabbath</span>
      </div>

      <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#a8a094]">Flee</div>
      <div className="rounded-xl border border-[#2a2518] bg-[#161210] p-3">
        <div className="mb-2 text-sm font-semibold text-white">No lustful looking</div>
        <div className="mb-2 text-[11px] text-[#a8a094]">Did you avoid this today?</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-lg border border-[#4ade80] py-2 text-xs font-semibold text-[#4ade80]" style={{ background: "#052e16" }}>Yes — held</button>
          <button className="rounded-lg border border-[#222] py-2 text-xs font-semibold text-[#a8a094]">No — breach</button>
        </div>
      </div>
    </div>
  );
}

function MockBreachConfess() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Flag className="h-4 w-4 text-red-400" />
        <div className="text-sm font-semibold text-white">Breach — be honest</div>
      </div>
      <div className="rounded-xl border border-[#2a2518] bg-[#161210] p-3">
        <div className="text-sm font-semibold text-white">No lustful looking</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button className="rounded-lg border border-[#222] py-2 text-xs font-semibold text-[#a8a094]">Yes — held</button>
          <button className="rounded-lg border border-[#f87171] py-2 text-xs font-semibold text-[#f87171]" style={{ background: "#2d0d0d" }}>No — breach</button>
        </div>
        <textarea
          rows={2}
          readOnly
          defaultValue="Scrolled too long. Caught it, closed the phone, prayed."
          className="mt-3 w-full resize-none rounded-lg border border-[#222] bg-[#161210] p-2.5 text-xs text-white outline-none"
        />
        <button className="mt-2 w-full rounded-lg py-2 text-sm font-semibold text-white" style={{ background: "#7f1d1d" }}>Submit — Breach</button>
      </div>
      <div className="text-[10px] italic text-[#a8a094]">Confess your faults one to another. — James 5:16</div>
    </div>
  );
}

function MockMissedNudge() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">Nudge — yesterday is still open</div>
      </div>
      <div className="rounded-md border border-[#3a2f12] bg-[#1a1408] p-3 text-xs text-[#c9a84c]">
        Your fast went un-checked. Your watchman hasn't been pinged yet — own it before the day closes Silent.
      </div>
      <div className="rounded-xl border border-[#f59e0b]/40 bg-[#0d0a04] p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">Yesterday · not checked in</div>
        <div className="mt-2 text-sm font-semibold text-white">Fast</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button className="rounded-lg border border-[#222] py-2 text-xs font-semibold text-[#a8a094]">Held</button>
          <button className="rounded-lg border border-[#222] py-2 text-xs font-semibold text-[#a8a094]">Breach</button>
        </div>
      </div>
    </div>
  );
}

function MockWatchmanPing() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-red-400" />
        <div className="text-sm font-semibold text-white">Watchman alert</div>
        <span className="ml-auto"><Pill label="just now" tone="danger" /></span>
      </div>
      <div className="rounded-md border border-red-900/40 bg-red-950/30 p-3">
        <div className="text-xs font-semibold text-red-200">David went silent on his fast.</div>
        <div className="mt-1 text-[11px] text-red-300/70">Silent two nights running. Silence is a signal — reach out.</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a className="rounded-md bg-white py-2 text-center text-xs font-bold text-black">Call</a>
        <a className="rounded-md py-2 text-center text-xs font-bold text-white" style={{ background: "#1a1a1a", border: "1px solid #222" }}>Text</a>
      </div>
      <div className="text-[10px] italic text-[#a8a094]">A brother is born for adversity. — Prov. 17:17</div>
    </div>
  );
}

function MockPartnerView() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">Your Assignments</div>
      </div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-[#f87171]">Needs you (1)</div>
      <div className="rounded-md border border-red-900/40 bg-red-950/20 p-2.5">
        <div className="text-[11px] font-semibold text-white">David · Fast</div>
        <div className="text-[10px] text-red-300/80">Breach today — "Broke the fast at lunch. Owning it."</div>
      </div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-[#4ade80]">Walking well (1)</div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] px-2.5 py-2 text-[11px] text-white">Marcus · Pray three times</div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-[#948d80]">Resting (1)</div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] px-2.5 py-2 text-[11px] text-[#948d80]">James · No drunkenness — alerts paused</div>
      <div className="rounded-md border border-[#2a2518] bg-[#0d0b06] p-2.5 space-y-1.5">
        <div className="text-[9px] uppercase tracking-wider text-[#a8a094]">Alert history · David</div>
        {[["Breach", "Sep 20", "#f87171"], ["Silent 4 days", "Sep 12 – Sep 15", "#f59e0b"], ["Breach", "Sep 3", "#f87171"]].map(([l, d, c]) => (
          <div key={l + d} className="flex justify-between text-[10px]">
            <span className="flex items-center gap-1.5" style={{ color: c }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />{l}</span>
            <span className="text-[#948d80]">{d}</span>
          </div>
        ))}
        <div className="text-[10px] text-[#c9a84c]">Show 2 earlier</div>
      </div>
    </div>
  );
}

function MockEncourage() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">Send encouragement</div>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] p-3">
        <textarea
          rows={3}
          readOnly
          defaultValue="Saw the miss. Tomorrow's a new mercy — Lamentations 3:22-23. I'm praying for you tonight."
          className="w-full resize-none rounded-md border border-[#222] bg-[#0d0a04] p-2 text-xs text-white outline-none"
        />
      </div>
      <button className="flex w-full items-center justify-center gap-2 rounded-md bg-[#c9a84c] py-2 text-sm font-bold text-black">
        <Send className="h-3.5 w-3.5" /> Send to David
      </button>
    </div>
  );
}

function MockStreak() {
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5"><Pill label="Pursue" tone="primary" /><Pill label="Active" /></div>
      <div className="text-base font-bold text-white">Fast</div>
      <div className="text-[11px] text-[#b8b0a4]">No fried foods. Liquids only after 6pm.</div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] p-2.5">
        <div className="text-[9px] uppercase tracking-wider text-[#a8a094]">Guiding Scripture</div>
        <p className="mt-1 text-[11px] italic text-[#c9a84c]">"When thou fastest, anoint thine head, and wash thy face." — Matt. 6:17</p>
      </div>
      <div className="rounded-xl border border-[#c9a84c]/30 bg-[#1a1408] p-3 text-center">
        <div className="flex items-baseline justify-center gap-4">
          <div><div className="text-3xl font-extrabold text-white">26</div><div className="text-[9px] uppercase tracking-wider text-[#4ade80]">Standing</div></div>
          <div><div className="text-2xl font-bold text-[#f87171]">2</div><div className="text-[9px] uppercase tracking-wider text-[#f87171]">Fallen</div></div>
        </div>
        <p className="mt-2 text-[11px] italic text-[#c9a84c] leading-snug">"For a just man falleth seven times, and riseth up again."</p>
        <p className="text-[9px] uppercase tracking-wider text-[#c2af80] mt-0.5">Proverbs 24:16 · KJV</p>
      </div>
      <div className="grid grid-cols-14 gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="h-3 rounded-sm" style={{ background: i === 6 ? "rgba(248,113,113,0.6)" : i === 9 ? "rgba(201,168,76,0.7)" : "rgba(74,222,128,0.55)" }} />
        ))}
      </div>
      <div className="text-[10px] text-[#c9a84c]">Show full history →</div>
    </div>
  );
}

function MockPathComplete() {
  return (
    <div className="space-y-3 text-center">
      <Trophy className="mx-auto h-9 w-9 text-[#c9a84c]" />
      <div className="text-lg font-bold text-white">Fast complete</div>
      <div className="text-xs text-[#b8b0a4]">21 days · Nov 29 → Dec 20</div>
      <div className="rounded-md border border-[#166534] p-3" style={{ background: "linear-gradient(135deg, #052e16 0%, #031a0d 100%)" }}>
        <div className="text-[11px] text-[#4ade80]">End date reached. Archive it yourself when you're ready to close it out.</div>
      </div>
      <div className="text-[11px] italic text-[#b8b0a4]">"Is not this the fast that I have chosen?" — Isa 58:6</div>
    </div>
  );
}

/* ---------------- Scenes ---------------- */

type Scene = {
  id: string;
  step: number;
  role: Role;
  title: string;
  body: string;
  why: string;
  render: React.FC;
  divider?: string;
};

const SCENES: Scene[] = [
  {
    id: "library",
    step: 1,
    role: "user",
    title: "Start walking on day one",
    body: "You sign in to a starter Path that's already active, so day one begins with something to hold. Add more from eight categories, each backed by scripture and labeled Flee or Pursue.",
    why: "Why it matters: vague accountability fails. A named path with a verse behind it is something you can actually walk.",
    render: MockPathLibrary,
  },
  {
    id: "configure",
    step: 2,
    role: "user",
    title: "Name it. Set a finish line if it has one.",
    body: "Pick the type, prefill the scripture, set an Ends-on date for fasts and time-bound paths. Ongoing paths leave it blank.",
    why: "Why it matters: a fast without a finish line drifts. A path with one ends honorably.",
    render: MockOnboard,
  },
  {
    id: "invite",
    step: 3,
    role: "user",
    title: "Invite your watchman",
    body: "One private invite link. Copy it, send by text or DM — no email forms, no group chats. A path carries up to two watchmen — invite a second while the first is already watching.",
    why: "Why it matters: one voice can be ignored. Two who love you can't.",
    render: MockInviteWatchman,
    divider: "Your watchman",
  },
  {
    id: "accept",
    step: 4,
    role: "watchman",
    title: "Your watchman accepts",
    body: "They tap the link and see exactly what they're signing up for: which path, what cadence, what they'll be shown. No mystery.",
    why: "Why it matters: a watchman who knows the deal stays the watchman. Surprises burn relationships.",
    render: MockPartnerInvite,
    divider: "Each night",
  },
  {
    id: "checkin",
    step: 5,
    role: "user",
    title: "Check in — today, or catch up yesterday",
    body: "Pursue paths tap to hold. Flee paths choose Held or Breach. Missed last night? Yesterday's row is right there. Tapped the wrong one? Undo sits inline for 30 minutes.",
    why: "Why it matters: most paths don't fall to one big choice. They fall to small unspoken nights.",
    render: MockCheckin,
  },
  {
    id: "breach",
    step: 6,
    role: "user",
    title: "Stumbled? Confess it honestly.",
    body: "Pick breach, write one line. It goes straight to your watchman. The friction is the point.",
    why: "Why it matters: confession in the light beats covering in the dark. The system makes the light the easy path.",
    render: MockBreachConfess,
  },
  {
    id: "nudge",
    step: 7,
    role: "user",
    title: "Miss a night — get a private nudge first",
    body: "Silence isn't a hiding place. You're nudged privately first, with a chance to own yesterday before it closes as Silent.",
    why: "Why it matters: life happens. You get the first chance to tell the truth yourself.",
    render: MockMissedNudge,
  },
  {
    id: "ping",
    step: 8,
    role: "watchman",
    title: "Breach or two silent days — your watchman is pinged",
    body: "A breach pings your watchman right away. Silence is different: day one is your private nudge. Only after two days pass Silent is your watchman alerted, with one-tap call or text. Silent days count as Fallen.",
    why: "Why it matters: the worst nights are usually the silent ones. Silence has to mean something.",
    render: MockWatchmanPing,
  },
  {
    id: "watchman-view",
    step: 9,
    role: "watchman",
    title: "One Watch page — who needs you, who's walking well",
    body: "Assignments sort into Needs you, Walking well, and Resting. Alert history collapses into short events, three at a time — never an endless list.",
    why: "Why it matters: the watchman role finally has a screen. Equipped to help, not guess.",
    render: MockPartnerView,
  },
  {
    id: "encourage",
    step: 10,
    role: "watchman",
    title: "Send a word in season",
    body: "One field. Speak life. The system never writes for them — every word comes from a real person.",
    why: "Why it matters: encouragement that's written by a friend lands. Auto-affirmations don't.",
    render: MockEncourage,
    divider: "Over time",
  },
  {
    id: "streak",
    step: 11,
    role: "user",
    title: "Days standing, days fallen — both counted honestly",
    body: "A breach doesn't reset you to zero. Days held stack visibly. Days fallen are logged honestly beside them. The just man falleth seven times and riseth up again — the number reminds you you're still rising.",
    why: "Why it matters: a fake reset breeds shame. An honest ledger breeds repentance and resolve.",
    render: MockStreak,
  },
  {
    id: "complete",
    step: 12,
    role: "user",
    title: "Time-bound paths have a finish line",
    body: "The Ends-on date is your finish line — it shows on the path so you and your watchman both see it coming. When it lands, you close the path out yourself.",
    why: "Why it matters: a fast without a visible end drifts. A dated path ends as a vow kept.",
    render: MockPathComplete,
  },
];

/* ---------------- Page ---------------- */

function Demo() {
  const { invite, name } = Route.useSearch();
  const first = (name || "your brother").split(" ")[0];
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0800" }}>
      <header className="sticky top-0 z-30 border-b border-[#2a2518]/60 backdrop-blur" style={{ background: "rgba(10,8,0,0.8)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Wordmark size="sm" />
          {invite ? (
            <Link to="/invite/$token" params={{ token: invite }} className="inline-flex items-center gap-2 rounded-md bg-[#c9a84c] px-3 py-1.5 text-xs font-bold text-black">
              <ArrowLeft className="h-4 w-4" /> Return to invite
            </Link>
          ) : (
          <Link to="/" className="inline-flex items-center gap-2 rounded-md border border-[#2a2518] px-3 py-1.5 text-xs font-semibold text-[#c9a84c]">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          )}
        </div>
        {invite && (
          <div className="border-t border-[#c9a84c]/25 bg-[#c9a84c]/10 px-6 py-2 text-center text-xs text-[#e8dfc4]">
            Viewing the demo for <span className="font-semibold text-[#f3d27a]">{first}</span>'s Watchman invite
          </div>
        )}
      </header>

      <section className="border-b border-[#2a2518]/60 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center top, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.06) 45%, transparent 72%)" }} />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20 relative">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            One path. <span className="text-[#c9a84c]">Two people.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#c8c0b4] md:text-lg">
            Twelve scenes following one believer's path and the watchman who walks it with them. Every screen below is what you'll actually see in the app once you've created an account.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs">
            {(["user", "watchman"] as Role[]).map((r) => {
              const m = ROLE_META[r];
              return (
                <span key={r} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold", m.chipBg)}>
                  <m.icon className="h-3 w-3" /> {m.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-12 px-6 py-12 md:space-y-16 md:py-16">
        {SCENES.map((scene) => {
          const meta = ROLE_META[scene.role];
          const Mock = scene.render;
          return (
            <React.Fragment key={scene.id}>
              <article className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", meta.chipBg)}>
                      <meta.icon className="h-3 w-3" /> {meta.label}
                    </span>
                    <span className="font-mono text-[11px] text-[#a8a094]">
                      Step {scene.step} / {SCENES.length}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">{scene.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#c8c0b4] md:text-base">{scene.body}</p>
                  <p className="mt-3 text-xs italic leading-relaxed text-[#c9a84c]/90 md:text-sm">{scene.why}</p>
                </div>
                <div>
                  <div className={cn("overflow-hidden rounded-xl border-2 shadow-[0_10px_40px_-12px_rgba(201,168,76,0.25)]", meta.frameBorder)} style={{ background: "#0d0a04" }}>
                    <div className={cn("flex items-center gap-2 border-b border-[#2a2518] px-3 py-1.5", meta.titleBarBg)}>
                      <span className="h-2 w-2 rounded-full bg-red-500/40" />
                      <span className="h-2 w-2 rounded-full bg-[#c9a84c]/60" />
                      <span className="h-2 w-2 rounded-full bg-[#666]/40" />
                      <span className="ml-1 font-mono text-[10px] text-[#a8a094]">kingdom-protocol.app</span>
                    </div>
                    <div className="p-5">
                      <Mock />
                    </div>
                  </div>
                </div>
              </article>
              {scene.divider && (
                <div className="flex items-center gap-3 pt-4 text-xs uppercase tracking-wider text-[#a8a094]">
                  <div className="h-px flex-1 bg-[#2a2518]" />
                  <span>{scene.divider}</span>
                  <div className="h-px flex-1 bg-[#2a2518]" />
                </div>
              )}
            </React.Fragment>
          );
        })}

        <div className="border-t border-[#2a2518] pt-10 text-center">
          <Footprints className="mx-auto h-10 w-10 text-[#c9a84c]" />
          {invite ? (
            <>
              <h2 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">Ready to stand watch with {first}?</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-[#c8c0b4]">
                You've seen how simple it is. No daily homework, free forever.
              </p>
              <div className="mt-6 flex justify-center">
                <Link to="/invite/$token" params={{ token: invite }} className="inline-flex items-center gap-2 rounded-md bg-[#c9a84c] px-6 py-3.5 text-base font-bold text-black">
                  Accept — Stand Watch with {first} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </>
          ) : (
            <>
          <h2 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">Ready to walk it out?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#c8c0b4]">
            Pick your path. Pick your watchman. Show up tonight.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/" className="rounded-md border border-[#2a2518] px-5 py-2.5 text-sm font-semibold text-[#c9a84c]">
              Back to overview
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-[#c9a84c] px-5 py-2.5 text-sm font-bold text-black">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
            </>
          )}
          <div className="mx-auto mt-10 max-w-xl rounded-xl border border-[#c9a84c]/25 bg-[#0f0c05] p-6">
            <p className="italic text-[#c9a84c] text-sm sm:text-base leading-relaxed">
              "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend."
            </p>
            <p className="mt-3 text-white text-[0.65rem] tracking-[0.18em] uppercase">Proverbs 27:17 · KJV</p>
          </div>
        </div>
      </main>
    </div>
  );
}
