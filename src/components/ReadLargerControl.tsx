import * as React from "react";
import { BookOpen, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function ReadLargerControl({ idx, set, className }: { idx: number; set: (n: number) => void; className?: string }) {
  // Project-fixed obsidian/gold tokens only — never device light/dark scheme.
  if (idx === 0) {
    return (
      <button
        type="button"
        onClick={() => set(1)}
        aria-label="Read larger"
        title="Read larger"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card/90",
          "px-3 text-xs font-semibold text-primary shadow-sm",
          "transition-colors hover:border-primary/40 hover:bg-primary/10 active:bg-primary/15",
          className,
        )}
      >
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        Read larger
      </button>
    );
  }
  return (
    <div
      role="group"
      aria-label="Text size"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-primary/40 bg-primary/10",
        "p-0.5 shadow-sm",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => set(idx - 1)}
        aria-label="Smaller text"
        className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/15 disabled:opacity-30"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        className="min-w-10 text-center font-mono text-xs font-semibold text-primary"
        aria-live="polite"
      >
        {Math.round(READ_SCALES[idx] * 100)}%
      </span>
      <button
        type="button"
        onClick={() => set(idx + 1)}
        disabled={idx === READ_SCALES.length - 1}
        aria-label="Larger text"
        className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/15 disabled:opacity-30"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
