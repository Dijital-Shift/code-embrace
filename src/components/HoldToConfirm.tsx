import { useEffect, useRef, useState } from "react";
import { HOLD_MS } from "@/lib/hold-seal";

function buzz(ms: number) {
  try { navigator.vibrate?.(ms); } catch { /* unsupported */ }
}

/**
 * Press-and-hold seal: fires only after HOLD_MS of continuous pressure.
 * Releasing early cancels and leaves everything untouched.
 */
export function HoldToConfirm({ label, busyLabel = "Sounding…", disabled, busy, onConfirm }: {
  label: string; busyLabel?: string; disabled?: boolean; busy?: boolean; onConfirm: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef(0);
  const ticks = useRef(0);

  function stop() {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
    setProgress(0);
  }
  useEffect(() => stop, []);

  function begin(e: React.PointerEvent) {
    if (disabled || busy) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = performance.now();
    ticks.current = 0;
    buzz(15);
    const step = () => {
      const p = Math.min(1, (performance.now() - start.current) / HOLD_MS);
      setProgress(p);
      const sec = Math.floor((p * HOLD_MS) / 1000);
      if (sec > ticks.current && p < 1) { ticks.current = sec; buzz(20); }
      if (p >= 1) { raf.current = null; buzz(60); setProgress(0); onConfirm(); return; }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }

  const holding = progress > 0;
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onPointerDown={begin}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={`${label} — press and hold`}
      className="kp-checkin-action kp-checkin-breach relative overflow-hidden select-none touch-none px-4 text-xs font-bold rounded-md h-11 disabled:opacity-50"
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" } as React.CSSProperties}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 bg-destructive/45" style={{ width: `${progress * 100}%` }} />
      <span className="relative">{busy ? busyLabel : holding ? "Keep holding…" : label}</span>
    </button>
  );
}
