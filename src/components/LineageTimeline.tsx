import { useRef, useState } from "react";
import { statusColor, statusLabel } from "@/lib/status";
import { PathHistoryCalendar, type HistoryWord } from "@/components/PathHistoryCalendar";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

type Chk = { checkin_date: string; status: string; breach_explanation?: string | null };

function fmt(d: string) {
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** 14 squares, oldest left → newest right. Only days with a breach note are tappable. */
export function LineageTimeline({ checkins, words, startDate, today, renderWord }: { checkins: Chk[]; words: HistoryWord[]; startDate: string; today: string; renderWord: (word: HistoryWord) => ReactNode }) {
  const days = [...checkins].slice(0, 14).reverse();
  const [sel, setSel] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const fullRef = useRef<HTMLDivElement | null>(null);
  const picked = days.find((d) => d.checkin_date === sel);

  const toggleFull = () => {
    setFull((v) => {
      const next = !v;
      if (next) {
        // Bring the whole calendar into view once it has rendered.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => fullRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
        });
      }
      return next;
    });
  };

  return (
    <div>
      {days.length === 0 ? <p className="text-sm text-muted-foreground">No check-ins yet.</p> : (
      <div className="kp-card p-4">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {days.map((d) => {
            const c = statusColor(d.status);
            const on = sel === d.checkin_date;
            const label = `${fmt(d.checkin_date)}: ${statusLabel(d.status)}`;
            const style = {
              background: `${c}cc`,
              outline: on ? "2px solid #e5af38" : "none",
              outlineOffset: 2,
              boxShadow: on ? `0 0 10px ${c}` : "none",
            };
            if (!d.breach_explanation) {
              return <div key={d.checkin_date} title={label} aria-label={label} className="aspect-square rounded-[4px]" style={style} />;
            }
            return (
              <button
                key={d.checkin_date}
                type="button"
                onClick={() => setSel(on ? null : d.checkin_date)}
                aria-label={`${label} — read note`}
                className="relative aspect-square rounded-[4px] !min-h-0 p-0"
                style={style}
              >
                <span className="absolute top-[2px] right-[2px] w-1 h-1 rounded-full bg-[#fff3d6]" />
              </button>
            );
          })}
        </div>
        <div className="flex justify-between text-[0.6rem] text-[#8a8276] mt-2 uppercase tracking-wider">
          <span>{fmt(days[0].checkin_date)}</span>
          <span>{fmt(days[days.length - 1].checkin_date)}</span>
        </div>
        {!picked && days.some((d) => d.breach_explanation) && (
          <p className="text-[0.65rem] text-[#8a8276] mt-2">Squares with a dot hold a breach note — tap to read it.</p>
        )}
        {picked && (
          <div className="mt-3 pt-3 border-t border-[#2a2518]">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#e8dfc4]">{fmt(picked.checkin_date)}</span>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: statusColor(picked.status) }}>
                {statusLabel(picked.status)}
              </span>
            </div>
            {picked.breach_explanation && (
              <p className="text-xs text-[#b8b0a4] mt-2 pl-3 border-l-2 border-[#f87171]/60 whitespace-pre-wrap">{picked.breach_explanation}</p>
            )}
          </div>
        )}
      </div>
      )}
      <Button type="button" variant="link" onClick={() => setFull((v) => !v)} aria-expanded={full} className="mt-2 px-0 text-xs text-primary font-semibold">
        {full ? "Hide full history" : "Show full history"}
      </Button>
      {full && (
        <PathHistoryCalendar checkins={checkins} words={words} startDate={startDate} today={today} renderWord={renderWord} />
      )}
    </div>
  );
}
