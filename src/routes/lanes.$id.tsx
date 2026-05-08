import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getLane, updateLaneStatus, deleteLane } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/lanes/$id")({
  component: () => <AppLayout><LaneDetail /></AppLayout>,
});

function LaneDetail() {
  const { id } = Route.useParams();
  const getFn = useServerFn(getLane);
  const statusFn = useServerFn(updateLaneStatus);
  const deleteFn = useServerFn(deleteLane);
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["lane", id], queryFn: () => getFn({ data: { id } }) });

  const setStatus = useMutation({
    mutationFn: (status: "active" | "paused" | "archived") => statusFn({ data: { id, status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lane", id] }),
  });
  const del = useMutation({
    mutationFn: () => deleteFn({ data: { id } }),
    onSuccess: (r: any) => {
      if (r?.error) setErr(r.error);
      else window.location.href = "/lanes";
    },
  });

  if (isLoading) return <p className="text-[#555]">Loading…</p>;
  const lane = data?.lane;
  if (!lane) return <p>Not found.</p>;

  const checkins = data?.checkins ?? [];
  const ageMin = (Date.now() - new Date(lane.created_at).getTime()) / 60000;
  const canDelete = ageMin <= 10 && checkins.length === 0;
  const statusColor: Record<string, string> = { completed: "#4ade80", breached: "#f87171", missed: "#f59e0b", skipped: "#c9a84c", pending: "#444" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/lanes" className="text-[#555] text-sm">← Lanes</Link>
          <h2 className="text-xl font-bold">{lane.title}</h2>
        </div>
      </div>

      <div className="p-5 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
        {lane.description && <p className="text-[#888] text-sm mb-3">{lane.description}</p>}
        {(lane.support_scripture ?? []).filter(Boolean).map((s, i) => (
          <p key={i} className="text-[#c9a84c] text-xs italic mb-1">{i + 1}. "{s}"</p>
        ))}
        <p className="text-xs text-[#666] mt-2">Partner: <span className="text-[#ccc]">{data?.partnerEmail ?? lane.partner_email ?? "—"}</span></p>
        <p className="text-xs text-[#666]">Status: <span className="capitalize" style={{ color: lane.status === "active" ? "#4ade80" : "#888" }}>{lane.status}</span></p>
      </div>

      <div className="mt-8 flex gap-2 flex-wrap">
        {lane.status !== "active" && (
          <button onClick={() => setStatus.mutate("active")} className="px-4 py-2 bg-white text-black rounded-md text-xs font-semibold">Set Active</button>
        )}
        {lane.status === "active" && (
          <button onClick={() => setStatus.mutate("paused")} className="px-4 py-2 rounded-md text-xs font-semibold border border-[#222] text-[#888]" style={{ background: "#2a2518" }}>Pause</button>
        )}
        {lane.status !== "archived" && (
          <button onClick={() => setStatus.mutate("archived")} className="px-4 py-2 rounded-md text-xs font-semibold border border-[#222] text-[#f87171]" style={{ background: "#2a2518" }}>Archive</button>
        )}
        {canDelete && (
          <button onClick={() => confirm("Delete this lane?") && del.mutate()} className="px-4 py-2 rounded-md text-xs font-semibold border border-[#222] text-[#f87171]" style={{ background: "#1a0a0a" }}>Delete</button>
        )}
      </div>
      {err && <p className="text-red-400 text-xs mt-2">{err}</p>}

      <div className="mt-8">
        <p className="text-[0.65rem] text-[#666] uppercase tracking-wider font-semibold mb-3">Last 14 Days</p>
        {checkins.length === 0 ? (
          <p className="text-[#444] text-sm">No check-ins yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {checkins.map((c) => (
              <div key={c.checkin_date} className="flex justify-between px-3 py-2 rounded border border-[#2a2518]" style={{ background: "#161210" }}>
                <span className="text-sm">{c.checkin_date}</span>
                <span className="text-xs capitalize" style={{ color: statusColor[c.status] ?? "#444" }}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
