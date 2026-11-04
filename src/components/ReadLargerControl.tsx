import * as React from "react";
import { Minus, Plus, Type } from "lucide-react";

export const READ_SCALES = [1, 1.15, 1.3, 1.5] as const;
const KEY = "demo-read-scale";

export function useReadScale() {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const v = Number(window.localStorage.getItem(KEY));
    if (Number.isInteger(v) && v >= 0 && v < READ_SCALES.length) setIdx(v);
  }, []);
  const set = React.useCallback((n: number) => {
    const c = Math.max(0, Math.min(READ_SCALES.length - 1, n));
    setIdx(c);
    try { window.localStorage.setItem(KEY, String(c)); } catch { /* ignore */ }
    try { navigator.vibrate?.(8); } catch { /* ignore */ }
  }, []);
  return { idx, scale: READ_SCALES[idx], set };
}

export function ReadLargerControl({ idx, set }: { idx: number; set: (n: number) => void }) {
  const btn = "flex h-9 w-9 items-center justify-center rounded-full text-[#c9a84c] disabled:opacity-30 hover:bg-[#c9a84c]/10";
  if (idx === 0) {
    return (
      <button type="button" onClick={() => set(1)} aria-label="Read larger"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#2a2518] px-3 text-xs font-semibold text-[#c9a84c]">
        <Type className="h-4 w-4" /> Read larger
      </button>
    );
  }
  return (
    <div role="group" aria-label="Text size" className="inline-flex items-center rounded-full border border-[#c9a84c]/50 bg-[#c9a84c]/10">
      <button type="button" className={btn} onClick={() => set(idx - 1)} aria-label="Smaller text"><Minus className="h-4 w-4" /></button>
      <span className="min-w-10 text-center font-mono text-xs text-[#f3d27a]" aria-live="polite">{Math.round(READ_SCALES[idx] * 100)}%</span>
      <button type="button" className={btn} onClick={() => set(idx + 1)} disabled={idx === READ_SCALES.length - 1} aria-label="Larger text"><Plus className="h-4 w-4" /></button>
    </div>
  );
}
