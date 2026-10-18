import { useRevealOnOpen } from "@/hooks/useRevealOnOpen";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { enqueueCheckin, dequeueCheckin, readQueue, saveCheckinCache, readCheckinCache, isNetworkError, QUEUE_EVENT, type QueuedCheckin } from "@/lib/offline-checkins";
import { getCheckinPage, submitCheckin, skipCheckin, revertComplete } from "@/lib/api.functions";
import { Check, X, Lock } from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { WatchmanPushPrompt } from "@/components/WatchmanPushPrompt";
import { AccessBanner, useAccessState } from "@/components/AccessBanner";
import { statusColor, statusLabel } from "@/lib/status";

async function loadCheckin(call: () => Promise<any>) {
  try { const d = await call(); saveCheckinCache(d); return { ...d, offline: false }; }
  catch (e) {
    const cached = readCheckinCache<any>();
    if (cached && isNetworkError(e)) return { ...cached, offline: true };
    throw e;
  }
}

export const Route = createFileRoute("/checkin")({
  head: () => ({ meta: [
    { title: "Check-In — Kingdom Protocol" },
    { name: "description", content: "Record today’s accountability on your Kingdom Protocol Paths." },
    { property: "og:title", content: "Check-In — Kingdom Protocol" },
    { property: "og:description", content: "Record today’s accountability on your Kingdom Protocol Paths." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => {
    if (typeof window === "undefined") return;
    void context.queryClient.prefetchQuery({ queryKey: ["checkin"], queryFn: () => loadCheckin(() => getCheckinPage()) }).catch(() => {});
  },
  component: () => <AppLayout><CheckIn /></AppLayout>,
});

type Lane = { lane_id: string; title: string; description?: string | null; lane_type: string };

/** Undoable for 30 minutes after it was logged. */
function undoable(checkin?: { status?: string; completion_time?: string | null } | null) {
  if (!checkin) return false;
  if (checkin.status !== "completed" && checkin.status !== "skipped") return false;
  if (!checkin.completion_time) return false;
  return (Date.now() - new Date(checkin.completion_time).getTime()) / 60000 < 30;
}

/** Small, quiet undo affordance — no block, no extra row. */
function UndoLink({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <button
      type="button" disabled={busy} onClick={onClick}
      aria-label="Undo this check-in"
      title="You have 30 minutes to undo"
      className="text-[0.7rem] text-[#c9a84c] underline underline-offset-2 shrink-0"
    >{busy ? "Undoing…" : "Undo"}</button>
  );
}

function CheckIn() {
  const fn = useServerFn(getCheckinPage);
  const { data, isLoading } = useQuery({
    queryKey: ["checkin"],
    queryFn: () => loadCheckin(() => fn()),
    // Show the last known list on frame one; fresh data replaces it silently.
    placeholderData: () => {
      const c = typeof window !== "undefined" ? readCheckinCache<any>() : null;
      return c ? { ...c, offline: false } : undefined;
    },
  });
  const [queue, setQueue] = useState<QueuedCheckin[]>([]);
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => { setQueue(readQueue()); setOnline(navigator.onLine); };
    sync();
    window.addEventListener(QUEUE_EVENT, sync);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener(QUEUE_EVENT, sync);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  const { data: access } = useAccessState();
  const [tab, setTab] = useState<null | "yesterday" | "today" | "logged">(null);

  if (isLoading) return <p className="text-[#9e968a]">Loading…</p>;
  if (access && !access.hasAccess) {
    const resting = (data?.lanes ?? []) as Lane[];
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Link to="/dashboard" aria-label="Back" className="text-[#a8a094] hover:text-[#c9a84c] transition-colors">←</Link>
          <h2 className="text-2xl tracking-wide text-[#f3e6c4]" style={{ fontFamily: "Cinzel, serif" }}>Check-In</h2>
        </div>
        <AccessBanner />
        {resting.length > 0 && (
          <section>
            <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-2 font-semibold">Waiting on you · {resting.length}</p>
            <div className="flex flex-col gap-2">
              {resting.map((l) => (
                <div key={l.lane_id} className="kp-card flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#ded8cc] truncate">{l.title}</p>
                    <p className="text-[0.7rem] text-[#8f887c]">Resting — record intact</p>
                  </div>
                  <Lock size={16} className="text-[#c9a84c] shrink-0" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const lanes = (data?.lanes ?? []) as Lane[];
  const today = data?.today ?? "";
  const yesterday = data?.yesterday ?? "";
  // Check-ins saved without signal show as logged ("Pending sync") until they upload.
  const queuedRows = queue
    .filter((q) => q.date === today || q.date === yesterday)
    .map((q) => ({
      lane_id: q.laneId, checkin_date: q.date, pending: true, completion_time: null,
      status: q.kind === "aligned" ? "completed" : q.kind === "breach" ? "breached" : "skipped",
    }));
  const queuedKeys = new Set(queuedRows.map((q) => `${q.lane_id}|${q.checkin_date}`));
  const checkins = [
    ...((data?.checkins ?? []) as any[]).filter((c) => !queuedKeys.has(`${c.lane_id}|${c.checkin_date}`)),
    ...queuedRows,
  ];
  const graceOpen = data?.graceOpen ?? false;

  const todayMap = new Map(checkins.filter((c) => c.checkin_date === today).map((c) => [c.lane_id, c]));
  const yesterdayMap = new Map(checkins.filter((c) => c.checkin_date === yesterday).map((c) => [c.lane_id, c]));
  // Yesterday is open whenever no entry exists for it — not only once the
  // sweep has written a "missed" row.
  const catchUpSet = new Set(((data?.catchUp ?? []) as string[]).filter((id) => !queuedKeys.has(`${id}|${yesterday}`)));

  const late = lanes.filter((l) => catchUpSet.has(l.lane_id));
  const pending = lanes.filter((l) => !todayMap.has(l.lane_id));
  const done = lanes.filter((l) => todayMap.has(l.lane_id));
  // Yesterday entries that are still inside the undo window stay visible, so a
  // mis-click on a catch-up answer can be taken back after a refresh.
  const undoableYesterday = lanes.filter((l) => {
    const c: any = yesterdayMap.get(l.lane_id);
    return c?.pending || undoable(c);
  });
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
        <Link to="/dashboard" aria-label="Back" className="text-[#a8a094] hover:text-[#c9a84c] transition-colors">←</Link>
        <h2 className="text-2xl tracking-wide text-[#f3e6c4]" style={{ fontFamily: "Cinzel, serif" }}>Check-In</h2>
      </div>
      <p className="text-[#a8a094] text-xs mb-6">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

      <AccessBanner />

      <div className="mb-4"><WatchmanPushPrompt variant="owner" /></div>

      {(!online || data?.offline || queuedRows.length > 0) && (
        <div className="px-3 py-2.5 rounded-lg border border-[#5a4a1a] mb-4 text-xs" style={{ background: "#1a1408", color: "#e5af38" }}>
          {!online || data?.offline
            ? "You're offline. Check-ins save on this phone and send once you're back online."
            : `Sending ${queuedRows.length} saved check-in${queuedRows.length === 1 ? "" : "s"}…`}
        </div>
      )}

      {allDone && (
        <div className="p-4 rounded-xl border border-[#166534] mb-6" style={{ background: "linear-gradient(135deg, #052e16 0%, #031a0d 100%)" }}>
          <p className="font-semibold text-[#4ade80] text-sm">All paths checked in.</p>
          <p className="text-xs text-[#9e968a]">Walk on.</p>
        </div>
      )}

      {(() => {
        const tabs = [
          { key: "yesterday" as const, label: "Yesterday", count: late.length, warn: true },
          { key: "today" as const, label: "Today", count: pending.length, warn: false },
          { key: "logged" as const, label: "Logged", count: done.length + undoableYesterday.length, warn: false },
        ];
        const fallback = late.length ? "yesterday" : pending.length ? "today" : "logged";
        const active = tab && tabs.find((t) => t.key === tab) ? tab : fallback;
        return (
          <>
            <div className="sticky z-20 -mx-1 px-1 py-2 mb-3" style={{ top: "calc(44px + env(safe-area-inset-top))", background: "#0a0800" }}>
              <div role="tablist" aria-label="Check-in groups" className="grid grid-cols-3 gap-1 p-1 rounded-xl border border-[#2a2518]" style={{ background: "#120e06" }}>
                {tabs.map((t) => {
                  const on = active === t.key;
                  return (
                    <button
                      key={t.key} type="button" role="tab" aria-selected={on}
                      onClick={() => setTab(t.key)}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.72rem] font-semibold uppercase tracking-wider transition-colors"
                      style={{ background: on ? "#c9a84c" : "transparent", color: on ? "#0a0800" : "#b8b0a4" }}
                    >
                      {t.label}
                      <span
                        className="min-w-[1.25rem] h-5 px-1 rounded-full text-[0.65rem] flex items-center justify-center"
                        style={{
                          background: on ? "#0a0800" : t.count && t.warn ? "#3a2606" : "#1f1a10",
                          color: on ? "#f3d27a" : t.count && t.warn ? "#f59e0b" : "#9e968a",
                        }}
                      >{t.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {active === "yesterday" && (
              <section>
                <p className="text-[0.7rem] text-[#f59e0b] mb-2">
                  {late.length === 0 ? "Nothing owed from yesterday." : graceOpen ? "Answer before 10 AM, or it counts as silent." : "Went silent — still yours to answer honestly."}
                </p>
                <div className="flex flex-col gap-2">
                  {late.map((l) => <PathRow key={`y-${l.lane_id}`} lane={l} isLate day="yesterday" date={yesterday} />)}
                </div>
              </section>
            )}

            {active === "today" && (
              <section>
                {pending.length === 0 && <p className="text-[0.75rem] text-[#9e968a]">Every Path is answered for today.</p>}
                <div className="flex flex-col gap-2">
                  {pending.map((l) => <PathRow key={l.lane_id} lane={l} date={today} />)}
                </div>
              </section>
            )}

            {active === "logged" && (
              <section>
                {done.length + undoableYesterday.length === 0 && <p className="text-[0.75rem] text-[#9e968a]">Nothing logged yet today.</p>}
                <div className="flex flex-col gap-2">
                  {undoableYesterday.map((l) => (
                    <LoggedRow key={`ly-${l.lane_id}`} lane={l} checkin={yesterdayMap.get(l.lane_id)! as any} dayTag="Yesterday" day="yesterday" date={yesterday} />
                  ))}
                  {done.map((l) => {
                    const c = todayMap.get(l.lane_id)!;
                    return <LoggedRow key={l.lane_id} lane={l} checkin={c as any} date={today} />;
                  })}
                </div>
              </section>
            )}
          </>
        );
      })()}
    </div>
  );
}

/**
 * One compact row per path — works the same for "complete" and "avoid" paths.
 * Yes submits instantly. No opens the mandatory honesty field.
 */
function PathRow({ lane, isLate = false, day = "today", date }: { lane: Lane; isLate?: boolean; day?: "today" | "yesterday"; date: string }) {
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
  const missRef = useRevealOnOpen<HTMLDivElement>(open, true);

  const isAvoid = lane.lane_type === "avoid";
  const yesLabel = isAvoid ? "Held" : "Did it";
  const noLabel = isAvoid ? "Breach" : "Didn't";

  async function send(response: "aligned" | "breach") {
    if (busy) return;
    setBusy(true); setErr(null);
    const expl = response === "breach" ? explanation : null;
    let r: any;
    try {
      if (!navigator.onLine) throw new Error("offline");
      r = await submit({ data: { laneId: lane.lane_id, response, explanation: expl, forDay: day } });
    } catch (e) {
      setBusy(false);
      if (!isNetworkError(e) || !date) { setErr("Couldn't save. Try again."); return; }
      enqueueCheckin({ laneId: lane.lane_id, date, kind: response, explanation: expl });
      return; // the page now shows it as "Pending sync"
    }
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    setResult(response === "aligned" ? "completed" : "breached");
    // Undo covers a mis-click on either day.
    if (response === "aligned") setCanUndo(true);
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["checkin"] });
  }

  async function undo() {
    if (busy) return;
    setBusy(true); setErr(null);
    const r: any = await revert({ data: { laneId: lane.lane_id, forDay: day } });
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    setResult(null); setCanUndo(false); setOpen(false);
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["checkin"] });
  }

  async function doSkip() {
    setBusy(true);
    let r: any;
    try {
      if (!navigator.onLine) throw new Error("offline");
      r = await skip({ data: { laneId: lane.lane_id, forDay: day } });
    } catch (e) {
      setBusy(false);
      if (!isNetworkError(e) || !date) { setErr("Couldn't save. Try again."); return; }
      enqueueCheckin({ laneId: lane.lane_id, date, kind: "skip", explanation: null });
      return;
    }
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    setResult("skipped");
    setCanUndo(true);
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["checkin"] });
  }

  if (result) {
    return (
      <div className="rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
        <div className="flex justify-between items-center gap-3 px-3 py-2.5">
          <span className="text-sm text-[#ded8cc] min-w-0 truncate">{lane.title}</span>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold" style={{ color: statusColor(result) }}>{statusLabel(result)}</span>
            {canUndo && <UndoLink busy={busy} onClick={undo} />}
          </div>
        </div>
        {err && <p className="text-red-400 text-xs px-3 pb-2.5">{err}</p>}
      </div>
    );
  }

  return (
    <div className="px-3.5 py-3 rounded-xl border border-[#2a2518]" style={{ background: "linear-gradient(180deg, #19140b 0%, #120e07 100%)", boxShadow: "inset 0 1px 0 rgba(201,168,76,0.06)" }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {isLate && <span className="text-[0.6rem] text-[#f59e0b] font-semibold uppercase tracking-wider block">Yesterday</span>}
          <span className="text-[0.95rem] font-medium text-[#e8dfc4] block truncate">{lane.title}</span>
        </div>
        <div className="flex gap-2 flex-shrink-0 items-center">
          {!isAvoid && (
            <button
              type="button" disabled={busy || open}
              aria-label="Skip — Sabbath"
              title="Sabbath — no check-in today"
              onClick={doSkip}
              className="h-8 px-2.5 rounded-full text-[0.62rem] font-semibold uppercase tracking-wider disabled:opacity-40"
              style={{ border: "1px solid #3a3020", color: "#c9a84c", background: "transparent" }}
            >Sabbath</button>
          )}
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
        <div ref={missRef} className="mt-2.5">
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

    </div>
  );
}

/**
 * A check-in already logged. Keeps a quiet inline Undo alive for 30 minutes
 * after a "Held" or Sabbath entry, so it survives a page refresh.
 */
function LoggedRow({ lane, checkin, dayTag, day = "today", date }: {
  lane: Lane;
  checkin: { status: string; completion_time?: string | null; pending?: boolean };
  date?: string;
  dayTag?: string;
  day?: "today" | "yesterday";
}) {
  const qc = useQueryClient();
  const revert = useServerFn(revertComplete);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pending = !!checkin.pending;
  const canUndo = pending || undoable(checkin);

  async function undo() {
    if (busy) return;
    if (pending) { if (date) dequeueCheckin(lane.lane_id, date); return; }
    setBusy(true); setErr(null);
    const r: any = await revert({ data: { laneId: lane.lane_id, forDay: day } });
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["checkin"] });
  }

  return (
    <div className="rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
      <div className="flex justify-between items-center gap-3 px-3 py-2.5">
        <div className="min-w-0">
          {dayTag && <span className="text-[0.6rem] text-[#a8a094] font-semibold uppercase tracking-wider block">{dayTag}</span>}
          <span className="text-sm text-[#ded8cc] block truncate">{lane.title}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold" style={{ color: statusColor(checkin.status) }}>{statusLabel(checkin.status)}</span>
          {pending && <span className="text-[0.6rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: "#f59e0b", border: "1px solid #5a4a1a" }}>Pending sync</span>}
          {canUndo && <UndoLink busy={busy} onClick={undo} />}
        </div>
      </div>
      {err && <p className="text-red-400 text-xs px-3 pb-2.5">{err}</p>}
    </div>
  );
}
