import * as React from "react";
import { BookOpenText, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const READ_SCALES = [1, 1.15, 1.3, 1.5] as const;
const KEY = "demo-read-scale";

export function useReadScale() {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    try {
      const v = Number(window.localStorage.getItem(KEY));
      if (Number.isInteger(v) && v >= 0 && v < READ_SCALES.length) setIdx(v);
    } catch { /* Keep the default when browser storage is unavailable. */ }
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
  const [expanded, setExpanded] = React.useState(false);
  // Project-fixed obsidian/gold tokens only — never device light/dark scheme.
  if (!expanded) {
    return (
      <Button
        variant="outline"
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Read larger"
        title="Read larger"
        className={cn(
          "inline-flex h-auto min-h-0 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary bg-primary [&_svg]:size-3.5",
          "px-3 py-1.5 text-[0.6875rem] font-bold text-primary-foreground shadow-sm",
          "transition-opacity hover:opacity-90 active:opacity-80",
          className,
        )}
      >
        <BookOpenText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Read larger
      </Button>
    );
  }
  return (
    <div
      role="group"
      aria-label="Text size"
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full border border-primary/40 bg-card",
        "p-0.5 shadow-sm",
        className,
      )}
    >
      <Button
        variant="ghost"
        type="button"
        onClick={() => set(idx - 1)}
        disabled={idx === 0}
        aria-label="Smaller text"
        className="flex h-7 min-h-0 w-7 shrink-0 items-center justify-center rounded-full p-0 text-primary transition-colors hover:bg-primary/15 disabled:opacity-30 [&_svg]:size-3.5"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <span
        className="min-w-9 text-center font-mono text-[0.6875rem] font-semibold text-primary"
        aria-live="polite"
      >
        {Math.round(READ_SCALES[idx] * 100)}%
      </span>
      <Button
        variant="ghost"
        type="button"
        onClick={() => set(idx + 1)}
        disabled={idx === READ_SCALES.length - 1}
        aria-label="Larger text"
        className="flex h-7 min-h-0 w-7 shrink-0 items-center justify-center rounded-full p-0 text-primary transition-colors hover:bg-primary/15 disabled:opacity-30 [&_svg]:size-3.5"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <Button variant="ghost" type="button" onClick={() => setExpanded(false)} className="h-7 min-h-0 rounded-full px-2 text-[0.6875rem] text-primary hover:bg-primary/15">Done</Button>
    </div>
  );
}
