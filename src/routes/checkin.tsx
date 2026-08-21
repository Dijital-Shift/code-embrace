import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getCheckinPage, submitCheckin, skipCheckin } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";
import { AccessGate, AccessBanner, useAccessState } from "@/components/AccessBanner";
import { statusColor, statusLabel } from "@/lib/status";

export const Route = createFileRoute("/checkin")({
  head: () => ({ meta: [{ title: "Check-In — Kingdom Protocol" }] }),
  component: () => <AppLayout><CheckIn /></AppLayout>,
});

type Lane = { lane_id: string; title: string; description?: string | null; lane_type: string };

function CheckIn() {
  const fn = useServerFn(getCheckinPage);
  const { data, isLoading } = useQuery({ queryKey: ["checkin"], queryFn: () => fn() });
  const { data: access } = useAccessState();

  if (isLoading) return <p className="text-[#9e968a]">Loading…</p>;
  if (access && !access.hasAccess) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" className="text-[#a8a094]">←</Link>
          <h2 className="text-xl font-bold">Check-In</h2>
        </div>
        <AccessGate action="Checking in">{null}</AccessGate>
      </div>
    );
  }

  const lanes = (data?.lanes ?? []) as Lane[];
  const checkins = data?.checkins ?? [];
  const today = data?.today ?? "";
  const yest = data?.yesterday ?? "";

  const todayMap = new Map(checkins.filter((c) => c.checkin_date === today).map((c) => [c.lane_id, c]));
  const missedYMap = new Map(checkins.filter((c) => c.checkin_date === yest && c.status === "missed").map((c) => [c.lane_id, c]));

  const late = lanes.filter((l) => missedYMap.has(l.lane_id) && !todayMap.has(l.lane_id));
  const pending = lanes.filter((l) => !todayMap.has(l.lane_id) && !missedYMap.has(l.lane_id));
  const done = lanes.filter((l) => todayMap.has(l.lane_id));
  const allDone = pending.length === 0 && late.length === 0;

  if (!lanes.length) {
    return (
      <div className="text-center pt-16">
        <p className="text-[#9e968a] mb-4">No active paths.</p>
        <Link to="/paths/new" className="px-5 py-2 bg-white text-black rounded font-semibold">Create a Path</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link to="/dashboard" className="text-[#a8a094]">←</Link>
        <h2 className="text-xl font-bold">Check-In</h2>
      </div>
      <p className="text-[#a8a094] text-xs mb-6">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

      <AccessBanner />

      {allDone && (
        <div className="p-4 rounded-xl border border-[#166534] mb-6" style={{ background: "linear-gradient(135deg, #052e16 0%, #031a0d 100%)" }}>
          <p className="font-semibold text-[#4ade80] text-sm">All paths checked in.</p>
          <p className="text-xs text-[#9e968a]">Walk on.</p>
        </div>
      )}

      {late.length > 0 && (
        <section className="mb-6">
          <p className="text-[0.65rem] text-[#f59e0b] uppercase tracking-wider mb-2 font-semibold">Silent Yesterday — Submit Before 10AM</p>
          <div className="flex flex-col gap-1.5">
            {late.map((l) => <PathRow key={l.lane_id} lane={l} isLate />)}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section className="mb-6">
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-2 font-semibold">Today</p>
          <div className="flex flex-col gap-1.5">
            {pending.map((l) => <PathRow key={l.lane_id} lane={l} />)}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section className="mb-6">
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-2 font-semibold">Logged</p>
          <div className="flex flex-col gap-1.5">
            {done.map((l) => {
              const c = todayMap.get(l.lane_id)!;
              return (
                <div key={l.lane_id} className="flex justify-between items-center px-3 py-2.5 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
                  <span className="text-sm text-[#ded8cc]">{l.title}</span>
                  <span className="text-xs font-semibold" style={{ color: statusColor(c.status) }}>{statusLabel(c.status)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * One compact row per path — works the same for "complete" and "avoid" paths.
 * Yes submits instantly. No opens the mandatory honesty field.
 */
function PathRow({ lane, isLate = false }: { lane: Lane; isLate?: boolean }) {
  const qc = useQueryClient();
  const submit = useServerFn(submitCheckin);
  const skip = useServerFn(skipCheckin);
  const revert = useServerFn(revertComplete);
  const [open, setOpen] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [result, setResult] = useState<null | "completed" | "breached" | "skipped">(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  const isAvoid = lane.lane_type === "avoid";
  const yesLabel = isAvoid ? "Held" : "Did it";
  const noLabel = isAvoid ? "Breach" : "Didn't";

  async function send(response: "aligned" | "breach") {
    if (busy) return;
    setBusy(true); setErr(null);
    const r: any = await submit({ data: { laneId: lane.lane_id, response, explanation: response === "breach" ? explanation : null } });
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    setResult(response === "aligned" ? "completed" : "breached");
    if (response === "aligned") setCanUndo(true);
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["checkin"] });
  }

  async function undo() {
    if (busy) return;
    setBusy(true); setErr(null);
    const r: any = await revert({ data: { laneId: lane.lane_id } });
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    setResult(null); setCanUndo(false); setOpen(false);
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["checkin"] });
  }

  async function doSkip() {
    setBusy(true);
    await skip({ data: { laneId: lane.lane_id } });
    setBusy(false);
    setResult("skipped");
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  if (result) {
    return (
      <div className="rounded-lg border border-[#2a2518] overflow-hidden" style={{ background: "#161210" }}>
        <div className="flex justify-between items-center px-3 py-2.5">
          <span className="text-sm text-[#ded8cc]">{lane.title}</span>
          <span className="text-xs font-semibold" style={{ color: statusColor(result) }}>{statusLabel(result)}</span>
        </div>
        {canUndo && (
          <div
            className="flex items-center justify-between gap-3 px-3 py-2.5 border-t border-[#2a2518]"
            style={{ background: "#0e1a12" }}
          >
            <span className="text-xs text-[#9ec9ac]">Logged. You can undo this for 30 minutes.</span>
            <button
              type="button" disabled={busy} onClick={undo}
              className="px-3 py-1.5 rounded-md text-xs font-bold shrink-0"
              style={{ border: "1px solid #c9a84c", background: "#1c1608", color: "#e5af38" }}
            >{busy ? "Undoing…" : "Undo"}</button>
          </div>
        )}
        {err && <p className="text-red-400 text-xs px-3 pb-2.5">{err}</p>}
      </div>
    );
  }

  return (
    <div className="px-3 py-2.5 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {isLate && <span className="text-[0.6rem] text-[#f59e0b] font-semibold uppercase tracking-wider block">Late — yesterday</span>}
          <span className="text-sm text-[#ded8cc] block truncate">{lane.title}</span>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button" disabled={busy}
            aria-label={yesLabel}
            title={yesLabel}
            onClick={() => { setOpen(false); send("aligned"); }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ border: "1px solid #1f5133", background: "#0b2016", color: "#4ade80" }}
          >
            {busy && !open ? <span className="text-xs">…</span> : <Check size={20} strokeWidth={3} />}
          </button>
          <button
            type="button" disabled={busy}
            aria-label={noLabel}
            title={noLabel}
            onClick={() => { setOpen((v) => !v); setErr(null); }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ border: `1px solid ${open ? "#f87171" : "#4a1f1f"}`, background: open ? "#2d0d0d" : "#1a0f0f", color: "#f87171" }}
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
      </div>


      {open && (
        <div className="mt-2.5">
          <textarea
            rows={2} required minLength={5} value={explanation} onChange={(e) => setExplanation(e.target.value)}
            placeholder="What happened? Be honest."
            className="w-full p-2.5 text-base rounded-md bg-[#0a0800] border border-[#2a2518] text-white outline-none resize-none"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              disabled={busy || explanation.trim().length < 5}
              onClick={() => send("breach")}
              className="px-3 py-1.5 rounded-md text-xs font-bold"
              style={{ background: explanation.trim().length >= 5 ? "#7f1d1d" : "#2a2518", color: explanation.trim().length >= 5 ? "#fff" : "#7d7668" }}
            >{busy ? "Submitting…" : "Submit"}</button>
            <button type="button" onClick={() => { setOpen(false); setExplanation(""); }} className="text-[0.7rem] text-[#a8a094] underline">Cancel</button>
          </div>
        </div>
      )}

      {err && <p className="text-red-400 text-xs mt-2">{err}</p>}

      {!open && (
        <button type="button" onClick={doSkip} className="text-[#6b5a1f] text-[0.68rem] underline mt-1.5">Skip — Sabbath</button>
      )}
    </div>
  );
}
