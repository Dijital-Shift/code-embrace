import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyLanes } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/lanes/")({
  head: () => ({ meta: [{ title: "Paths — Kingdom Protocol" }] }),
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
          <Link to="/dashboard" className="text-[#666]">←</Link>
          <h2 className="text-xl font-bold">Paths</h2>
        </div>
        <Link to="/lanes/new" className="px-4 py-2 bg-[#c9a84c] text-black rounded-md font-bold text-xs">+ New Path</Link>
      </div>
      <Link to="/paths/library" className="inline-block mb-8 text-xs text-[#c9a84c] font-semibold">
        Browse path library →
      </Link>


      {isLoading && <p className="text-[#555]">Loading…</p>}
      {!isLoading && lanes.length === 0 && <p className="text-[#444]">No paths yet. Create your first one.</p>}

      {active.length > 0 && (
        <section className="mb-8">
          <p className="text-[0.65rem] text-[#666] uppercase tracking-wider font-semibold mb-3">Active</p>
          <div className="flex flex-col gap-2">
            {active.map((lane) => {
              const hasWatchman = !!lane.partner_id;
              return (
                <Link key={lane.lane_id} to="/lanes/$id" params={{ id: lane.lane_id }} className="flex justify-between items-center gap-3 px-4 py-4 rounded-xl border border-[#2a2518] text-white no-underline" style={{ background: "#161210" }}>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{lane.title}</p>
                    {lane.description && <p className="text-xs text-[#666]">{lane.description}</p>}
                    <p className="text-[0.72rem]" style={{ color: hasWatchman ? "#4ade80" : "#c9a84c" }}>
                      {hasWatchman ? `Watchman: ${lane.partner_email ?? "—"}` : "No Watchman yet — tap to invite"}
                    </p>
                  </div>
                  <span className="text-[0.65rem] px-2 py-1 rounded-full font-semibold uppercase" style={{ background: "#052e16", color: "#4ade80" }}>Active</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {paused.length > 0 && (
        <section>
          <p className="text-[0.65rem] text-[#666] uppercase tracking-wider font-semibold mb-3">Paused</p>
          <div className="flex flex-col gap-2">
            {paused.map((lane) => (
              <Link key={lane.lane_id} to="/lanes/$id" params={{ id: lane.lane_id }} className="flex justify-between items-center px-4 py-4 rounded-xl border border-[#2a2518] text-white opacity-50" style={{ background: "#161210" }}>
                <p className="font-semibold text-sm">{lane.title}</p>
                <span className="text-[0.65rem] px-2 py-1 rounded-full" style={{ background: "#1a1a1a", color: "#555" }}>Paused</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
