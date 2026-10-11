import { useState } from "react";
import { statusColor, statusLabel } from "@/lib/status";

type Chk = { checkin_date: string; status: string; breach_explanation?: string | null };

function fmt(d: string) {
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** 14 squares, oldest left → newest right. Tap one to see that day. */
export function LineageTimeline({ checkins }: { checkins: Chk[] }) {
  const days = [...checkins].slice(0, 14).reverse();
  const [sel, setSel] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const picked = days.find((d) => d.checkin_date === sel);

  if (days.length === 0) return <p className="text-[#948d80] text-sm">No check-ins yet.</p>;

  return (
    <div>
      <div className="kp-card p-4">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {days.map((d) => {
            const c = statusColor(d.status);
            const on = sel === d.checkin_date;
            return (
              <button
                key={d.checkin_date}
                type="button"
                onClick={() => setSel(on ? null : d.checkin_date)}
                aria-label={`${fmt(d.checkin_date)}: ${statusLabel(d.status)}`}
                className="aspect-square rounded-[4px] !min-h-0 p-0"
                style={{
                  background: `${c}cc`,
                  outline: on ? "2px solid #e5af38" : "none",
                  outlineOffset: 2,
                  boxShadow: on ? `0 0 10px ${c}` : "none",
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[0.6rem] text-[#8a8276] mt-2 uppercase tracking-wider">
          <span>{fmt(days[0].checkin_date)}</span>
          <span>{fmt(days[days.length - 1].checkin_date)}</span>
        </div>
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
      <button type="button" onClick={() => setFull((v) => !v)} className="mt-2 text-xs text-[#c9a84c] font-semibold !min-h-0 py-1">
        {full ? "Hide full history" : "Show full history"}
      </button>
      {full && (
        <div className="flex flex-col gap-1.5 mt-2">
          {checkins.map((c) => (
            <div key={c.checkin_date} className="kp-card flex justify-between px-3 py-2">
              <span className="text-sm">{fmt(c.checkin_date)}</span>
              <span className="text-xs" style={{ color: statusColor(c.status) }}>{statusLabel(c.status)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
