import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStandingDetail } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";
import { statusColor, statusLabel } from "@/lib/status";

export const Route = createFileRoute("/standing")({
  head: () => ({
    meta: [
      { title: "Standing & Fallen — Kingdom Protocol" },
      { name: "description", content: "Every path, day by day — the days you held and the days you fell." },
    ],
  }),
  component: () => <AppLayout><StandingPage /></AppLayout>,
});

function StandingPage() {
  const fn = useServerFn(getStandingDetail);
  const { data, isLoading } = useQuery({ queryKey: ["standing-detail"], queryFn: () => fn() });

  if (isLoading) return <p className="text-[#9e968a]">Loading…</p>;
  const lanes = data?.lanes ?? [];
  const checkins = data?.checkins ?? [];
  const byLane = new Map<string, { checkin_date: string; status: string }[]>();
  for (const c of checkins) {
    const arr = byLane.get(c.lane_id) ?? [];
    arr.push({ checkin_date: c.checkin_date, status: c.status });
    byLane.set(c.lane_id, arr);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link to="/dashboard" className="text-[#a8a094]">←</Link>
        <h2 className="text-xl font-bold">Standing &amp; Fallen</h2>
      </div>
      <p className="text-[#b8b0a4] text-sm mb-8">Every path, day by day. Held days and fallen days, side by side.</p>

      {lanes.length === 0 ? (
        <p className="text-[#a8a094] text-sm">No paths yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {lanes.map((l) => {
            const rows = byLane.get(l.lane_id) ?? [];
            const held = rows.filter((r) => r.status === "completed").length;
            const fell = rows.filter((r) => r.status === "breached" || r.status === "missed").length;
            return (
              <div key={l.lane_id} className="p-5 rounded-xl border border-[#2a2518]" style={{ background: "#161210" }}>
                <div className="flex items-center justify-between mb-3">
                  <Link to="/paths/$id" params={{ id: l.lane_id }} search={{ newlyCreated: false }} className="text-sm font-semibold text-white no-underline">
                    {l.title}
                  </Link>
                  <span className="text-xs">
                    <span className="text-[#4ade80] font-semibold">{held}</span>
                    <span className="text-[#948d80]"> held · </span>
                    <span className="text-[#f87171] font-semibold">{fell}</span>
                    <span className="text-[#948d80]"> fallen</span>
                  </span>
                </div>
                {rows.length === 0 ? (
                  <p className="text-[#948d80] text-xs">No check-ins yet.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {rows.map((r) => (
                      <div key={r.checkin_date} className="flex justify-between px-3 py-2 rounded border border-[#2a2518]" style={{ background: "#12100c" }}>
                        <span className="text-sm text-[#ded8cc]">{r.checkin_date}</span>
                        <span className="text-xs" style={{ color: statusColor(r.status) }}>{statusLabel(r.status)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[0.7rem] italic text-[#a8a094] mt-8">
        For a just man falleth seven times, and riseth up again. — Proverbs 24:16 (KJV)
      </p>
    </div>
  );
}
