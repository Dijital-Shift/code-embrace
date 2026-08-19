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
      {
        name: "description",
        content:
          "End-to-end walkthrough of Kingdom Protocol — pick a path, name your watchman, check in nightly, and let the silence be heard.",
      },
    ],
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
    muted: "bg-[#1a1408] text-[#888]",
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
  const items: { title: string; type: "avoid" | "complete"; verse: string }[] = [
    { title: "Pray three times a day", type: "complete", verse: "Daniel 6:10" },
    { title: "Fast", type: "complete", verse: "Matthew 6:17-18" },
    { title: "No pornography / lustful looking", type: "avoid", verse: "Job 31:1" },
    { title: "No drunkenness", type: "avoid", verse: "Eph. 5:18" },
    { title: "Forgive quickly — no sundown anger", type: "complete", verse: "Eph. 4:26" },
    { title: "No corrupt speech", type: "avoid", verse: "Eph. 4:29" },
  ];
  return (
    <div className="space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9a84c]">Devotion · Purity · Speech</div>
      <div className="text-sm font-semibold text-white">Path Library</div>
      <div className="text-[11px] text-[#888]">Scripture-backed paths. Tap one to start.</div>
      <div className="grid grid-cols-1 gap-2">
        {items.map((p) => {
          const isAvoid = p.type === "avoid";
          return (
            <div key={p.title} className="rounded-md border border-[#2a2518] bg-[#161210] p-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="text-[12px] font-semibold leading-snug text-white">{p.title}</div>
                <span
                  className="shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider"
                  style={{ background: isAvoid ? "#2a1410" : "#102a14", color: isAvoid ? "#f87171" : "#4ade80" }}
                >
                  {isAvoid ? "Avoid" : "Complete"}
                </span>
              </div>
              <div className="mt-1 text-[10px] italic text-[#9a8b5c]">— {p.verse} (KJV)</div>
            </div>
          );
        })}
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
          <div className="text-[10px] font-bold uppercase tracking-wider text-white">Complete</div>
        </div>
        <div className="rounded-md border border-[#222] bg-[#161210] px-2.5 py-2 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#555]">Avoid</div>
        </div>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-[#666]">Path</div>
        <div className="text-sm text-white">Fast</div>
      </div>
      <div className="rounded-md border border-[#c9a84c]/40 bg-[#1a1408] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-[#c9a84c]">Notes — your watchman sees this</div>
        <div className="text-[11px] text-white mt-0.5">No fried foods. Liquids only after 6pm.</div>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-[#666]">Support scripture</div>
        <div className="text-[11px] italic text-[#c9a84c] mt-0.5">"When thou fastest, anoint thine head…" — Matt. 6:17</div>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-[#666]">Ends on</div>
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
        <span className="ml-auto text-[10px] text-[#666]">1/2</span>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] p-2.5">
        <div className="text-[11px] text-white">marcus@example.com</div>
        <div className="text-[10px] text-[#4ade80]">Active · accepted yesterday</div>
      </div>
      <div className="rounded-md border border-[#3a2f12] bg-[#1a1408] p-3">
        <div className="text-[11px] text-[#c9a84c] mb-2">Second invite pending · expires in 47h</div>
        <div className="flex items-center gap-2">
          <input readOnly value="kingdom-protocol.app/invite/x9k…" className="flex-1 truncate rounded border border-[#222] bg-[#0a0800] px-2 py-1.5 text-[10px] text-[#888] outline-none" />
          <button className="rounded bg-[#c9a84c] px-2 py-1.5 text-[10px] font-bold text-black">Copy</button>
        </div>
      </div>
      <div className="text-[10px] leading-relaxed text-[#555]">Up to two watchmen per path. In the mouth of two witnesses (Matt. 18:16). Links expire in 48 hours.</div>
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
        <div className="text-[11px] text-[#888]">From</div>
        <div className="text-sm text-white">David Jones</div>
        <div className="mt-2 text-[11px] text-[#888]">Path</div>
        <div className="text-sm text-white">Fast · ends Dec 20</div>
        <div className="mt-2 text-[11px] text-[#888]">Your role</div>
        <div className="text-sm text-[#c9a84c]">Watchman — pinged when they miss or break the fast.</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="rounded-md border border-[#2a2518] py-2 text-xs font-semibold text-[#888]">Decline</button>
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
        <span className="ml-auto"><Pill label="Tonight" tone="primary" /></span>
      </div>

      <div className="text-[10px] font-bold uppercase tracking-wider text-[#666]">Complete</div>
      <div className="flex items-center gap-3 rounded-xl border border-[#166534] px-3 py-3" style={{ background: "linear-gradient(135deg, #052e16 0%, #031a0d 100%)" }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4ade80] text-[10px] font-bold text-black">✓</span>
        <span className="flex-1 text-sm text-[#4ade80]">Pray three times</span>
        <span className="text-[10px] text-[#4ade80]">Held</span>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-[#2a2518] bg-[#161210] px-3 py-3">
        <span className="h-5 w-5 rounded-full border-2 border-[#333]" />
        <span className="flex-1 text-sm text-white">Fast</span>
      </div>

      <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#666]">Avoid</div>
      <div className="rounded-xl border border-[#2a2518] bg-[#161210] p-3">
        <div className="mb-2 text-sm font-semibold text-white">No lustful looking</div>
        <div className="mb-2 text-[11px] text-[#666]">Did you avoid this today?</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-lg border border-[#4ade80] py-2 text-xs font-semibold text-[#4ade80]" style={{ background: "#052e16" }}>Yes — held</button>
          <button className="rounded-lg border border-[#222] py-2 text-xs font-semibold text-[#666]">No — breach</button>
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
          <button className="rounded-lg border border-[#222] py-2 text-xs font-semibold text-[#666]">Yes — held</button>
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
      <div className="text-[10px] italic text-[#666]">Confess your faults one to another. — James 5:16</div>
    </div>
  );
}

function MockMissedNudge() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">Nudge — you missed last night</div>
      </div>
      <div className="rounded-md border border-[#3a2f12] bg-[#1a1408] p-3 text-xs text-[#c9a84c]">
        Your fast went un-checked. Your watchman hasn't been pinged yet — submit before morning.
      </div>
      <div className="rounded-xl border border-[#f59e0b]/40 bg-[#0d0a04] p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">Silent yesterday · submit before 10AM</div>
        <div className="mt-2 text-sm font-semibold text-white">Fast</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button className="rounded-lg border border-[#222] py-2 text-xs font-semibold text-[#666]">Held</button>
          <button className="rounded-lg border border-[#222] py-2 text-xs font-semibold text-[#666]">Breach</button>
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
      <div className="text-[10px] italic text-[#666]">A brother is born for adversity. — Prov. 17:17</div>
    </div>
  );
}

function MockPartnerView() {
  const days = [
    { d: "Mon", state: "clean" },
    { d: "Tue", state: "clean" },
    { d: "Wed", state: "stumble" },
    { d: "Thu", state: "clean" },
    { d: "Fri", state: "clean" },
    { d: "Sat", state: "clean" },
    { d: "Sun", state: "missed" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">David — Fast · past 7 days</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((x) => (
          <div key={x.d} className="text-center">
            <div
              className={cn(
                "mx-auto h-8 w-8 rounded-md border",
                x.state === "clean" && "border-[#c9a84c]/50 bg-[#c9a84c]/15",
                x.state === "stumble" && "border-[#8a6f2e] bg-[#8a6f2e]/30",
                x.state === "missed" && "border-red-900/60 bg-red-950/40",
              )}
            />
            <div className="mt-1 text-[9px] uppercase tracking-wider text-[#666]">{x.d}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] p-3">
        <div className="text-[10px] uppercase tracking-wider text-[#666]">Breach note · Wed</div>
        <div className="mt-1 text-xs text-white">"Broke the fast at lunch — was at a work thing. Owning it."</div>
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
    <div className="space-y-3 text-center">
      <Target className="mx-auto h-8 w-8 text-[#c9a84c]" />
      <div className="flex items-baseline justify-center gap-3">
        <div>
          <div className="text-3xl font-extrabold text-white">26</div>
          <div className="text-[9px] uppercase tracking-wider text-[#4ade80]">Standing</div>
        </div>
        <div className="text-[#444] text-xl">·</div>
        <div>
          <div className="text-2xl font-bold text-[#f87171]">2</div>
          <div className="text-[9px] uppercase tracking-wider text-[#f87171]">Fallen</div>
        </div>
      </div>
      <div className="text-[11px] uppercase tracking-wider text-[#888]">Fast · no fried foods</div>
      <div className="text-[10px] text-[#aa9560]">26 standing · 2 fallen — still rising.</div>
      <div className="mx-auto grid max-w-[260px] grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => {
          const fell = i === 6 || i === 18;
          return (
            <div
              key={i}
              className="h-3 w-3 rounded-sm"
              style={{ background: fell ? "rgba(248,113,113,0.6)" : "rgba(201,168,76,0.7)" }}
            />
          );
        })}
      </div>
      <div className="rounded-md border border-[#c9a84c]/30 bg-[#1a1408] p-2.5 text-left">
        <p className="text-[11px] italic text-[#c9a84c] leading-snug">
          "For a just man falleth seven times, and riseth up again."
        </p>
        <p className="text-[9px] uppercase tracking-wider text-[#aa9560] mt-1">Proverbs 24:16 · KJV</p>
      </div>
    </div>
  );
}

function MockPathComplete() {
  return (
    <div className="space-y-3 text-center">
      <Trophy className="mx-auto h-9 w-9 text-[#c9a84c]" />
      <div className="text-lg font-bold text-white">Fast complete</div>
      <div className="text-xs text-[#888]">21 days · Nov 29 → Dec 20</div>
      <div className="rounded-md border border-[#166534] p-3" style={{ background: "linear-gradient(135deg, #052e16 0%, #031a0d 100%)" }}>
        <div className="text-[11px] text-[#4ade80]">Auto-archived. Watchman notified — path completed honorably.</div>
      </div>
      <div className="text-[11px] italic text-[#888]">"Is not this the fast that I have chosen?" — Isa 58:6</div>
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
    title: "Pick a path — straight from the Word",
    body: "Open the library. Every path is scripture-backed and labeled Avoid or Complete. Build your own too — but start with what He already commanded.",
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
    title: "Invite up to two watchmen",
    body: "One private invite link per watchman. Copy it, send by text or DM — no email forms, no group chats. Up to two watchmen per path, because in the mouth of two witnesses every word is established (Matt. 18:16).",
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
    title: "Nightly check-in — one screen, two columns",
    body: "Complete paths tap to hold. Avoid paths choose Held or Breach. The whole thing takes under thirty seconds.",
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
    title: "Miss one night — get a nudge",
    body: "Silence isn't a hiding place. You get a private nudge first thing, with a chance to submit yesterday before 10AM.",
    why: "Why it matters: life happens. One missed night shouldn't drag in a watchman if you can still own it.",
    render: MockMissedNudge,
  },
  {
    id: "ping",
    step: 8,
    role: "watchman",
    title: "Stay silent — your watchman is pinged",
    body: "Breach or two-night silence, your watchman gets a push with one-tap call or text. They show up before the fall, not after.",
    why: "Why it matters: the worst nights are usually the silent ones. Silence has to mean something.",
    render: MockWatchmanPing,
  },
  {
    id: "watchman-view",
    step: 9,
    role: "watchman",
    title: "Watchman sees the week, not your soul",
    body: "Seven dots — aligned, breach, missed. Your breach notes if you wrote them.",
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
    title: "Time-bound paths finish honorably",
    body: "When the Ends-on date hits, the path auto-archives. Your watchman gets a one-time completion ping — not a missed nudge.",
    why: "Why it matters: a fast that ends well is a vow kept. The system honors the finish line.",
    render: MockPathComplete,
  },
];

/* ---------------- Page ---------------- */

function Demo() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0800" }}>
      <header className="sticky top-0 z-30 border-b border-[#2a2518]/60 backdrop-blur" style={{ background: "rgba(10,8,0,0.8)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Wordmark size="sm" />
          <Link to="/" className="inline-flex items-center gap-2 rounded-md border border-[#2a2518] px-3 py-1.5 text-xs font-semibold text-[#c9a84c]">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <section className="border-b border-[#2a2518]/60 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center top, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.06) 45%, transparent 72%)" }} />
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20 relative">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            One path. <span className="text-[#c9a84c]">Two people.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#aaa] md:text-lg">
            Twelve scenes following one believer's path and the watchman who walks it with them. Every screen below is what you'll actually see in the app.
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
                    <span className="font-mono text-[11px] text-[#666]">
                      Step {scene.step} / {SCENES.length}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">{scene.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#aaa] md:text-base">{scene.body}</p>
                  <p className="mt-3 text-xs italic leading-relaxed text-[#c9a84c]/90 md:text-sm">{scene.why}</p>
                </div>
                <div>
                  <div className={cn("overflow-hidden rounded-xl border-2 shadow-[0_10px_40px_-12px_rgba(201,168,76,0.25)]", meta.frameBorder)} style={{ background: "#0d0a04" }}>
                    <div className={cn("flex items-center gap-2 border-b border-[#2a2518] px-3 py-1.5", meta.titleBarBg)}>
                      <span className="h-2 w-2 rounded-full bg-red-500/40" />
                      <span className="h-2 w-2 rounded-full bg-[#c9a84c]/60" />
                      <span className="h-2 w-2 rounded-full bg-[#666]/40" />
                      <span className="ml-1 font-mono text-[10px] text-[#666]">kingdom-protocol.app</span>
                    </div>
                    <div className="p-5">
                      <Mock />
                    </div>
                  </div>
                </div>
              </article>
              {scene.divider && (
                <div className="flex items-center gap-3 pt-4 text-xs uppercase tracking-wider text-[#666]">
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
          <h2 className="mt-6 text-2xl font-bold tracking-tight md:text-3xl">Ready to walk it out?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#aaa]">
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
