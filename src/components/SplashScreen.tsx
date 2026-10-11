import { useEffect, useState } from "react";

/** Cold-launch splash — installed PWA only, once per app session. */
export function SplashScreen() {
  const [phase, setPhase] = useState<"off" | "on" | "out">("off");

  useEffect(() => {
    try {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (!standalone || sessionStorage.getItem("kp_splash")) return;
      sessionStorage.setItem("kp_splash", "1");
    } catch {
      return;
    }
    setPhase("on");
    const t1 = window.setTimeout(() => setPhase("out"), 1300);
    const t2 = window.setTimeout(() => setPhase("off"), 1800);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);

  if (phase === "off") return null;
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: "#0a0800", opacity: phase === "out" ? 0 : 1, transition: "opacity 500ms ease" }}
    >
      <div className="relative">
        <div className="kp-splash-aura absolute inset-[-40%] rounded-full" />
        <img src="/kingdom-protocol-logo.png" alt="" className="relative w-28 h-28 object-contain" />
      </div>
      <p className="mt-7 text-xl tracking-[0.22em] text-[#c9a84c]" style={{ fontFamily: "Cinzel, serif" }}>
        KINGDOM PROTOCOL
      </p>
      <p className="mt-2 text-sm italic text-[#a49d8e]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Accountability with a watchman.
      </p>
    </div>
  );
}
