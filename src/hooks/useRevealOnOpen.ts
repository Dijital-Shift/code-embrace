import { useEffect, useRef } from "react";

/** When `open` turns true, scroll the attached element fully into view (and again after the keyboard opens). */
export function useRevealOnOpen<T extends HTMLElement>(open: boolean, focus = false) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const reveal = () => el.scrollIntoView({ behavior: "smooth", block: "center" });
    const raf = requestAnimationFrame(() => {
      reveal();
      if (focus) el.querySelector<HTMLElement>("textarea, input")?.focus({ preventScroll: true });
    });
    const t = setTimeout(reveal, 400);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", reveal);
    const stop = setTimeout(() => vv?.removeEventListener("resize", reveal), 1500);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); clearTimeout(stop); vv?.removeEventListener("resize", reveal); };
  }, [open, focus]);
  return ref;
}
