import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyLanes } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";
import { WatchmanPips } from "@/components/DashboardPieces";
import { pathStartLabel } from "@/lib/path-start";

export const Route = createFileRoute("/paths/")({
  head: () => ({ meta: [
    { title: "Paths — Kingdom Protocol" },
    { name: "description", content: "Review your active and resting accountability Paths." },
    { property: "og:title", content: "Paths — Kingdom Protocol" },
    { property: "og:description", content: "Review your active and resting accountability Paths." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => {
    if (typeof window === "undefined") return;
    void context.queryClient.prefetchQuery({ queryKey: ["lanes"], queryFn: () => listMyLanes() });
  },
  component: () => <AppLayout><Lanes /></AppLayout>,
});

function Lanes() {
  const fn = useServerFn(listMyLanes);
  const { data: lanes = [], isLoading } = useQuery({ queryKey: ["lanes"], queryFn: () => fn() });
  const active = lanes.filter((l) => l.status === "active");
  const paused = lanes.filter((l) => l.status === "paused");

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" aria-label="Back" className="text-[#a8a094] hover:text-[#c9a84c] transition-colors">←</Link>
          <h2 className="text-2xl tracking-wide text-[#f3e6c4]" style={{ fontFamily: "Cinzel, serif" }}>Paths</h2>
        </div>
        <Link to="/paths/new" className="px-4 py-2 bg-[#c9a84c] text-black rounded-md font-bold text-xs">+ New Path</Link>
      </div>
      <Link to="/paths/library" className="inline-block mb-8 text-xs text-[#c9a84c] font-semibold">
        Browse path library →
      </Link>


      {isLoading && <p className="text-[#9e968a]">Loading…</p>}
      {!isLoading && lanes.length === 0 && <p className="text-[#948d80]">No paths yet. Create your first one.</p>}

      {active.length > 0 && (
        <section className="mb-8">
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider font-semibold mb-3">Active</p>
          <div className="flex flex-col gap-2">
            {active.map((lane) => {
              const names = ((lane as any).watchman_names ?? []) as string[];
              const hasWatchman = names.length > 0;
              return (
                <Link key={lane.lane_id} to="/paths/$id" params={{ id: lane.lane_id }} search={{ newlyCreated: false }} className="relative overflow-hidden kp-card flex justify-between items-center gap-3 px-4 py-4 text-white no-underline transition-colors hover:border-[#c9a84c]/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug flex items-center gap-2">
                      <span className="truncate">{lane.title}</span>
                      <span className="text-[0.62rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.1em] shrink-0 border" style={lane.lane_type === "avoid"
                        ? { background: "#201008", color: "#e0a075", borderColor: "rgba(224,160,117,0.35)" }
                        : { background: "#0c2010", color: "#6ee7a0", borderColor: "rgba(110,231,160,0.3)" }}>
                        {lane.lane_type === "avoid" ? "Flee" : "Pursue"}
                      </span>
                      {((lane as any).unread_encouragements ?? 0) > 0 && (
                        <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-[0.1em] shrink-0" style={{ background: "rgba(201,168,76,0.12)", color: "#e5af38", border: "1px solid rgba(201,168,76,0.5)" }}>New</span>
                      )}
                    </p>
                    {lane.description && <p className="text-xs text-[#b8b0a4] leading-relaxed mt-1 mb-1.5 line-clamp-2">{lane.description}</p>}
                    <p className="text-[0.72rem]" style={{ color: hasWatchman ? "#4ade80" : "#c9a84c" }}>
                      {hasWatchman
                        ? `${names.length > 1 ? "Watchmen" : "Watchman"}: ${names.join(", ")}`
                        : "No Watchman yet — tap to invite"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <WatchmanPips active={names.length} pending={0} />
                    {lane.upcoming ? <span className="text-xs text-stone border border-border rounded-md px-2 py-1 max-w-24 text-center">{pathStartLabel(lane.starts_at ?? '', lane.ownerToday)}</span> : <span className="text-[0.62rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.1em] border" style={{ background: "#0c2010", color: "#6ee7a0", borderColor: "rgba(110,231,160,0.3)" }}>Active</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {paused.length > 0 && (
        <section>
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider font-semibold mb-3">Paused</p>
          <div className="flex flex-col gap-2">
            {paused.map((lane) => (
              <Link key={lane.lane_id} to="/paths/$id" params={{ id: lane.lane_id }} search={{ newlyCreated: false }} className="kp-card flex justify-between items-center px-4 py-4 text-white opacity-60 no-underline">
                <p className="font-semibold text-sm">{lane.title}</p>
                <span className="text-[0.62rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.1em] border" style={{ background: "#16130e", color: "#a8a094", borderColor: "#2a2518" }}>Paused</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
