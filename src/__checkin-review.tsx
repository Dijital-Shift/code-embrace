import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ShieldCheck, ShieldAlert, Moon, TrendingUp} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {contactHaptic} from '@/lib/watchman-alert';
const useQueryClient=()=>({invalidateQueries:()=>{}});
const useServerFn=(_:unknown)=>async()=>({});
const submitCheckin={},skipCheckin={},revertComplete={};
const useRevealOnOpen= <T,>(..._: unknown[])=>React.useRef<T>(null);
const enqueueCheckin=(..._:unknown[])=>{};
const isNetworkError=(_:unknown)=>false;
const statusColor=(_:unknown)=>'';
const statusLabel=(_:unknown)=>'';
const UndoLink=(_:unknown)=>null;
type Lane={lane_id:string;title:string;lane_type:string};
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
      <div className="kp-checkin-card">
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
    <div className="kp-checkin-card px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`kp-checkin-type ${isAvoid ? "kp-checkin-flee" : "kp-checkin-pursue"}`}>
              {isAvoid ? <ShieldAlert size={10} /> : <TrendingUp size={10} />}{isAvoid ? "Flee" : "Pursue"}
            </span>
            {isLate && <span className="text-[0.65rem] text-history-silent font-semibold">Yesterday</span>}
          </div>
          <p className="text-sm leading-snug font-semibold text-parchment [overflow-wrap:anywhere]">{lane.title}</p>
        </div>
        <TooltipProvider delayDuration={250}>
          <div className="flex items-center gap-1.5 shrink-0">
            {!isAvoid && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" disabled={busy || open} variant="checkinSabbath"
                    aria-label="Skip — Sabbath" title="Sabbath — no check-in today"
                    onClick={() => { contactHaptic(); doSkip(); }} className="kp-checkin-seal rounded-md">
                    <Moon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sabbath — no check-in today</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" disabled={busy} variant="checkinHeld"
                  aria-label={yesLabel} title={yesLabel}
                  onClick={() => { contactHaptic(); setOpen(false); send("aligned"); }}
                  className="kp-checkin-seal rounded-full">
                  {busy && !open ? <span>…</span> : <ShieldCheck />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{yesLabel}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" disabled={busy} variant="checkinBreach"
                  aria-label={noLabel} title={noLabel} aria-expanded={open}
                  onClick={() => { contactHaptic(); setOpen((v) => !v); setErr(null); }}
                  className="kp-checkin-seal rounded-full">
                  <ShieldAlert />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{noLabel}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>


      {open && (
        <div
          ref={missRef}
          className="kp-checkin-confession mt-3 p-3 rounded-lg"
        >
          <p className="text-[0.65rem] font-semibold uppercase mb-2 text-destructive">
            {isAvoid ? "Confess the breach" : "Tell the truth"}
          </p>
          <textarea
            rows={3} required minLength={5} value={explanation} onChange={(e) => setExplanation(e.target.value)}
            placeholder="What happened? Be honest."
            className="w-full p-2.5 text-base rounded-md outline-none resize-none placeholder:text-stone bg-background border border-action-ember-edge text-parchment"
          />
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <Button type="button" variant="link" onClick={() => { contactHaptic(); setOpen(false); setExplanation(""); }} className="text-xs text-stone px-0">Cancel</Button>
            <Button
              type="button"
              variant="checkinBreach"
              disabled={busy || explanation.trim().length < 5}
              onClick={() => { contactHaptic(); send("breach"); }}
              className="px-4 text-xs font-bold"
            >{busy ? "Submitting…" : isAvoid ? "Submit Breach" : "Submit"}</Button>
          </div>
        </div>
      )}

      {err && <p className="text-red-400 text-xs mt-2">{err}</p>}

    </div>
  );
}


export function mount(){document.body.innerHTML='<main id="review" class="p-4 space-y-3 mx-auto max-w-xl"></main>';const el=document.getElementById('review');if(el)createRoot(el).render(<><PathRow lane={{lane_id:'1',title:'Read Daily — Cultivate the Mind',lane_type:'complete'}} date="2026-11-04"/><PathRow lane={{lane_id:'2',title:'Fornication',lane_type:'avoid'}} date="2026-11-04"/><PathRow lane={{lane_id:'3',title:'A longer Path title that must remain fully readable without pushing the controls outside the screen',lane_type:'complete'}} isLate date="2026-11-03"/></>);}
