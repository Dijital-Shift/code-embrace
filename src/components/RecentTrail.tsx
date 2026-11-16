import { TRAIL_LABEL, trailDayName, type TrailDay } from "@/lib/recent-trail";

/** Three small pips — two days ago, yesterday, today — so a glance shows what each day became. */
export function RecentTrail({ days, today }: { days: TrailDay[]; today: string }) {
  if (!days.length || days.every((d) => d.mark === "none")) return null;
  const summary = days.map((d) => `${trailDayName(d.date, today)}: ${TRAIL_LABEL[d.mark]}`).join(", ");
  return (
    <span className="kp-trail" role="img" aria-label={`Last three days — ${summary}`} title={summary}>
      {days.map((d) => (
        <span key={d.date} className={`kp-trail-day${d.mark === "grace" ? " kp-trail-day-grace" : ""}`}>
          <span className={`kp-trail-pip kp-trail-${d.mark}`} />
          {trailDayName(d.date, today)}
        </span>
      ))}
    </span>
  );
}
