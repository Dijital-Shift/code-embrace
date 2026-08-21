import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getPartnerView, sendEncouragement, dismissWatchmanPrompt } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";
import { WatchmanPushPrompt } from "@/components/WatchmanPushPrompt";


export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [{ title: "Watchman — Kingdom Protocol" }] }),
  component: () => <AppLayout><Partner /></AppLayout>,
});

function Partner() {
  const fn = useServerFn(getPartnerView);
  const sendFn = useServerFn(sendEncouragement);
  const dismissFn = useServerFn(dismissWatchmanPrompt);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["partner"], queryFn: () => fn() });

  const dismissMut = useMutation({
    mutationFn: () => dismissFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner"] }),
  });

  if (isLoading) return <p className="text-[#9e968a]">Loading…</p>;
  const lanes = data?.lanes ?? [];
  const todayCheckins = data?.todayCheckins ?? [];
  const notifications = data?.notifications ?? [];
  const today = new Map(todayCheckins.map((c) => [c.lane_id, c]));
  const active = lanes.filter((l) => l.status === "active");
  const inactive = lanes.filter((l) => l.status !== "active");
  const statusColor: Record<string, string> = { completed: "#4ade80", breached: "#f87171", missed: "#f59e0b", pending: "#333", skipped: "#c9a84c" };

  const showMicroPrompt =
    (data?.myEncouragementCount ?? 0) >= 1 &&
    (data?.myActiveLaneCount ?? 0) === 0 &&
    !data?.dismissedWatchmanPrompt;

  return (
    <div>
      <WatchmanPushPrompt />

      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold mb-1">Your Assignments</h2>
        </div>
        <p className="text-[#a8a094] text-sm">You'll only be pinged when something goes wrong. Silence means they're aligned.</p>
      </div>

      {showMicroPrompt && (
        <div className="p-5 rounded-xl border border-[#c9a84c]/50 mb-6" style={{ background: "linear-gradient(135deg, #1a1408 0%, #0a0800 100%)" }}>
          <p className="font-semibold mb-1 text-[#c9a84c]">You just held someone up.</p>
          <p className="text-xs text-[#c2af80] mb-3">The watch goes both ways — start your own path when you're ready.</p>
          <div className="flex gap-2">
            <Link to="/paths/new" className="inline-block px-4 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold">Start a path</Link>
            <button onClick={() => dismissMut.mutate()} className="text-xs text-[#a8a094] px-3 py-2">Not now</button>
          </div>
        </div>
      )}

      {active.length > 0 && !showMicroPrompt && (data?.myActiveLaneCount ?? 0) === 0 && (
        <div className="p-5 rounded-xl border border-[#2a2000] mb-8" style={{ background: "#0a0800" }}>
          <p className="font-semibold mb-1 text-[#c9a84c]">You're holding someone up. Who's holding you?</p>
          <p className="text-xs text-[#a8a094] mb-3">The watch goes both ways. Start your own path when you're ready — no rush.</p>
          <Link to="/paths/new" className="inline-block px-5 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold">Start a path of your own</Link>
        </div>
      )}

      {lanes.length === 0 && (
        <div className="text-center pt-12">
          <p className="text-[#9e968a] text-sm mb-4">No paths assigned to you yet.</p>
          <Link to="/paths/new" className="inline-block px-5 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold">Set up your own</Link>
        </div>
      )}

      {active.length > 0 && (
        <section className="mb-10">
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-3 font-semibold">Active ({active.length})</p>

          <div className="flex flex-col gap-3">
            {active.map((lane) => {
              const c = today.get(lane.lane_id);
              const todayLabel = c ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : "Pending";
              const todayCol = c ? statusColor[c.status] ?? "#333" : "#f59e0b";
              const needsContact = c?.status === "breached" || c?.status === "missed";
              const phone = lane.owner?.phone;
              const rel = (lane as any).partner_relationship as string | null | undefined;
              return (
                <div key={lane.lane_id} className="p-4 rounded-lg border border-[#1a1a1a]" style={{ background: "#0d0d0d" }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-sm mb-1">{lane.title}</p>
                      <p className="text-xs text-[#948d80]">
                        {rel && <span className="text-[#c9a84c] font-semibold">{rel} · </span>}
                        {lane.owner?.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.7rem] text-[#948d80] mb-1">Today</p>
                      <p className="text-xs font-semibold" style={{ color: todayCol }}>{todayLabel}</p>
                    </div>
                  </div>
                  {lane.notes && (
                    <div className="mb-3 pl-2.5 border-l-2 border-[#c9a84c]/50">
                      <p className="text-[0.6rem] uppercase tracking-wider text-[#c9a84c] font-semibold mb-0.5">Notes from them</p>
                      <p className="text-xs text-[#ded8cc] whitespace-pre-wrap">{lane.notes}</p>
                    </div>
                  )}
                  {c?.status === "breached" && c.breach_explanation && (
                    <div className="p-2.5 rounded mb-3 border border-[#3d1515]" style={{ background: "#1a0a0a" }}>
                      <p className="text-[0.7rem] text-[#f87171] font-semibold mb-1">Breach explanation</p>
                      <p className="text-xs text-[#ded8cc]">{c.breach_explanation}</p>
                    </div>
                  )}
                  {needsContact && phone && (
                    <div className="flex items-center gap-2 mb-3">
                      <a href={`tel:${phone}`} className="px-5 py-2 rounded text-sm font-semibold bg-white text-black border border-[#222]">Call</a>
                      <a href={`sms:${phone}`} className="px-5 py-2 rounded text-sm font-semibold text-white border border-[#222]" style={{ background: "#1a1a1a" }}>Text</a>
                      <span className="text-xs text-[#948d80] ml-1">{phone}</span>
                    </div>
                  )}
                  {needsContact && !phone && <p className="text-xs text-[#9e968a] mb-3">No phone number on file — reach out another way.</p>}
                  <EncourageBox laneId={lane.lane_id} send={sendFn} onSent={() => qc.invalidateQueries({ queryKey: ["partner"] })} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section className="mb-10">
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-3 font-semibold">Inactive</p>
          <div className="flex flex-col gap-3">
            {inactive.map((lane) => (
              <div key={lane.lane_id} className="p-4 rounded-lg border border-[#1a1a1a] opacity-60" style={{ background: "#0d0d0d" }}>
                <p className="font-semibold text-sm">{lane.title}</p>
                <p className="text-xs text-[#948d80]">{lane.owner?.email}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(data?.sentEncouragements ?? []).length > 0 && (
        <section className="mb-10">
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-3 font-semibold">Recent encouragements sent</p>
          <div className="flex flex-col gap-3">
            {(data?.sentEncouragements ?? []).map((e: any) => (
              <div key={e.id} className="p-4 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
                <div className="flex justify-between items-center mb-1.5 gap-3">
                  <span className="text-xs font-semibold text-[#c9a84c] truncate">{e.lane_title}</span>
                  <span className="text-[0.7rem] text-[#a8a094] shrink-0">
                    {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="text-xs text-[#ded8cc] leading-relaxed whitespace-pre-wrap">{e.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}


      {notifications.length > 0 && (
        <section>
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-3 font-semibold">Alert History</p>
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <div key={n.notification_id} className="p-4 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[0.7rem] px-2 py-0.5 rounded" style={{ background: n.type === "breach_report" ? "#2d0d0d" : "#1a1200", color: n.type === "breach_report" ? "#f87171" : "#f59e0b" }}>
                    {n.type === "breach_report" ? "Breach" : n.type === "encouragement" ? "Encouragement" : "Missed"}
                  </span>
                  <span className="text-[0.7rem] text-[#948d80]">
                    {n.sent_at ? new Date(n.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-[#b8b0a4] leading-relaxed">{n.message_content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EncourageBox({ laneId, send, onSent }: { laneId: string; send: any; onSent: () => void }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true); setErr(null);
    const r = await send({ data: { laneId, body: body.trim() } });
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    setBody(""); setSent(true);
    setTimeout(() => setSent(false), 2500);
    onSent();
  }

  return (
    <form onSubmit={submit} className="mt-2 pt-3 border-t border-[#1a1a1a]">
      <p className="text-[0.6rem] uppercase tracking-wider text-[#a8a094] font-semibold mb-2">Send encouragement</p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value.slice(0, 280))}
        rows={2}
        placeholder="A verse, a line, a prayer. They'll see it."
        className="w-full px-3 py-2 text-base bg-[#0a0800] border border-[#2a2518] rounded text-white outline-none resize-none"
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-[0.65rem] text-[#948d80]">{body.length}/280</span>
        <button disabled={busy || !body.trim()} className="text-xs px-4 py-1.5 bg-[#c9a84c] text-black rounded font-semibold disabled:opacity-40">
          {busy ? "Sending…" : sent ? "Sent" : "Send"}
        </button>
      </div>
      {err && <p className="text-red-400 text-[0.7rem] mt-1">{err}</p>}
    </form>
  );
}
