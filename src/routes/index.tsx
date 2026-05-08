import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kingdom Protocol — Behavioral Accountability" },
      { name: "description", content: "Behavioral accountability through partner-based oversight. Stay in your lane." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden" style={{ background: "#0a0800" }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center top, rgba(201,168,76,0.28) 0%, rgba(201,168,76,0.08) 45%, transparent 70%)" }} />
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        <img src="/logo-full.png" alt="Kingdom Protocol" className="w-72 max-w-[80vw] mb-8" />
        <p className="text-[0.8rem] text-[#666] mb-8 tracking-wide">Behavioral Accountability for the Kingdom-Minded</p>
        <div className="mb-10">
          <p className="text-[#c9a84c] text-sm italic leading-relaxed mb-2">
            "Two are better than one; because they have a good reward for their labour. For if they fall, the one will lift up his fellow: but woe to him that is alone when he falleth; for he hath not another to help him up."
          </p>
          <p className="text-white text-[0.65rem] tracking-[0.1em] uppercase">Ecclesiastes 4:9–10 · KJV</p>
        </div>
        <div className="flex flex-col gap-3 w-full mb-5">
          <Link to="/login" className="block py-4 rounded-xl bg-[#c9a84c] text-black font-bold" style={{ boxShadow: "0 0 24px rgba(201,168,76,0.25)" }}>
            Get Started
          </Link>
          <Link to="/how-it-works" className="block py-3.5 rounded-xl border border-[#222] text-[#888] font-semibold">
            How it works
          </Link>
        </div>
        <Link to="/login" className="text-xs text-[#444]">
          Already have an account? <span className="text-[#888] underline">Sign in</span>
        </Link>
      </div>
      <p className="absolute bottom-3 right-4 text-[0.6rem] text-[#222] tracking-wider">Built by Dijital Shift</p>
    </main>
  );
}
