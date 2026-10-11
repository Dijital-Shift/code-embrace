import { useEffect } from "react";

/**
 * Inline script that runs before first paint: on a cold launch of the
 * installed app it turns on the static splash, so the homepage never flashes.
 */
export const SPLASH_BOOT_SCRIPT = `(function(){try{var s=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;if(s&&!sessionStorage.getItem('kp_splash')){document.documentElement.classList.add('kp-splash');}}catch(e){}})();`;

/** Server-rendered splash markup — hidden unless the boot script enables it. */
export function StaticSplash() {
  return (
    <div id="kp-splash-static" aria-hidden>
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

/** Times the fade-out of the static splash once the app is running. */
export function SplashScreen() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("kp-splash")) return;
    try { sessionStorage.setItem("kp_splash", "1"); } catch { /* private mode */ }
    const el = document.getElementById("kp-splash-static");
    const t1 = window.setTimeout(() => el?.classList.add("kp-out"), 1300);
    const t2 = window.setTimeout(() => { html.classList.remove("kp-splash"); el?.classList.remove("kp-out"); }, 1800);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, []);
  return null;
}
