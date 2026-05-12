import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPartnerView } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [{ title: "Watchman — Kingdom Protocol" }] }),
  component: () => <AppLayout><Partner /></AppLayout>,
});

function Partner() {
  const fn = useServerFn(getPartnerView);
  const { data, isLoading } = useQuery({ queryKey: ["partner"], queryFn: () => fn() });

  if (isLoading) return <p className="text-[#555]">Loading…</p>;
  const lanes = data?.lanes ?? [];
  const todayCheckins = data?.todayCheckins ?? [];
  const notifications = data?.notifications ?? [];
  const today = new Map(todayCheckins.map((c) => [c.lane_id, c]));
  const active = lanes.filter((l) => l.status === "active");
  const inactive = lanes.filter((l) => l.status !== "active");
  const statusColor: Record<string, string> = { completed: "#4ade80", breached: "#f87171", missed: "#f59e0b", pending: "#333", skipped: "#c9a84c" };

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold mb-1">Your Assignments</h2>
        </div>
        <p className="text-[#666] text-sm">You'll only be notified when something goes wrong. Silence means they're aligned.</p>
      </div>

      {data?.showNudge && active.length > 0 && (
        <div className="p-5 rounded-xl border border-[#2a2000] mb-8" style={{ background: "#0a0800" }}>
          <p className="font-semibold mb-1 text-[#c9a84c]">You're holding someone accountable. Who's holding you?</p>
          <p className="text-xs text-[#666] mb-3">Create your own lane and assign a Watchman.</p>
          <Link to="/lanes/new" className="inline-block px-5 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold">Create a Lane</Link>
        </div>
      )}

      {lanes.length === 0 && (
        <div className="text-center pt-12">
          <p className="text-[#555] text-sm mb-4">No lanes assigned to you yet.</p>
          <Link to="/lanes/new" className="inline-block px-5 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold">Set up your own</Link>
        </div>
      )}

      {active.length > 0 && (
        <section className="mb-10">
          <p className="text-[0.65rem] text-[#666] uppercase tracking-wider mb-3 font-semibold">Active ({active.length}/2)</p>
          <div className="flex flex-col gap-3">
            {active.map((lane) => {
              const c = today.get(lane.lane_id);
              const todayLabel = c ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : "Pending";
              const todayCol = c ? statusColor[c.status] ?? "#333" : "#f59e0b";
              const needsContact = c?.status === "breached" || c?.status === "missed";
              const phone = lane.owner?.phone;
              return (
                <div key={lane.lane_id} className="p-4 rounded-lg border border-[#1a1a1a]" style={{ background: "#0d0d0d" }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-sm mb-1">{lane.title}</p>
                      <p className="text-xs text-[#444]">{lane.owner?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.7rem] text-[#444] mb-1">Today</p>
                      <p className="text-xs font-semibold" style={{ color: todayCol }}>{todayLabel}</p>
                    </div>
                  </div>
                  {c?.status === "breached" && c.breach_explanation && (
                    <div className="p-2.5 rounded mb-3 border border-[#3d1515]" style={{ background: "#1a0a0a" }}>
                      <p className="text-[0.7rem] text-[#f87171] font-semibold mb-1">Breach explanation</p>
                      <p className="text-xs text-[#ccc]">{c.breach_explanation}</p>
                    </div>
                  )}
                  {needsContact && phone && (
                    <div className="flex items-center gap-2">
                      <a href={`tel:${phone}`} className="px-5 py-2 rounded text-sm font-semibold bg-white text-black border border-[#222]">Call</a>
                      <a href={`sms:${phone}`} className="px-5 py-2 rounded text-sm font-semibold text-white border border-[#222]" style={{ background: "#1a1a1a" }}>Text</a>
                      <span className="text-xs text-[#444] ml-1">{phone}</span>
                    </div>
                  )}
                  {needsContact && !phone && <p className="text-xs text-[#555]">No phone number on file — reach out another way.</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section className="mb-10">
          <p className="text-[0.65rem] text-[#666] uppercase tracking-wider mb-3 font-semibold">Inactive</p>
          <div className="flex flex-col gap-3">
            {inactive.map((lane) => (
              <div key={lane.lane_id} className="p-4 rounded-lg border border-[#1a1a1a] opacity-60" style={{ background: "#0d0d0d" }}>
                <p className="font-semibold text-sm">{lane.title}</p>
                <p className="text-xs text-[#444]">{lane.owner?.email}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {notifications.length > 0 && (
        <section>
          <p className="text-[0.65rem] text-[#666] uppercase tracking-wider mb-3 font-semibold">Alert History</p>
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div key={n.notification_id} className="p-4 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[0.7rem] px-2 py-0.5 rounded" style={{ background: n.type === "breach_report" ? "#2d0d0d" : "#1a1200", color: n.type === "breach_report" ? "#f87171" : "#f59e0b" }}>
                    {n.type === "breach_report" ? "Breach" : "Missed"}
                  </span>
                  <span className="text-[0.7rem] text-[#444]">
                    {n.sent_at ? new Date(n.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-[#888] leading-relaxed">{n.message_content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
