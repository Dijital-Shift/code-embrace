import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getCheckinPage, logComplete, revertComplete, submitCheckin, skipCheckin } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";
import { AccessGate, AccessBanner } from "@/components/AccessBanner";

export const Route = createFileRoute("/checkin")({
  head: () => ({ meta: [{ title: "Check-In — Kingdom Protocol" }] }),
  component: () => <AppLayout><CheckIn /></AppLayout>,
});

function CheckIn() {
  const fn = useServerFn(getCheckinPage);
  const { data, isLoading } = useQuery({ queryKey: ["checkin"], queryFn: () => fn() });

  if (isLoading) return <p className="text-[#555]">Loading…</p>;
  const lanes = data?.lanes ?? [];
  const checkins = data?.checkins ?? [];
  const today = data?.today ?? "";
  const yest = data?.yesterday ?? "";

  const todayMap = new Map(checkins.filter((c) => c.checkin_date === today).map((c) => [c.lane_id, c]));
  const missedYMap = new Map(checkins.filter((c) => c.checkin_date === yest && c.status === "missed").map((c) => [c.lane_id, c]));

  const completeLanes = lanes.filter((l) => l.lane_type === "complete");
  const avoidLanes = lanes.filter((l) => l.lane_type === "avoid");
  const completePending = completeLanes.filter((l) => !todayMap.has(l.lane_id));
  const completeDone = completeLanes.filter((l) => todayMap.has(l.lane_id));
  const avoidLate = avoidLanes.filter((l) => missedYMap.has(l.lane_id) && !todayMap.has(l.lane_id));
  const avoidPending = avoidLanes.filter((l) => !todayMap.has(l.lane_id) && !missedYMap.has(l.lane_id));
  const avoidDone = avoidLanes.filter((l) => todayMap.has(l.lane_id));
  const allDone = completePending.length === 0 && avoidPending.length === 0 && avoidLate.length === 0;

  if (!lanes.length) {
    return (
      <div className="text-center pt-16">
        <p className="text-[#555] mb-4">No active paths.</p>
        <Link to="/lanes/new" className="px-5 py-2 bg-white text-black rounded font-semibold">Create a Path</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link to="/dashboard" className="text-[#666]">←</Link>
        <h2 className="text-xl font-bold">Check-In</h2>
      </div>
      <p className="text-[#666] text-xs mb-8">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

      <AccessBanner />
      <AccessGate action="Checking in">
        <></>
      </AccessGate>

      {allDone && (
        <div className="p-5 rounded-xl border border-[#166534] mb-8" style={{ background: "linear-gradient(135deg, #052e16 0%, #031a0d 100%)" }}>
          <p className="font-semibold text-[#4ade80]">All paths checked in.</p>
          <p className="text-xs text-[#555]">Walk on.</p>
        </div>
      )}


      {completeLanes.length > 0 && (
        <section className="mb-8">
          <p className="text-[0.65rem] text-[#666] uppercase tracking-wider mb-2 font-semibold">Complete</p>
          <div className="flex flex-col gap-2">
            {completePending.map((l) => <CompleteRow key={l.lane_id} laneId={l.lane_id} title={l.title} done={false} />)}
            {completeDone.map((l) => <CompleteRow key={l.lane_id} laneId={l.lane_id} title={l.title} done />)}
          </div>
        </section>
      )}

      {avoidLate.length > 0 && (
        <section className="mb-8">
          <p className="text-[0.65rem] text-[#f59e0b] uppercase tracking-wider mb-2 font-semibold">Missed Yesterday — Submit Before 7AM</p>
          <div className="flex flex-col gap-2">
            {avoidLate.map((l) => <AvoidForm key={l.lane_id} lane={l} isLate />)}
          </div>
        </section>
      )}

      {avoidLanes.length > 0 && (avoidPending.length > 0 || avoidDone.length > 0) && (
        <section className="mb-8">
          <p className="text-[0.65rem] text-[#666] uppercase tracking-wider mb-2 font-semibold">Avoid</p>
          <div className="flex flex-col gap-2">
            {avoidPending.map((l) => <AvoidForm key={l.lane_id} lane={l} />)}
            {avoidDone.map((l) => {
              const c = todayMap.get(l.lane_id)!;
              const color = c.status === "completed" ? "#4ade80" : "#f87171";
              return (
                <div key={l.lane_id} className="flex justify-between items-center px-4 py-3.5 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
                  <span className="text-sm">{l.title}</span>
                  <span className="text-xs capitalize" style={{ color }}>{c.status === "completed" ? "Aligned" : "Breach"}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function CompleteRow({ laneId, title, done: doneInit }: { laneId: string; title: string; done: boolean }) {
  const qc = useQueryClient();
  const log = useServerFn(logComplete);
  const revert = useServerFn(revertComplete);
  const skip = useServerFn(skipCheckin);
  const [done, setDone] = useState(doneInit);
  const [skipped, setSkipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completedAt, setCompletedAt] = useState<number | null>(doneInit ? Date.now() : null);
  const canRevert = done && completedAt && (Date.now() - completedAt) / 60000 <= 30;

  async function tap() {
    if (done || busy) return;
    setBusy(true);
    await log({ data: { laneId } });
    setBusy(false);
    setDone(true);
    setCompletedAt(Date.now());
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }
  async function undo() {
    setBusy(true);
    const r: any = await revert({ data: { laneId } });
    setBusy(false);
    if (!r?.error) { setDone(false); setCompletedAt(null); qc.invalidateQueries({ queryKey: ["dashboard"] }); }
  }
  async function doSkip() {
    setBusy(true);
    await skip({ data: { laneId } });
    setBusy(false);
    setSkipped(true);
  }

  if (skipped) {
    return <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-[#3d2c00]" style={{ background: "#0d0a00" }}><span className="text-[#c9a84c]">{title} — Sabbath</span></div>;
  }

  return (
    <div>
      <button onClick={tap} disabled={done || busy} className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left"
        style={{ background: done ? "linear-gradient(135deg, #052e16 0%, #031a0d 100%)" : "#161210", border: `1px solid ${done ? "#166534" : "#2a2518"}` }}>
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ border: `2px solid ${done ? "#4ade80" : "#333"}`, background: done ? "#4ade80" : "transparent", color: "#000" }}>
          {done ? "✓" : busy ? "…" : ""}
        </span>
        <span className="flex-1" style={{ color: done ? "#4ade80" : "#fff" }}>{title}</span>
        {done && <span className="text-[#4ade80] text-xs">Done</span>}
      </button>
      {canRevert && <button onClick={undo} className="text-[#555] text-[0.72rem] underline mr-3">Undo (within 30 min)</button>}
      {!done && <button onClick={doSkip} className="text-[#4a3a10] text-[0.72rem] underline">Skip — Sabbath</button>}
    </div>
  );
}

function AvoidForm({ lane, isLate = false }: { lane: { lane_id: string; title: string; description?: string | null }; isLate?: boolean }) {
  const submit = useServerFn(submitCheckin);
  const skip = useServerFn(skipCheckin);
  const [resp, setResp] = useState<"aligned" | "breach" | null>(null);
  const [explanation, setExplanation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resp) return;
    setBusy(true); setErr(null);
    const r: any = await submit({ data: { laneId: lane.lane_id, response: resp, explanation: resp === "breach" ? explanation : null } });
    setBusy(false);
    if (r?.error) setErr(r.error);
    else setSubmitted(true);
  }
  async function doSkip() {
    setBusy(true);
    await skip({ data: { laneId: lane.lane_id } });
    setBusy(false);
    setSkipped(true);
  }

  if (skipped) return <div className="p-4 rounded-xl border border-[#3d2c00]" style={{ background: "#0d0a00" }}><p className="text-[#c9a84c] font-semibold">{lane.title} — Sabbath</p></div>;
  if (submitted) {
    const ok = resp === "aligned";
    return <div className="p-4 rounded-xl" style={{ background: "#161210", border: `1px solid ${ok ? "#166534" : "#7f1d1d"}` }}><p className="font-semibold" style={{ color: ok ? "#4ade80" : "#f87171" }}>{lane.title} — {ok ? "Aligned" : "Breach reported"}</p></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-[#2a2518] flex flex-col gap-3" style={{ background: "#161210" }}>
      {isLate && <p className="text-[0.7rem] text-[#f59e0b] font-semibold">LATE — Yesterday</p>}
      <p className="font-semibold">{lane.title}</p>
      {lane.description && <p className="text-xs text-[#555]">{lane.description}</p>}
      <p className="text-xs text-[#666]">Did you avoid this today?</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => setResp("aligned")} className="flex-1 py-3 rounded-lg text-sm" style={{ border: `1px solid ${resp === "aligned" ? "#4ade80" : "#222"}`, background: resp === "aligned" ? "#052e16" : "#161210", color: resp === "aligned" ? "#4ade80" : "#666" }}>Yes — aligned</button>
        <button type="button" onClick={() => setResp("breach")} className="flex-1 py-3 rounded-lg text-sm" style={{ border: `1px solid ${resp === "breach" ? "#f87171" : "#222"}`, background: resp === "breach" ? "#2d0d0d" : "#161210", color: resp === "breach" ? "#f87171" : "#666" }}>No — breach</button>
      </div>
      {resp === "breach" && (
        <textarea required rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)}
          placeholder="What happened? Be honest." className="w-full p-3 rounded-lg bg-[#161210] border border-[#222] text-white outline-none resize-none" />
      )}
      {err && <p className="text-red-400 text-xs">{err}</p>}
      {resp && (
        <button disabled={busy} className="w-full py-3 rounded-lg font-semibold text-sm" style={{ background: resp === "aligned" ? "#fff" : "#7f1d1d", color: resp === "aligned" ? "#000" : "#fff" }}>
          {busy ? "Submitting…" : resp === "aligned" ? "Submit — Aligned" : "Submit — Breach"}
        </button>
      )}
      <button type="button" onClick={doSkip} className="text-[#4a3a10] text-[0.72rem] underline">Skip — Sabbath</button>
    </form>
  );
}
