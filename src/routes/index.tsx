import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Wordmark } from "@/components/Wordmark";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useAuth } from "@/lib/auth";

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

function useCaptureReferral() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) window.localStorage.setItem("kp_ref", ref.toLowerCase());
  } catch {}
}

const GOLD = "#c9a84c";



function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[#2a2418]">
      <Wordmark />
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
              How it works
            </Link>
          </div>
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
          <MockRow title="Meditate on Scripture" status="held" />
          <MockRow title="Pray three times a day" status="held" />
          <MockRow title="Fast — no fried foods" status="silent" />
        </div>
        <div className="mt-5 pt-4 border-t border-[#1f1b12] flex items-center justify-between">
          <span className="text-xs text-[#888]">1 silent path</span>
          <span className="text-xs font-semibold" style={{ color: GOLD }}>Watchmen pinged in 2h</span>
        </div>
      </div>
    </div>
  );
}

function MockRow({ title, status }: { title: string; status: "held" | "silent" }) {
  const dot = status === "held" ? "#4ade80" : "#c9a84c";
  const label = status === "held" ? "Held" : "No check-in";
  return (
    <div className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-lg bg-[#0a0800] border border-[#1a1610]">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />
        <span className="text-sm text-white truncate">{title}</span>
      </div>
      <span className="text-[0.65rem] uppercase tracking-wider whitespace-nowrap flex-shrink-0" style={{ color: dot }}>{label}</span>
    </div>
  );
}

function ProblemTension() {
  return (
    <section className="px-5 sm:px-8 py-14 border-t border-[#2a2418]">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-6">The Problem</p>
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-white mb-6">
          The <em className="not-italic" style={{ color: GOLD }}>quiet</em> break.
        </h2>
        <p className="text-[#a8a39a] text-lg leading-relaxed mb-6 text-left sm:text-center">
          Monday you were certain. Tuesday you were tired. By Thursday you're lying to a notification, and the streak you built is a number you stopped looking at. The app meant to help you wanted eleven taps and a mood emoji. You gave it neither. The thing you swore off on Sunday is already in your hand. You fell in the dark. Nobody knows. That's the worst part.
        </p>
        <p className="text-white text-lg sm:text-xl font-medium leading-relaxed mb-10">
          What you actually need is small, quiet, and human. One honest tap when the day is done. One person who notices the silence and reaches out to you.
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
    <section className="px-5 sm:px-8 py-14 border-t border-[#2a2418]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">The Mechanic</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">The Silence Rule</h2>
          <p className="text-[#a8a39a] text-lg max-w-2xl mx-auto">Three thresholds. The quieter you get, the louder it becomes — until a brother shows up.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-5">
          <Threshold n="01" title="Miss one" body="You get a nudge. Life happens, but the day doesn't pass in silence." tone="muted" />
          <Threshold n="02" title="Silence or breach" body="Your watchman is pinged. A real human, chosen by you, knows you've gone quiet — or that you fell." tone="warn" />
          <Threshold n="03" title="Watchman responds" body="They reach out — a call, a verse, a meet-up. The loop closes with a brother, not a banner." tone="alert" />
        </div>

        <div className="mt-10 rounded-2xl border border-[#1a1610] bg-[#0a0800] p-8 sm:p-12 text-center">
          <p className="text-[0.65rem] tracking-[0.28em] uppercase text-[#666] mb-5">Why three thresholds</p>
          <p className="italic text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: GOLD }}>
            "But if the watchman see the sword come, and blow not the trumpet, and the people be not warned… his blood will I require at the watchman's hand."
          </p>
          <p className="mt-5 text-white text-[0.7rem] tracking-[0.18em] uppercase">Ezekiel 33:6 · KJV</p>
        </div>
      </div>
    </section>
  );
}


function Threshold({ n, title, body, tone }: { n: string; title: string; body: string; tone: "muted" | "warn" | "alert" }) {
  const color = tone === "muted" ? "#666" : tone === "warn" ? GOLD : "#e8804a";
  return (
    <div className="h-full rounded-2xl border border-[#1f1b12] bg-[#0f0c05] px-4 pt-10 pb-4 sm:px-6 sm:pt-14 sm:pb-6 relative overflow-hidden flex flex-col items-center text-center">
      <span className="absolute top-2 right-3 text-2xl sm:text-5xl font-extrabold opacity-25" style={{ color }}>{n}</span>
      
      <h3 className="text-sm sm:text-xl font-bold text-white mb-1.5 sm:mb-2 leading-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-[#a8a39a] leading-relaxed">{body}</p>
    </div>
  );
}


function Pricing() {
  return (
    <section className="px-5 sm:px-8 py-14 border-t border-[#2a2418]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">Count the cost.</h2>
          <p className="text-[#a8a39a] text-lg max-w-2xl mx-auto">
            <span className="italic text-[#c9c4ba]">"For which of you, intending to build a tower, sitteth not down first, and counteth the cost?"</span> — Luke 14:28
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-5">
          {/* Free trial */}
          <div className="rounded-xl sm:rounded-2xl border border-[#1f1b12] bg-[#0a0800] p-3 sm:p-7 flex flex-col">
            <p className="text-[0.5rem] sm:text-[0.6rem] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold mb-1 sm:mb-2 text-[#888]">30 days</p>
            <h3 className="text-base sm:text-2xl font-extrabold text-white mb-1 leading-tight">Free trial</h3>
            <p className="text-[#666] text-[0.65rem] sm:text-sm mb-3 sm:mb-5 leading-snug">Full access. No card.</p>
            <ul className="space-y-1 sm:space-y-2 text-[0.7rem] sm:text-sm text-[#c9c4ba] flex-1">
              {["Every path", "Watchman pairing", "Daily check-ins", "Breach reporting"].map((f) => (
                <li key={f} className="flex items-start gap-1.5 sm:gap-2"><span className="mt-1 sm:mt-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0" style={{ background: "#888" }} /><span>{f}</span></li>
              ))}
            </ul>
            <Link to="/login" className="mt-4 sm:mt-6 inline-block text-center px-2 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-[#c9a84c]/40 text-[#c9a84c] font-semibold text-[0.7rem] sm:text-sm">
              Start free
            </Link>
          </div>

          {/* Monthly */}
          <div className="rounded-xl sm:rounded-2xl border border-[#1f1b12] bg-[#0a0800] p-3 sm:p-7 flex flex-col">
            <p className="text-[0.5rem] sm:text-[0.6rem] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold mb-1 sm:mb-2 text-[#888]">After trial</p>
            <h3 className="text-base sm:text-2xl font-extrabold text-white mb-1 leading-tight">$4.99<span className="text-[0.7rem] sm:text-base font-bold text-[#888]">/mo</span></h3>
            <p className="text-[#666] text-[0.65rem] sm:text-sm mb-3 sm:mb-5 leading-snug">Cancel anytime.</p>
            <ul className="space-y-1 sm:space-y-2 text-[0.7rem] sm:text-sm text-[#c9c4ba] flex-1">
              {["All trial features", "Cancel anytime", "Price-locked"].map((f) => (
                <li key={f} className="flex items-start gap-1.5 sm:gap-2"><span className="mt-1 sm:mt-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0" style={{ background: "#888" }} /><span>{f}</span></li>
              ))}
            </ul>
            <CheckoutCTA
              priceId="kp_premium_monthly"
              loggedOutLabel="Start free"
              loggedInLabel="Subscribe"
              className="mt-4 sm:mt-6 inline-block text-center px-2 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-[#c9a84c]/40 text-[#c9a84c] font-semibold text-[0.7rem] sm:text-sm"
            />
          </div>

          {/* Lifetime */}
          <div className="rounded-xl sm:rounded-2xl border-2 border-[#c9a84c]/60 bg-[#100d05] p-3 sm:p-7 flex flex-col relative" style={{ boxShadow: "0 0 40px rgba(201,168,76,0.12)" }}>
            <span className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 text-[0.5rem] sm:text-[0.6rem] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold rounded-full whitespace-nowrap" style={{ background: GOLD, color: "#000" }}>Best</span>
            <p className="text-[0.5rem] sm:text-[0.6rem] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-bold mb-1 sm:mb-2" style={{ color: GOLD }}>Forever</p>
            <h3 className="text-base sm:text-2xl font-extrabold text-white mb-1 leading-tight">$99<span className="text-[0.7rem] sm:text-base font-bold text-[#888]"> once</span></h3>
            <p className="text-[#aa9560] text-[0.65rem] sm:text-sm mb-3 sm:mb-5 leading-snug">Walk it forever.</p>
            <ul className="space-y-1 sm:space-y-2 text-[0.7rem] sm:text-sm text-[#c9c4ba] flex-1">
              {["Everything, always", "No renewals", "Long obedience"].map((f) => (
                <li key={f} className="flex items-start gap-1.5 sm:gap-2"><span className="mt-1 sm:mt-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} /><span>{f}</span></li>
              ))}
            </ul>
            <CheckoutCTA
              priceId="kp_lifetime_once"
              loggedOutLabel="Lifetime"
              loggedInLabel="Buy lifetime"
              className="mt-4 sm:mt-6 inline-block text-center px-2 sm:px-5 py-2 sm:py-3.5 rounded-lg sm:rounded-xl bg-[#c9a84c] text-black font-bold text-[0.7rem] sm:text-sm"
              style={{ boxShadow: "0 0 28px rgba(201,168,76,0.3)" }}
            />
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
    "would rather perish in private than be saved in public",
  ];
  return (
    <section className="px-5 sm:px-8 py-14 border-t border-[#2a2418]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">Discernment</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">Whom this is for.</h2>
          <p className="text-[#a8a39a] text-lg max-w-2xl mx-auto">"Be ye not unequally yoked." Choose honestly before you build.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-5">
          <div className="rounded-xl sm:rounded-2xl border border-[#c9a84c]/40 bg-[#100d05] p-3 sm:p-7">
            <p className="text-center text-[0.55rem] sm:text-[0.65rem] tracking-[0.18em] sm:tracking-[0.2em] uppercase font-semibold mb-3 sm:mb-4" style={{ color: GOLD }}>For the one who…</p>
            <ul className="space-y-2 sm:space-y-3">
              {forItems.map((t) => (
                <li key={t} className="flex items-start gap-1.5 sm:gap-3 text-[0.72rem] sm:text-sm text-[#c9c4ba] leading-relaxed">
                  <span className="mt-0.5 sm:mt-1 text-sm sm:text-base font-bold flex-shrink-0" style={{ color: GOLD }}>✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-xl sm:rounded-2xl border-2 p-3 sm:p-7"
            style={{ borderColor: "rgba(220,38,38,0.55)", background: "#1a0707" }}
          >
            <p className="text-center text-[0.55rem] sm:text-[0.65rem] tracking-[0.18em] sm:tracking-[0.2em] uppercase font-bold mb-3 sm:mb-4" style={{ color: "#f87171" }}>Not for the one who…</p>
            <ul className="space-y-2 sm:space-y-3">
              {notForItems.map((t) => (
                <li key={t} className="flex items-start gap-1.5 sm:gap-3 text-[0.72rem] sm:text-sm leading-relaxed" style={{ color: "#fca5a5" }}>
                  <span className="mt-0.5 sm:mt-1 text-sm sm:text-base font-bold flex-shrink-0" style={{ color: "#ef4444" }}>✕</span>
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

type Verse = { text: string; ref: string };
type FaqItem = {
  q: string;
  a?: string;
  intro?: string;
  verses?: Verse[];
  closing?: string;
};

function VerseBlock({ verses }: { verses: Verse[] }) {
  return (
    <div className="space-y-4 my-4">
      {verses.map((v, i) => (
        <blockquote
          key={i}
          className="border-l-2 pl-4 py-1"
          style={{ borderColor: "rgba(201,168,76,0.45)" }}
        >
          <p
            className="italic text-[0.95rem] sm:text-base leading-relaxed"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#c9a84c" }}
          >
            “{v.text}”
          </p>
          <p className="mt-2 text-[0.65rem] tracking-[0.18em] uppercase font-medium text-white/80">
            {v.ref}
          </p>
        </blockquote>
      ))}
    </div>
  );
}

function FAQ() {
  const items: FaqItem[] = [
    {
      q: "Is this confession?",
      a: "No. Confession belongs to the Lord and, when fitting, to the church. This is a watchman — a watchman who sees the silence early enough to call you back before the breach.",
    },
    {
      q: "What stops me from lying?",
      intro:
        "Nothing in the software — and that's the point. This is a covenant, not a behavior tracker. If you lie to your watchman, you've only widened the gap between you and the Lord. The system pings a real person who knows you. Lies surface — in tone, in patterns, in the silence between check-ins.",
      verses: [
        {
          text: "For there is nothing covered, that shall not be revealed; neither hid, that shall not be known.",
          ref: "Luke 12:2",
        },
      ],
      closing: "If you came here to game it, this isn't your tool yet. Come ready to be seen.",
    },
    {
      q: "Who sees my misses?",
      intro:
        "Only the watchman you chose. Not the public. Not a feed. Not us beyond what the system requires to deliver the ping.",
      verses: [
        {
          text: "Confess your faults one to another, and pray one for another, that ye may be healed.",
          ref: "James 5:16",
        },
      ],
    },
    {
      q: "Is this for women?",
      a: "Yes. The protocol is the same. Choose a watchman of the same conviction; the system does not assume a gender.",
    },
    {
      q: "What inspired you to build this?",
      a: "Every accountability and habit app I tried worked for a week, then the alerts became wallpaper. A phone can't convict you — it can only buzz. After enough cycles of installing, ignoring, and uninstalling, I stopped pretending software was the answer. Real accountability is another believer walking with you — one who notices the silence and shows up. So I built the thing the apps couldn't be: a watchman, not a notification. Nowhere left to hide, and that's the mercy of it.",
    },
    {
      q: "Is it really free?",
      a: "Free for 30 days when you sign up — no card. After that it's $4.99/month or $99 once for lifetime. Watchmen never pay.",
    },
    {
      q: "Why pay at all?",
      intro:
        "Because the labourer is worthy of his hire, and this work stays unfunded by advertisers so the watchtower stays clean.",
      verses: [
        {
          text: "For the scripture saith… The labourer is worthy of his reward.",
          ref: "1 Timothy 5:18",
        },
      ],
    },
    {
      q: "What does it cost watchmen?",
      intro: "Nothing. Watchmen are never charged. Only those walking the paths pay.",
      verses: [
        {
          text: "Freely ye have received, freely give.",
          ref: "Matthew 10:8",
        },
      ],
    },
    {
      q: "What does the Word say about lying and being watched?",
      intro: "Plainly:",
      verses: [
        {
          text: "Lying lips are abomination to the LORD: but they that deal truly are his delight.",
          ref: "Proverbs 12:22",
        },
        {
          text: "But I say unto you, That every idle word that men shall speak, they shall give account thereof in the day of judgment.",
          ref: "Matthew 12:36",
        },
        {
          text: "The LORD is in his holy temple, the LORD's throne is in heaven: his eyes behold, his eyelids try, the children of men.",
          ref: "Psalm 11:4",
        },
        {
          text: "The eyes of the LORD are in every place, beholding the evil and the good.",
          ref: "Proverbs 15:3",
        },
        {
          text: "The eyes of the Lord are ten thousand times brighter than the sun, beholding all the ways of men, and considering the most secret parts.",
          ref: "Sirach 23:19",
        },
        {
          text: "Say not thou, I am hid from the Lord; shall any remember me from above?… his eyes are upon the ways of every man, and he seeth into secret places.",
          ref: "Sirach 16:17, 17:19–20 (paraphrased, KJV Apocrypha)",
        },
      ],
      closing:
        "What's done in the dark comes to the light. Better to be seen by a brother now than exposed at the throne later.",
    },
  ];

  return (
    <section className="px-5 sm:px-8 py-12 border-t border-[#2a2418]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[0.65rem] tracking-[0.28em] uppercase text-[#666] mb-3">Plain answers</p>
          <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-white mb-2">Questions, answered plainly.</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {items.map((it, i) => (
            <AccordionItem
              key={it.q}
              value={`item-${i}`}
              className="rounded-lg border border-[#1f1b12] bg-[#0a0800] px-4 data-[state=open]:border-[#c9a84c]/40"
            >
              <AccordionTrigger className="text-left text-sm sm:text-[0.95rem] font-medium text-white hover:no-underline hover:text-[#c9a84c] data-[state=open]:text-[#c9a84c] [&>svg]:text-[#c9a84c]">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#a8a39a] text-sm sm:text-base leading-relaxed pb-4">
                {it.a ? (
                  <p>{it.a}</p>
                ) : (
                  <>
                    {it.intro && <p>{it.intro}</p>}
                    {it.verses && <VerseBlock verses={it.verses} />}
                    {it.closing && <p className="mt-2">{it.closing}</p>}
                  </>
                )}
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
    <section className="px-5 sm:px-8 py-14 border-t border-[#2a2418]">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[0.7rem] tracking-[0.28em] uppercase text-[#666] mb-4">The call</p>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-8">Bear ye one another's burdens.</h2>
        <div className="rounded-2xl border border-[#c9a84c]/25 bg-[#0f0c05] p-8 sm:p-10 text-center">
          <p className="text-[#c9a84c] italic text-lg sm:text-xl leading-relaxed">
            "Brethren, if a man be overtaken in a fault, ye which are spiritual, restore such an one in the spirit of meekness; considering thyself, lest thou also be tempted. Bear ye one another's burdens, and so fulfil the law of Christ."
          </p>
          <p className="mt-5 text-white text-[0.7rem] tracking-[0.18em] uppercase">Galatians 6:1–2 · KJV</p>
        </div>
        <div className="mt-8 text-[#a8a39a] text-base sm:text-lg leading-relaxed space-y-3 max-w-2xl mx-auto text-left sm:text-center">
          <p>Silence is where the enemy works. Light is where the brethren stand.</p>
          <p>If the silence has been louder than your prayer, step into the light — take a watchman, be one.</p>
          <p className="italic text-[#c9a84c] text-base">
            "Confess your faults one to another, and pray one for another, that ye may be healed." — James 5:16
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="inline-block px-6 py-3.5 rounded-xl bg-[#c9a84c] text-black font-bold text-[0.95rem]" style={{ boxShadow: "0 0 28px rgba(201,168,76,0.3)" }}>
            Start free
          </Link>
          <Link to="/demo" className="inline-block px-6 py-3.5 rounded-xl border border-[#c9a84c]/40 text-[#c9a84c] font-semibold text-[0.95rem]">
            How it works
          </Link>
        </div>
      </div>
    </section>
  );
}


function Footer() {
  return (
    <footer className="px-5 sm:px-8 py-12 border-t border-[#2a2418] mt-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
        <img
          src="/kingdom-protocol-logo.png"
          alt="Kingdom Protocol"
          className="h-32 sm:h-40 w-auto"
          style={{ filter: "drop-shadow(0 0 24px rgba(201,168,76,0.45))" }}
        />
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#777]">
          <Link to="/terms" className="hover:text-[#c9a84c]">Terms</Link>
          <Link to="/privacy" className="hover:text-[#c9a84c]">Privacy</Link>
          <Link to="/refund" className="hover:text-[#c9a84c]">Refund Policy</Link>
        </div>
        <div className="grid grid-cols-3 items-center gap-4 w-full">
          <span className="hidden sm:block" />
          <p className="text-xs text-[#555] tracking-wider text-center col-span-2 sm:col-span-1">Built by Dijital Shift · v1.0</p>
          <div className="hidden sm:flex justify-end">
            <Link to="/login" className="text-sm text-[#c9a84c] font-semibold hover:opacity-80">Sign in</Link>
          </div>
          <div className="col-span-3 flex justify-center sm:hidden">
            <Link to="/login" className="text-sm text-[#c9a84c] font-semibold">Sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  if (typeof window !== "undefined") useCaptureReferral();
  return (
    <main className="min-h-[100dvh]" style={{ background: "#0a0800" }}>
      <Header />
      <Hero />
      <ProblemTension />
      <SilenceRule />
      <WhoThisIsFor />
      <Pricing />
      <FAQ />
      <ClosingCall />
      <Footer />
    </main>
  );
}

