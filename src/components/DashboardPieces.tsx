import { seatPips } from "@/lib/watchman-coverage";
import { orderBarStatuses, statusColor } from "@/lib/status";

/** One segment per active path, settled ones filled from the left. */
export function DayProgressBar({ statuses }: { statuses: string[] }) {
  const ordered = orderBarStatuses(statuses);
  return (
    <div className="mb-5">
      <div className="flex gap-1">
        {ordered.map((s, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors duration-500"
            style={{
              background: s === "pending" ? "#2a2518" : statusColor(s),
              boxShadow: s === "pending" ? "none" : `0 0 8px ${statusColor(s)}55`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Always two pips — one per seat. Filled = manned, outlined = link out, faint = empty. */
export function WatchmanPips({ active, pending }: { active: number; pending: number }) {
  const pips = seatPips(active, pending);
  const manned = pips.filter((p) => p === "manned").length;
  const waiting = pips.filter((p) => p === "pending").length;
  return (
    <span className="flex items-center gap-1" aria-label={`${manned} of 2 Watchmen${waiting ? `, ${waiting} invite pending` : ""}`}>
      {pips.map((p, i) =>
        p === "manned" ? (
          <span key={i} className="w-2 h-2 rounded-full" style={{ background: "#e5af38", boxShadow: "0 0 6px #e5af3877" }} />
        ) : p === "pending" ? (
          <span key={i} className="w-2 h-2 rounded-full border border-[#c9a84c]" />
        ) : (
          <span key={i} className="w-2 h-2 rounded-full border border-[#c9a84c]/25" />
        ),
      )}
    </span>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-32 bg-[#1a1408] rounded mb-2" />
      <div className="h-8 w-44 bg-[#1a1408] rounded mb-7" />
      <div className="h-1.5 bg-[#1a1408] rounded-full mb-6" />
      <div className="kp-card h-20 mb-8" />
      {[0, 1, 2].map((i) => <div key={i} className="kp-card h-16 mb-2" />)}
    </div>
  );
}
