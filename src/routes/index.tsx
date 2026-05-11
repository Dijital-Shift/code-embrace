import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kingdom Protocol — Behavioral Accountability" },
      { name: "description", content: "You don't fall in public. You fall in the silence. Partner-based accountability with escalation when you go quiet." },
      { property: "og:title", content: "Kingdom Protocol — Behavioral Accountability" },
      { property: "og:description", content: "You don't fall in public. You fall in the silence. Partner-based accountability with escalation when you go quiet." },
      { property: "og:image", content: "/kingdom-protocol-logo.png" },
    ],
  }),
  component: Landing,
});

const GOLD = "#c9a84c";

function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[#1a1610]">
      <Link to="/" className="flex items-center gap-2.5">
        <img src="/kingdom-protocol-logo.png" alt="Kingdom Protocol" className="h-9 w-auto" style={{ filter: "drop-shadow(0 0 10px rgba(201,168,76,0.35))" }} />
        <span className="hidden sm:inline text-[0.95rem] font-bold tracking-wide text-white">Kingdom Protocol</span>
      </Link>
      <Link to="/login" className="text-sm text-[#c9a84c] font-semibold hover:opacity-80">Sign in</Link>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-5 sm:px-8 pt-10 sm:pt-14 pb-16 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] pointer-events-none -z-0"
        style={{ background: "radial-gradient(ellipse at center top, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.06) 45%, transparent 72%)" }} />
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-start">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.05] tracking-tight text-white">
            You don't fall in public.<br />
            <span style={{ color: GOLD }}>You fall in the silence.</span>
          </h1>
          <p className="mt-5 text-[#a8a39a] text-base sm:text-lg leading-relaxed max-w-md">
            Kingdom Protocol turns daily check-ins into a partner-watched signal. Miss the window, and someone who loves you knows before the breach does.
          </p>
          <div className="mt-8 flex gap-2">
            <Link to="/login" className="inline-block px-6 py-3.5 rounded-xl bg-[#c9a84c] text-black font-bold text-[0.95rem]" style={{ boxShadow: "0 0 28px rgba(201,168,76,0.3)" }}>
              Join the waitlist
            </Link>
            <Link to="/demo" className="inline-block px-6 py-3.5 rounded-xl border border-[#c9a84c]/40 text-[#c9a84c] font-semibold text-[0.95rem]">
              See it move
            </Link>
          </div>
          <p className="mt-5 text-xs text-[#555] tracking-wider">v1.0 · shipping May 2026</p>
        </div>
        <div className="min-w-0">
          <HeroMock />
        </div>
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -m-4 rounded-3xl" style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.18), transparent 70%)" }} />
      <div className="relative rounded-2xl border border-[#2a2518] bg-[#100d05] p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.65rem] uppercase tracking-[0.18em] text-[#666]">Today · 9:00 PM</span>
          <span className="text-[0.65rem] uppercase tracking-[0.18em] text-[#c9a84c]">Window open</span>
        </div>
        <div className="space-y-3">
          <MockRow title="Phone before bed" status="held" />
          <MockRow title="Workout block" status="held" />
          <MockRow title="Late-night scroll" status="silent" />
        </div>
        <div className="mt-5 pt-4 border-t border-[#1f1b12] flex items-center justify-between">
          <span className="text-xs text-[#888]">1 silent lane</span>
          <span className="text-xs font-semibold" style={{ color: GOLD }}>Partner pinged in 2h</span>
        </div>
      </div>
    </div>
  );
}

function MockRow({ title, status }: { title: string; status: "held" | "silent" }) {
  const dot = status === "held" ? "#4ade80" : "#c9a84c";
  const label = status === "held" ? "Held" : "No check-in";
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#0a0800] border border-[#1a1610]">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />
        <span className="text-sm text-white">{title}</span>
      </div>
      <span className="text-[0.7rem] uppercase tracking-wider" style={{ color: dot }}>{label}</span>
    </div>
  );
}

function ProblemTension() {
  return (
    <section className="px-5 sm:px-8 py-20 border-t border-[#1a1610]">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-6">The Problem</p>
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-white mb-6">
          Accountability apps tell on you <em className="not-italic" style={{ color: GOLD }}>after</em> the breach.
        </h2>
        <p className="text-[#a8a39a] text-lg leading-relaxed mb-10">
          Reports, logs, weekly emails. By the time anyone sees them, the damage is a week old. The real failure happened in the quiet — the missed check-in nobody noticed.
        </p>
        <div className="rounded-2xl border border-[#c9a84c]/25 bg-[#0f0c05] p-8 sm:p-10">
          <p className="text-[#c9a84c] italic text-lg sm:text-xl leading-relaxed">
            "Two are better than one; because they have a good reward for their labour. For if they fall, the one will lift up his fellow: but woe to him that is alone when he falleth; for he hath not another to help him up."
          </p>
          <p className="mt-5 text-white text-[0.7rem] tracking-[0.18em] uppercase">Ecclesiastes 4:9–10 · KJV</p>
        </div>
      </div>
    </section>
  );
}

function SilenceRule() {
  return (
    <section className="px-5 sm:px-8 py-20 border-t border-[#1a1610]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">The Mechanic</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">The Silence Rule</h2>
          <p className="text-[#a8a39a] text-lg max-w-2xl mx-auto">Three thresholds. The quieter you get, the louder it becomes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Threshold n="01" title="Miss one" body="Nothing. Life happens. The window closes and the day moves on." tone="muted" />
          <Threshold n="02" title="Miss two in 24h" body="Your partner is pinged. A real human, chosen by you, knows you've gone quiet." tone="warn" />
          <Threshold n="03" title="Miss three" body="Escalation contact notified. The chain you set up engages before the breach can." tone="alert" />
        </div>
        <div className="mt-10 rounded-2xl border border-[#1a1610] bg-[#0a0800] p-6 sm:p-8">
          <p className="text-[0.7rem] tracking-[0.18em] uppercase text-[#666] mb-4">Receipts</p>
          <div className="grid sm:grid-cols-3 gap-6">
            <Receipt label="Signal" value="Missed window" detail="Check-in not submitted in the assigned interval." />
            <Receipt label="Decision" value="Partner ping at T2" detail="Escalation contact engaged at T3." />
            <Receipt label="Outcome" value="< 4h response" detail="Average partner response in private beta. Gated until real data." />
          </div>
        </div>
      </div>
    </section>
  );
}

function Threshold({ n, title, body, tone }: { n: string; title: string; body: string; tone: "muted" | "warn" | "alert" }) {
  const color = tone === "muted" ? "#666" : tone === "warn" ? GOLD : "#e8804a";
  return (
    <div className="rounded-2xl border border-[#1f1b12] bg-[#0f0c05] p-6 relative overflow-hidden">
      <span className="absolute top-4 right-5 text-5xl font-extrabold opacity-15" style={{ color }}>{n}</span>
      <p className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold mb-3" style={{ color }}>Threshold {n}</p>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#a8a39a] leading-relaxed">{body}</p>
    </div>
  );
}

function Receipt({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#555] mb-1.5">{label}</p>
      <p className="text-white font-bold mb-1">{value}</p>
      <p className="text-xs text-[#777] leading-relaxed">{detail}</p>
    </div>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      cadence: "forever",
      pitch: "Prove the loop on your own life.",
      features: ["2 lanes", "1 partner", "Daily check-ins", "Breach reporting", "Partner notifications"],
      cta: "Join the waitlist",
      enabled: false,
      featured: false,
    },
    {
      name: "Full Access",
      price: "$12",
      cadence: "/ month",
      pitch: "The serious tier. Every lane, every partner.",
      features: ["Up to 10 lanes", "Up to 5 partners (2 lanes each)", "Escalation chain", "Push notifications", "Weekly recap"],
      cta: "Join the waitlist",
      enabled: false,
      featured: true,
    },
    {
      name: "Circle",
      price: "Soon",
      cadence: "",
      pitch: "Closed groups. One payer, mutual oversight.",
      features: ["Men's groups, recovery circles", "Mutual partner pairing inside the circle", "Admin oversight (no breach content)", "Two-layer fallback"],
      cta: "Coming after launch",
      enabled: false,
      featured: false,
    },
  ];
  return (
    <section className="px-5 sm:px-8 py-20 border-t border-[#1a1610]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">Pay if you're serious.</h2>
          <p className="text-[#a8a39a] text-lg max-w-xl mx-auto">Partners you alert are never charged. Only people creating lanes pay.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((t) => (
            <div key={t.name} className={`rounded-2xl p-7 flex flex-col ${t.featured ? "border-2 border-[#c9a84c]/60 bg-[#100d05]" : "border border-[#1f1b12] bg-[#0a0800]"}`}
              style={t.featured ? { boxShadow: "0 0 40px rgba(201,168,76,0.12)" } : undefined}>
              {t.featured && <p className="text-[0.6rem] tracking-[0.2em] uppercase font-bold mb-3" style={{ color: GOLD }}>Recommended</p>}
              <h3 className="text-2xl font-bold text-white mb-1">{t.name}</h3>
              <p className="text-sm text-[#888] mb-5">{t.pitch}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">{t.price}</span>
                {t.cadence && <span className="text-sm text-[#777] ml-1">{t.cadence}</span>}
              </div>
              <ul className="space-y-2.5 mb-7 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#c9c4ba]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                disabled
                className={`w-full py-3 rounded-xl font-semibold text-sm ${t.featured ? "bg-[#c9a84c]/30 text-[#c9a84c]" : "border border-[#222] text-[#666]"}`}
              >
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-5 sm:px-8 py-10 border-t border-[#1a1610] mt-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2.5">
          <img src="/kingdom-protocol-logo.png" alt="" className="h-7 w-auto" />
          <span className="text-sm font-bold text-white">Kingdom Protocol</span>
        </div>
        <p className="text-xs text-[#555] tracking-wider text-center">Built by Dijital Shift · v1.0 · shipping May 2026</p>
        <Link to="/login" className="text-sm text-[#c9a84c] font-semibold">Sign in</Link>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <main className="min-h-[100dvh]" style={{ background: "#0a0800" }}>
      <Header />
      <Hero />
      <ProblemTension />
      <SilenceRule />
      <Pricing />
      <Footer />
    </main>
  );
}
