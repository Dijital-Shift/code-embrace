import { createFileRoute, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/Wordmark";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({ meta: [{ title: "How it works — Kingdom Protocol" }] }),
  component: HowItWorks,
});

const steps = [
  { n: "01", title: "Pick a Path", body: "A path is a behavior you're committing to — something to avoid, or something to complete. Scripture-backed from the library, or build your own." },
  { n: "02", title: "Assign a Watchman", body: "Every path is watched by one person you trust. One watchman per path. They only hear from the system when something goes wrong." },
  { n: "03", title: "Check In Daily", body: "Once a day, near your bedtime, you get a push. Open the app, report each path, done. Less than 30 seconds." },
];

function HowItWorks() {
  return (
    <main className="min-h-screen px-6 py-8 pb-20" style={{ background: "#0a0800", color: "#fff" }}>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Wordmark size="sm" />
          <Link to="/" className="text-[#9e968a] text-sm">← Back</Link>
        </div>
        <div className="text-center my-10">
          <img src="/kingdom-protocol-logo.png" alt="" className="w-28 mx-auto" />
          <p className="text-[#a8a094] text-xs font-bold tracking-[0.25em] mt-1">WALK THE PATH</p>
        </div>
        <div className="flex flex-col gap-3 mb-8">
          {steps.map((s) => (
            <div key={s.n} className="relative overflow-hidden p-5 rounded-xl border border-[#2a2518]" style={{ background: "#161210" }}>
              <span className="absolute -top-1 right-3 text-[5rem] font-extrabold leading-none pointer-events-none select-none" style={{ color: "rgba(255,255,255,0.04)" }}>{s.n}</span>
              <h2 className="font-bold mb-2 relative">{s.title}</h2>
              <p className="text-sm text-[#c0b8ac] leading-relaxed relative">{s.body}</p>
            </div>
          ))}
          <div className="relative overflow-hidden p-5 rounded-xl border border-[#166534]" style={{ background: "#051a0a" }}>
            <h2 className="font-bold mb-2 text-[#4ade80]">Silence Means Aligned</h2>
            <p className="text-sm text-[#c0b8ac] leading-relaxed">When you're walking what you said you'd walk, nobody hears anything. Complete silence. That's the system working.</p>
          </div>
          <div className="relative overflow-hidden p-5 rounded-xl border border-[#7f1d1d]" style={{ background: "#1a0505" }}>
            <h2 className="font-bold mb-2 text-[#f87171]">Breach or Miss — Watchman Pinged</h2>
            <p className="text-sm text-[#c0b8ac] leading-relaxed">Report a breach and your watchman is pinged immediately. Miss a check-in and you get a nudge first. Stay silent — your watchman is pinged.</p>
          </div>
        </div>
        <div className="text-center mt-10">
          <Link to="/login" className="inline-block px-10 py-3.5 bg-white text-black rounded-md font-bold">Get Started</Link>
        </div>
      </div>
    </main>
  );
}
