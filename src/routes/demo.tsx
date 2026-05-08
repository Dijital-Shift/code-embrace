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
  Lock,
  Mail,
  Moon,
  Send,
  Shield,
  ShieldCheck,
  Target,
  User,
  Users,
} from "lucide-react";
import logo from "@/assets/kingdom-protocol-logo.png";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Kingdom Protocol demo — every role, every step" },
      {
        name: "description",
        content:
          "End-to-end walkthrough of Kingdom Protocol — from a believer creating a lane through their accountability partner and admin oversight. One protocol, three views.",
      },
    ],
  }),
  component: Demo,
});

type Role = "user" | "partner" | "admin";

const ROLE_META: Record<
  Role,
  { label: string; icon: React.ElementType; chipBg: string; frameBorder: string; titleBarBg: string }
> = {
  user:    { label: "User",    icon: User,        chipBg: "bg-[#c9a84c] text-black",        frameBorder: "border-[#c9a84c]/40", titleBarBg: "bg-[#c9a84c]/10" },
  partner: { label: "Partner", icon: Users,       chipBg: "bg-[#8a6f2e] text-white",        frameBorder: "border-[#8a6f2e]",    titleBarBg: "bg-[#8a6f2e]/30" },
  admin:   { label: "Admin",   icon: ShieldCheck, chipBg: "bg-[#3a2e14] text-[#c9a84c]",    frameBorder: "border-[#c9a84c]/30", titleBarBg: "bg-[#1a1408]" },
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

/* ---------------- Mock screens ---------------- */

function MockOnboard() {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-white">Define your lane</div>
      <div className="text-[11px] text-[#888]">Name the behavior. Set the boundary. Pick a partner.</div>
      <div className="space-y-2">
        <div className="rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-[#666]">Lane</div>
          <div className="text-sm text-white">Purity / no late-night browsing</div>
        </div>
        <div className="rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-[#666]">Bedtime check-in</div>
          <div className="text-sm text-white">10:30 PM · daily</div>
        </div>
        <div className="rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
          <div className="text-[10px] uppercase tracking-wider text-[#666]">Partner</div>
          <div className="text-sm text-white">marcus@example.com</div>
        </div>
      </div>
      <button className="w-full rounded-md bg-[#c9a84c] py-2 text-sm font-bold text-black">Send invite</button>
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
        <div className="text-sm text-white">David Chen</div>
        <div className="mt-2 text-[11px] text-[#888]">Lane</div>
        <div className="text-sm text-white">Purity / no late-night browsing</div>
        <div className="mt-2 text-[11px] text-[#888]">Your role</div>
        <div className="text-sm text-[#c9a84c]">Accountability partner — you'll see check-ins and missed days.</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="rounded-md border border-[#2a2518] py-2 text-xs font-semibold text-[#888]">Decline</button>
        <button className="rounded-md bg-[#c9a84c] py-2 text-xs font-bold text-black">Accept</button>
      </div>
    </div>
  );
}

function MockCheckin() {
  const [pick, setPick] = React.useState<"clean" | "stumbled" | null>("clean");
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Moon className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">Tonight's check-in</div>
        <span className="ml-auto"><Pill label="10:30 PM" tone="primary" /></span>
      </div>
      <div className="text-[11px] text-[#888]">Purity / no late-night browsing — be honest, your partner sees this.</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setPick("clean")}
          className={cn(
            "rounded-md border py-3 text-center transition-colors",
            pick === "clean" ? "border-[#c9a84c] bg-[#c9a84c]/10" : "border-[#2a2518] bg-[#161210]",
          )}
        >
          <CheckCircle2 className="mx-auto h-5 w-5 text-[#c9a84c]" />
          <div className="mt-1 text-xs font-semibold text-white">Clean</div>
        </button>
        <button
          onClick={() => setPick("stumbled")}
          className={cn(
            "rounded-md border py-3 text-center transition-colors",
            pick === "stumbled" ? "border-[#c9a84c] bg-[#c9a84c]/10" : "border-[#2a2518] bg-[#161210]",
          )}
        >
          <Flag className="mx-auto h-5 w-5 text-[#c9a84c]" />
          <div className="mt-1 text-xs font-semibold text-white">Stumbled</div>
        </button>
      </div>
      <textarea
        placeholder="Optional note for your partner…"
        className="w-full rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2 text-xs text-white placeholder-[#555]"
        rows={2}
        defaultValue="Long day. Tempted around 9 but walked instead."
      />
      <button className="w-full rounded-md bg-[#c9a84c] py-2 text-sm font-bold text-black">Submit check-in</button>
    </div>
  );
}

function MockMissed() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-red-400" />
        <div className="text-sm font-semibold text-white">Missed check-in</div>
        <span className="ml-auto"><Pill label="auto" tone="danger" /></span>
      </div>
      <div className="rounded-md border border-red-900/40 bg-red-950/30 p-3 text-xs text-red-200">
        David didn't check in by 10:30 PM. Silence is a signal — reach out.
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] p-3 text-[11px] text-[#888]">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-[#666]">Streak before tonight</div>
        <div className="text-sm text-white">12 days clean</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="rounded-md border border-[#2a2518] py-2 text-xs font-semibold text-[#888]">Snooze 30m</button>
        <button className="rounded-md bg-[#c9a84c] py-2 text-xs font-bold text-black">Text David</button>
      </div>
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
        <div className="text-sm font-semibold text-white">David — past 7 days</div>
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
        <div className="text-[10px] uppercase tracking-wider text-[#666]">Note · Wed</div>
        <div className="mt-1 text-xs text-white">"Stumbled around 9. Walked it off, prayed, slept early."</div>
      </div>
      <button className="w-full rounded-md border border-[#2a2518] py-2 text-xs font-semibold text-[#c9a84c]">Send encouragement</button>
    </div>
  );
}

function MockEscalation() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Send className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">Outbound to partner</div>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] p-3 text-xs text-[#ddd]">
        <div className="text-[10px] uppercase tracking-wider text-[#666]">SMS · push · email</div>
        <div className="mt-2">
          David missed his 10:30 check-in tonight. He had a 12-day clean streak going. Reach out gently.
        </div>
        <div className="mt-2 text-[10px] text-[#666]">Sent 10:45 PM · escalation tier 1</div>
      </div>
      <div className="rounded-md border border-[#2a2518] bg-[#161210] p-3 text-[11px] text-[#888]">
        <div className="flex items-center justify-between">
          <span>Tier 2 if still silent at</span>
          <span className="text-white">11:30 PM</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span>Admin alert if 3 misses / 7 days</span>
          <span className="text-white">on</span>
        </div>
      </div>
    </div>
  );
}

function MockStreak() {
  return (
    <div className="space-y-3 text-center">
      <Target className="mx-auto h-8 w-8 text-[#c9a84c]" />
      <div className="text-3xl font-extrabold text-white">28 days</div>
      <div className="text-[11px] uppercase tracking-wider text-[#888]">Current streak · purity lane</div>
      <div className="mx-auto grid max-w-[260px] grid-cols-7 gap-1">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="h-3 w-3 rounded-sm bg-[#c9a84c]/70" />
        ))}
      </div>
      <div className="text-[11px] italic text-[#888]">"Iron sharpens iron." — Prov 27:17</div>
    </div>
  );
}

function MockAdminOversight() {
  const rows = [
    { user: "David C.", lane: "Purity", state: "Active", streak: "28d", tone: "primary" as Tone },
    { user: "Marcus W.", lane: "Sobriety", state: "Active", streak: "61d", tone: "primary" as Tone },
    { user: "Jonah R.", lane: "Anger", state: "At risk", streak: "0d", tone: "danger" as Tone },
    { user: "Eli T.", lane: "Tongue", state: "Stumble", streak: "3d", tone: "accent" as Tone },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">Cohort oversight</div>
        <span className="ml-auto"><Pill label="this week" tone="primary" /></span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md border border-[#2a2518] bg-[#161210] py-2">
          <div className="text-lg font-bold text-white">42</div>
          <div className="text-[10px] uppercase tracking-wider text-[#666]">Active</div>
        </div>
        <div className="rounded-md border border-[#2a2518] bg-[#161210] py-2">
          <div className="text-lg font-bold text-[#c9a84c]">94%</div>
          <div className="text-[10px] uppercase tracking-wider text-[#666]">Check-in rate</div>
        </div>
        <div className="rounded-md border border-[#2a2518] bg-[#161210] py-2">
          <div className="text-lg font-bold text-red-300">3</div>
          <div className="text-[10px] uppercase tracking-wider text-[#666]">At risk</div>
        </div>
      </div>
      <div className="divide-y divide-[#2a2518] rounded-md border border-[#2a2518]">
        {rows.map((r) => (
          <div key={r.user} className="flex items-center gap-2 px-3 py-2 text-xs">
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold text-white">{r.user}</div>
              <div className="text-[10px] text-[#666]">{r.lane}</div>
            </div>
            <Pill label={r.state} tone={r.tone} />
            <div className="w-12 text-right font-mono text-[11px] text-[#aaa]">{r.streak}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockPrivacy() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-[#c9a84c]" />
        <div className="text-sm font-semibold text-white">Who sees what</div>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2 rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
          <User className="h-4 w-4 text-[#c9a84c]" />
          <div className="flex-1 text-white">You</div>
          <div className="text-[#888]">All of it</div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
          <Users className="h-4 w-4 text-[#8a6f2e]" />
          <div className="flex-1 text-white">Partner</div>
          <div className="text-[#888]">Check-ins + notes you choose to share</div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-[#2a2518] bg-[#161210] px-3 py-2">
          <ShieldCheck className="h-4 w-4 text-[#c9a84c]" />
          <div className="flex-1 text-white">Admin</div>
          <div className="text-[#888]">Counts &amp; risk only — never note contents</div>
        </div>
      </div>
      <div className="text-center text-[11px] italic text-[#888]">
        Confession is a gift, not a leak. Notes belong to you and the partner you chose.
      </div>
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
    id: "lane",
    step: 1,
    role: "user",
    title: "You name the lane",
    body: "Pick the behavior you want to stay clean in. Set the bedtime check-in window. Choose one trusted partner — not a group, not a pastor's inbox, one person who will actually answer.",
    why: "Why it matters: vague accountability fails. A named lane with a named partner and a named hour is something you can actually live up to.",
    render: MockOnboard,
  },
  {
    id: "invite",
    step: 2,
    role: "partner",
    title: "Your partner accepts",
    body: "They get a single email. They see exactly what they're signing up for: which lane, what cadence, what they'll be shown. No mystery, no group chat.",
    why: "Why it matters: a partner who knows the deal stays the partner. Surprises burn relationships.",
    render: MockPartnerInvite,
    divider: "Each night",
  },
  {
    id: "checkin",
    step: 3,
    role: "user",
    title: "Nightly check-in — clean or stumbled",
    body: "Two buttons. Optional note. Submitted to your partner before bed. The friction is the point — every night, you tell the truth out loud.",
    why: "Why it matters: most lanes don't fall to a single big choice. They fall to small unspoken nights. Saying it kills the secrecy.",
    render: MockCheckin,
  },
  {
    id: "missed",
    step: 4,
    role: "user",
    title: "If you go silent, it notices",
    body: "Miss the window and Kingdom Protocol marks it missed. You get one nudge. Your partner gets pinged. Avoidance is a status, not a hiding place.",
    why: "Why it matters: the worst nights are usually the silent ones. Silence has to mean something.",
    render: MockMissed,
  },
  {
    id: "partner-view",
    step: 5,
    role: "partner",
    title: "Partner sees the week, not your soul",
    body: "Seven dots — clean, stumble, missed. Your notes if you shared them. They're equipped to actually help, not guess.",
    why: "Why it matters: the partner role finally has a dashboard. They show up Wednesday morning with the right question.",
    render: MockPartnerView,
  },
  {
    id: "escalation",
    step: 6,
    role: "partner",
    title: "Escalation is gentle and automatic",
    body: "Partner is reached by SMS, push, or email when you miss. Tier two if still silent. Admin only on a pattern. No one is panicked, no one is forgotten.",
    why: "Why it matters: humans drop the ball. The protocol doesn't.",
    render: MockEscalation,
    divider: "Over time",
  },
  {
    id: "streak",
    step: 7,
    role: "user",
    title: "Streaks you actually earn",
    body: "Days clean stack visibly. Stumbles don't reset you — they get logged honestly. The number is yours, not a gamified lie.",
    why: "Why it matters: a true streak is fuel. A fake streak is shame waiting to happen.",
    render: MockStreak,
  },
  {
    id: "oversight",
    step: 8,
    role: "admin",
    title: "Admin sees the cohort, not the confession",
    body: "Pastor, men's group lead, or program admin sees who is active, check-in rate, and who is at risk. Never note contents. Never the words.",
    why: "Why it matters: leaders need signal to shepherd, not surveillance to judge. The platform draws that line for them.",
    render: MockAdminOversight,
  },
  {
    id: "privacy",
    step: 9,
    role: "admin",
    title: "Who sees what — stated, not buried",
    body: "Three roles. Three permission tiers. Written on the wall of the app, not in a 14-page policy.",
    why: "Why it matters: trust is the whole product. If the privacy model isn't obvious, no one tells the truth.",
    render: MockPrivacy,
  },
];

/* ---------------- Page ---------------- */

function Demo() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0800" }}>
      <header className="sticky top-0 z-30 border-b border-[#2a2518]/60 backdrop-blur" style={{ background: "rgba(10,8,0,0.8)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Kingdom Protocol" className="h-8 w-8 object-contain" />
            <span className="font-semibold tracking-tight">Kingdom Protocol</span>
          </Link>
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
            One protocol. <span className="text-[#c9a84c]">Three views.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#aaa] md:text-lg">
            Nine scenes following one believer's lane through their accountability partner and the admin who shepherds the cohort.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs">
            {(["user", "partner", "admin"] as Role[]).map((r) => {
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
                      <span className="ml-1 font-mono text-[10px] text-[#666]">kingdom-protocol.lovable.app</span>
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
            Pick your lane. Pick your partner. Show up tonight.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/" className="rounded-md border border-[#2a2518] px-5 py-2.5 text-sm font-semibold text-[#c9a84c]">
              Back to overview
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-[#c9a84c] px-5 py-2.5 text-sm font-bold text-black">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-8 text-[11px] tracking-wider text-[#444]">
            <Clock className="inline h-3 w-3 mr-1" />
            One lane at a time. One night at a time.
          </p>
        </div>
      </main>
    </div>
  );
}
