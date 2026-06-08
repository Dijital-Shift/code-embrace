import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kingdom Protocol — Iron sharpens iron. Silence dulls both." },
      { name: "description", content: "For the kingdom-minded believer who refuses to walk alone. Daily check-ins, partnered with a watchman in covenant — before the silence becomes a fall." },
      { property: "og:title", content: "Kingdom Protocol — Iron sharpens iron. Silence dulls both." },
      { property: "og:description", content: "For the kingdom-minded believer who refuses to walk alone. Daily check-ins, partnered with a watchman in covenant — before the silence becomes a fall." },
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
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">For the kingdom-minded · Accountability with a watchman</p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.05] tracking-tight text-white">
            Iron sharpens iron.<br />
            <span style={{ color: GOLD }}>Silence dulls both.</span>
          </h1>
          <p className="mt-5 text-[#a8a39a] text-base sm:text-lg leading-relaxed max-w-md">
            For the believer who refuses to walk alone. Daily check-ins, partnered with a watchman in covenant with you — before the silence becomes a fall.
          </p>
          <div className="mt-8 flex gap-2">
            <Link to="/login" className="inline-block px-6 py-3.5 rounded-xl bg-[#c9a84c] text-black font-bold text-[0.95rem]" style={{ boxShadow: "0 0 28px rgba(201,168,76,0.3)" }}>
              Start free
            </Link>
            <Link to="/demo" className="inline-block px-6 py-3.5 rounded-xl border border-[#c9a84c]/40 text-[#c9a84c] font-semibold text-[0.95rem]">
              See it move
            </Link>
          </div>
          <p className="mt-5 text-xs text-[#555] tracking-wider">Early access · free while we pair the first cohort</p>
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
          <span className="text-xs text-[#888]">1 silent path</span>
          <span className="text-xs font-semibold" style={{ color: GOLD }}>Watchman pinged in 2h</span>
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
          <p className="text-[#a8a39a] text-lg max-w-2xl mx-auto">Two thresholds. The quieter you get, the louder it becomes.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <Threshold n="01" title="Miss one" body="You get a nudge. Life happens, but the day doesn't pass in silence." tone="muted" />
          <Threshold n="02" title="Stay silent or report a breach" body="Your watchman is pinged. A real human, chosen by you, knows you've gone quiet — or that you fell." tone="warn" />
        </div>
        <div className="mt-10 rounded-2xl border border-[#1a1610] bg-[#0a0800] p-8 sm:p-12 text-center">
          <p className="text-[0.65rem] tracking-[0.28em] uppercase text-[#666] mb-5">Why two thresholds</p>
          <p className="italic text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: GOLD }}>
            "A prudent man foreseeth the evil, and hideth himself: but the simple pass on, and are punished."
          </p>
          <p className="mt-5 text-white text-[0.7rem] tracking-[0.18em] uppercase">Proverbs 22:3 · KJV</p>
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

function Pricing() {
  return (
    <section className="px-5 sm:px-8 py-20 border-t border-[#1a1610]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">Count the cost.</h2>
          <p className="text-[#a8a39a] text-lg max-w-2xl mx-auto">
            <span className="italic text-[#c9c4ba]">"For which of you, intending to build a tower, sitteth not down first, and counteth the cost?"</span> — Luke 14:28
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Free trial */}
          <div className="rounded-2xl border border-[#1f1b12] bg-[#0a0800] p-7 flex flex-col">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase font-bold mb-2 text-[#888]">First 30 days</p>
            <h3 className="text-2xl font-extrabold text-white mb-1">Free trial</h3>
            <p className="text-[#666] text-sm mb-5">Full access. No card.</p>
            <ul className="space-y-2 text-sm text-[#c9c4ba] flex-1">
              {["Every path", "Watchman pairing", "Daily check-ins", "Breach reporting", "Push notifications"].map((f) => (
                <li key={f} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#888" }} /><span>{f}</span></li>
              ))}
            </ul>
            <Link to="/login" className="mt-6 inline-block text-center px-5 py-3 rounded-xl border border-[#c9a84c]/40 text-[#c9a84c] font-semibold text-sm">
              Start free
            </Link>
          </div>

          {/* Monthly */}
          <div className="rounded-2xl border border-[#1f1b12] bg-[#0a0800] p-7 flex flex-col">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase font-bold mb-2 text-[#888]">After trial</p>
            <h3 className="text-2xl font-extrabold text-white mb-1">$4.99<span className="text-base font-bold text-[#888]">/mo</span></h3>
            <p className="text-[#666] text-sm mb-5">Month to month. Cancel anytime.</p>
            <ul className="space-y-2 text-sm text-[#c9c4ba] flex-1">
              {["Everything in free trial", "Cancel anytime", "Grandfathered if price changes"].map((f) => (
                <li key={f} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#888" }} /><span>{f}</span></li>
              ))}
            </ul>
            <Link to="/login" className="mt-6 inline-block text-center px-5 py-3 rounded-xl border border-[#c9a84c]/40 text-[#c9a84c] font-semibold text-sm">
              Start free
            </Link>
          </div>

          {/* Lifetime */}
          <div className="rounded-2xl border-2 border-[#c9a84c]/60 bg-[#100d05] p-7 flex flex-col relative" style={{ boxShadow: "0 0 40px rgba(201,168,76,0.12)" }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[0.6rem] tracking-[0.2em] uppercase font-bold rounded-full" style={{ background: GOLD, color: "#000" }}>Recommended</span>
            <p className="text-[0.6rem] tracking-[0.2em] uppercase font-bold mb-2" style={{ color: GOLD }}>Once. Forever.</p>
            <h3 className="text-2xl font-extrabold text-white mb-1">$99<span className="text-base font-bold text-[#888]"> lifetime</span></h3>
            <p className="text-[#aa9560] text-sm mb-5">Buy it once. Walk it forever.</p>
            <ul className="space-y-2 text-sm text-[#c9c4ba] flex-1">
              {["Everything, always", "No renewals", "Pays for itself in ~20 months", "For the long obedience"].map((f) => (
                <li key={f} className="flex items-start gap-2"><span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} /><span>{f}</span></li>
              ))}
            </ul>
            <Link to="/login" className="mt-6 inline-block text-center px-5 py-3.5 rounded-xl bg-[#c9a84c] text-black font-bold text-sm" style={{ boxShadow: "0 0 28px rgba(201,168,76,0.3)" }}>
              Start free → Lifetime
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[#666] tracking-wider">Watchmen are always free. They walk with you, not with a bill.</p>
      </div>
    </section>
  );
}


function WhoThisIsFor() {
  const forItems = [
    "has stopped pretending the silence is harmless",
    "wants a brother or sister on the wall, not a dashboard",
    "is ready to be seen on the days they'd rather hide",
    "believes confession in the light beats covering in the dark",
  ];
  const notForItems = [
    "wants a habit tracker without covenant",
    "is looking for anonymity over accountability",
    "expects software to do the work of a watchman",
    "is not ready to let another believer see the misses",
  ];
  return (
    <section className="px-5 sm:px-8 py-20 border-t border-[#1a1610]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">Discernment</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">Whom this is for.</h2>
          <p className="text-[#a8a39a] text-lg max-w-2xl mx-auto">"Be ye not unequally yoked." Choose honestly before you build.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[#c9a84c]/40 bg-[#100d05] p-7">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold mb-4" style={{ color: GOLD }}>For the one who…</p>
            <ul className="space-y-3">
              {forItems.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-[#c9c4ba] leading-relaxed">
                  <span className="mt-1 text-base font-bold flex-shrink-0" style={{ color: GOLD }}>✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#1f1b12] bg-[#0a0800] p-7">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase font-semibold mb-4 text-[#666]">Not for the one who…</p>
            <ul className="space-y-3">
              {notForItems.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-[#888] leading-relaxed">
                  <span className="mt-1 text-base font-bold flex-shrink-0 text-[#555]">✕</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Is it really free?",
      a: "Free for 30 days when you sign up — no card. After that it's $4.99/month or $99 once for lifetime. Watchmen never pay.",
    },
    {
      q: "Is this confession?",
      a: "No. Confession belongs to the Lord and, when fitting, to the church. This is a watchman — a watchman who sees the silence early enough to call you back before the breach.",
    },
    {
      q: "Who sees my misses?",
      a: "Only the watchman you chose. Not the public. Not a feed. Not us beyond what the system requires to deliver the ping. (James 5:16 — \"Confess your faults one to another.\")",
    },
    {
      q: "Is this for women?",
      a: "Yes. The protocol is the same. Choose a watchman of the same conviction; the system does not assume a gender.",
    },
    {
      q: "What does it cost watchmen?",
      a: "Nothing. Watchmen are never charged. Only those walking the paths pay. (Freely ye have received, freely give — Matthew 10:8.)",
    },
    {
      q: "Why pay at all?",
      a: "Because the labourer is worthy of his hire (1 Timothy 5:18), and this work stays unfunded by advertisers so the watchtower stays clean.",
    },
  ];

  return (
    <section className="px-5 sm:px-8 py-20 border-t border-[#1a1610]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">Plain answers</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">Questions, answered plainly.</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-4">
          {items.map((it, i) => (
            <AccordionItem
              key={it.q}
              value={`item-${i}`}
              className="rounded-xl border border-[#1f1b12] bg-[#0a0800] px-6 data-[state=open]:border-[#c9a84c]/40"
            >
              <AccordionTrigger className="text-left text-base sm:text-lg font-bold text-white hover:no-underline hover:text-[#c9a84c] data-[state=open]:text-[#c9a84c] [&>svg]:text-[#c9a84c]">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#a8a39a] text-sm sm:text-base leading-relaxed pb-5">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function ClosingCall() {
  return (
    <section className="px-5 sm:px-8 py-20 border-t border-[#1a1610]">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">The call</p>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-8">Bear ye one another's burdens.</h2>
        <div className="rounded-2xl border border-[#c9a84c]/25 bg-[#0f0c05] p-8 sm:p-10 text-center">
          <p className="text-[#c9a84c] italic text-lg sm:text-xl leading-relaxed">
            "Brethren, if a man be overtaken in a fault, ye which are spiritual, restore such an one in the spirit of meekness; considering thyself, lest thou also be tempted. Bear ye one another's burdens, and so fulfil the law of Christ."
          </p>
          <p className="mt-5 text-white text-[0.7rem] tracking-[0.18em] uppercase">Galatians 6:1–2 · KJV</p>
        </div>
        <p className="mt-8 text-[#a8a39a] text-base sm:text-lg leading-relaxed">
          If the silence has been louder than the prayer, step into the light. Take a watchman. Be one.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="inline-block px-6 py-3.5 rounded-xl bg-[#c9a84c] text-black font-bold text-[0.95rem]" style={{ boxShadow: "0 0 28px rgba(201,168,76,0.3)" }}>
            Start free
          </Link>
          <Link to="/demo" className="inline-block px-6 py-3.5 rounded-xl border border-[#c9a84c]/40 text-[#c9a84c] font-semibold text-[0.95rem]">
            See it move
          </Link>
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
      <WhoThisIsFor />
      <FAQ />
      <ClosingCall />
      <Footer />
    </main>
  );
}
