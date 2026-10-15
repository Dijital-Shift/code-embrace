import { statusColor } from "@/lib/status";

/** One segment per active path, colored by tonight's status. */
export function DayProgressBar({ statuses }: { statuses: string[] }) {
  const total = statuses.length;
  const held = statuses.filter((s) => s === "completed").length;
  const open = statuses.filter((s) => s === "pending").length;
  return (
    <div className="mb-5">
      <div className="flex gap-1">
        {statuses.map((s, i) => (
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
      <p className="text-[0.72rem] text-[#a8a094] mt-2">
        {open === 0 ? "All answered. Stay aligned." : `${held} of ${total} held tonight`}
      </p>
    </div>
  );
}

/** Filled dot = active Watchman, outlined = invite pending, faint ring = empty seat. */
export function WatchmanPips({ active, pending }: { active: number; pending: number }) {
  if (active + pending === 0) {
    return (
      <span className="flex items-center gap-1" aria-label="No Watchman yet">
        {[0, 1].map((i) => (
          <span key={`e${i}`} className="w-2 h-2 rounded-full border border-[#c9a84c]/25" />
        ))}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1" aria-label={`${active} watchman active, ${pending} pending`}>
      {Array.from({ length: active }).map((_, i) => (
        <span key={`a${i}`} className="w-2 h-2 rounded-full" style={{ background: "#e5af38", boxShadow: "0 0 6px #e5af3877" }} />
      ))}
      {Array.from({ length: pending }).map((_, i) => (
        <span key={`p${i}`} className="w-2 h-2 rounded-full border border-[#c9a84c]" />
      ))}
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
