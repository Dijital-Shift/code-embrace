import * as React from "react";
import {
  BellRing, Check, Eye, MessageSquare, Pause, Phone, Play, Plus, RotateCcw, Send, Shield, ShieldAlert, Users, Maximize2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { breachAlertCopy } from "@/lib/watchman-alert";
import { LOOP_BEATS, LOOP_FRAME_MS, loopFrameRole, nextLoopPosition, type LoopPosition } from "@/lib/covenant-loop";

const CREST = "/kingdom-protocol-logo.png";
const WALKER = "David";
const WATCHMAN = "Marcus";
const PATH = "No Fornication";
const NOTE = "Fell after midnight. Not hiding it.";

const COPY: Record<(typeof LOOP_BEATS)[number]["id"], { label: string; title: string; body: string }> = {
  create: { label: "Create", title: "Create a Path", body: "Choose Pursue or Flee, name it, and anchor it in Scripture." },
  invite: { label: "Invite", title: "Invite your Watchman", body: "Send one link. They accept with one tap." },
  checkin: { label: "Check in", title: "Check in each night", body: "Green if you held. Red if you breached, then say what happened." },
  alarm: { label: "Alarm", title: "Your Watchman is alerted", body: "A breach, or two silent days, sounds the alarm on their phone." },
  watch: { label: "Answer", title: "Your Watchman answers", body: "They call, text, or send a word of strength. Tonight, the loop begins again." },
};

const TAP = "ring-2 ring-primary ring-offset-2 ring-offset-background motion-safe:animate-pulse";

/** Five-beat looping phone walkthrough of the whole accountability loop, drawn in the app's own tokens. */
export function CovenantLoop() {
  const [pos, setPos] = React.useState<LoopPosition>({ beat: 0, frame: 0 });
  const [playing, setPlaying] = React.useState(true);
  const [tick, setTick] = React.useState(0);
  const [theater, setTheater] = React.useState(false);

  React.useEffect(() => {
    if (!theater) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTheater(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [theater]);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setPos(nextLoopPosition), LOOP_FRAME_MS);
    return () => window.clearInterval(id);
  }, [playing, tick]);

  const jump = (beat: number) => {
    setPos({ beat, frame: 0 });
    setTick((t) => t + 1);
    try { navigator.vibrate?.(8); } catch { /* unsupported */ }
  };

  const beat = LOOP_BEATS[pos.beat];
  const copy = COPY[beat.id];
  const role = loopFrameRole(pos);

  return (
    <section aria-labelledby="loop-title" className="border-b border-border">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-6 py-12 md:grid-cols-2 md:gap-12 md:py-16">
        <div className="min-w-0" data-demo-copy>
          <h2 id="loop-title" className="rs-title font-bold">The whole loop in 45 seconds.</h2>
          <p className="rs-body mt-3 text-parchment">Create. Invite. Check in. Alarm. Answer. That's the entire system.</p>
          <ol className="mt-6 hidden space-y-2 md:block">
            {LOOP_BEATS.map((b, i) => {
              const c = COPY[b.id];
              const active = i === pos.beat;
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                      active ? "border-primary/60 bg-card" : "border-transparent hover:bg-card/60",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", active ? "bg-primary text-primary-foreground" : "border border-border text-stone")}>{i + 1}</span>
                      <span className={cn("rs-body font-semibold", active ? "text-foreground" : "text-stone")}>{c.title}</span>
                    </span>
                    {active && <span className="rs-tip mt-1 block pl-9 text-parchment">{c.body}</span>}
                    {active && <Progress frame={pos.frame} frames={b.frames} playing={playing} />}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="min-w-0" data-demo-mock>
          <LoopStage pos={pos} playing={playing} role={role} copy={copy} jump={jump} togglePlay={() => setPlaying((p) => !p)} onExpand={() => setTheater(true)} />
        </div>
      </div>
      {theater && (
        <div role="dialog" aria-modal="true" aria-label="Walkthrough, full screen" className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-background">
          <div className="flex shrink-0 items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <span className="text-sm font-semibold text-parchment">The whole loop</span>
            <button type="button" onClick={() => setTheater(false)} aria-label="Close full screen" className="flex h-11 w-11 items-center justify-center rounded-full text-stone hover:text-primary">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <LoopStage pos={pos} playing={playing} role={role} copy={copy} jump={jump} togglePlay={() => setPlaying((p) => !p)} alwaysTabs />
          </div>
        </div>
      )}
    </section>
  );
}

function LoopStage({ pos, playing, role, copy, jump, togglePlay, onExpand, alwaysTabs }: {
  pos: LoopPosition; playing: boolean; role: ReturnType<typeof loopFrameRole>; copy: { title: string; body: string };
  jump: (i: number) => void; togglePlay: () => void; onExpand?: () => void; alwaysTabs?: boolean;
}) {
  const beat = LOOP_BEATS[pos.beat];
  return (
    <>
      <div className={cn("mb-3 grid grid-cols-5 gap-1", !alwaysTabs && "md:hidden")} role="tablist" aria-label="Walkthrough steps">
        {LOOP_BEATS.map((b, i) => {
          const active = i === pos.beat;
          return (
            <button key={b.id} type="button" role="tab" aria-selected={active} onClick={() => jump(i)}
              className={cn("relative flex min-h-11 flex-col items-center justify-center overflow-hidden rounded-md border px-0.5 text-[10px] font-semibold leading-tight",
                active ? "border-primary/60 bg-card text-primary" : "border-border text-stone")}>
              <span className="font-mono text-[9px] opacity-70">{i + 1}</span>
              {COPY[b.id].label}
              {active && <span className="absolute inset-x-0 bottom-0"><Progress frame={pos.frame} frames={b.frames} playing={playing} bare /></span>}
            </button>
          );
        })}
      </div>
      <div className={cn("mx-auto mb-3 min-h-[3.75rem] max-w-xs text-center", !alwaysTabs && "md:hidden")} aria-live="polite">
        <p className="rs-body font-semibold text-foreground">{pos.beat + 1}. {copy.title}</p>
        <p className="rs-tip mt-1 text-parchment">{copy.body}</p>
      </div>
      <div className="mx-auto w-[15rem]">
        <div className="mb-2 flex items-center justify-between">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", role === "walker" ? "bg-primary text-primary-foreground" : "border border-primary/40 bg-secondary text-parchment")}>
            {role === "walker" ? <Shield className="h-3 w-3" aria-hidden="true" /> : <Users className="h-3 w-3" aria-hidden="true" />}
            {role === "walker" ? "Your phone" : "Watchman's phone"}
          </span>
          <span className="flex items-center">
            {onExpand && (
              <button type="button" onClick={onExpand} aria-label="Watch full screen" className="flex h-11 w-11 items-center justify-center rounded-full text-stone hover:text-primary">
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={togglePlay} aria-label={playing ? "Pause walkthrough" : "Play walkthrough"} className="flex h-11 w-11 items-center justify-center rounded-full text-stone hover:text-primary">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </span>
        </div>
        {onExpand ? (
          <button type="button" onClick={onExpand} aria-label="Watch full screen" className="block w-full text-left">
            <Handset compact><Screen beat={beat.id} frame={pos.frame} /></Handset>
          </button>
        ) : (
          <Handset><Screen beat={beat.id} frame={pos.frame} /></Handset>
        )}
        {onExpand && <p className="mt-2 text-center text-[11px] text-stone md:hidden">Tap the phone to watch full screen</p>}
      </div>
    </>
  );
}

function Progress({ frame, frames, playing, bare }: { frame: number; frames: number; playing: boolean; bare?: boolean }) {
  return (
    <span className={cn("block h-0.5 overflow-hidden bg-border", bare ? "" : "ml-9 mt-2 rounded-full")} aria-hidden="true">
      <span
        className={cn("block h-full bg-primary", playing && "motion-safe:transition-[width] motion-safe:duration-700")}
        style={{ width: `${((frame + 1) / frames) * 100}%` }}
      />
    </span>
  );
}

function Handset({ children, compact }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] border-[3px] border-primary/25 bg-card p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.65)]", compact ? "h-[21.5rem] md:h-[25rem]" : "h-[25rem]")}>
      <div className="relative h-full overflow-hidden rounded-[1.6rem] bg-background">
        <div className="flex items-center justify-between px-4 pt-2 text-[9px] font-semibold text-stone">
          <span>9:41</span>
          <span className="h-3 w-14 rounded-full bg-card" aria-hidden="true" />
          <span>●●●</span>
        </div>
        <div className="relative h-[calc(100%-1.25rem)] px-3 pb-3 pt-2">{children}</div>
      </div>
    </div>
  );
}

function AppBar({ title, icon: Icon }: { title: string; icon?: React.ElementType }) {
  return (
    <div className="mb-3 flex items-center gap-1.5 border-b border-border pb-2">
      {Icon ? <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" /> : <img src={CREST} alt="" className="h-4 w-4 object-contain" />}
      <span className="text-[12px] font-semibold text-foreground">{title}</span>
    </div>
  );
}

function FleeTag() {
  return <span className="rounded-full bg-history-breach/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-history-breach">Flee</span>;
}

function Screen({ beat, frame }: { beat: (typeof LOOP_BEATS)[number]["id"]; frame: number }) {
  // Keyed so each frame fades in instead of morphing.
  return (
    <div key={`${beat}-${frame}`} className="h-full kp-loop-in">
      {beat === "create" && <CreateFrame frame={frame} />}
      {beat === "invite" && <InviteFrame frame={frame} />}
      {beat === "checkin" && <CheckinFrame frame={frame} />}
      {beat === "alarm" && <AlarmFrame frame={frame} />}
      {beat === "watch" && <WatchFrame frame={frame} />}
    </div>
  );
}

function CreateFrame({ frame }: { frame: number }) {
  if (frame === 0) {
    return (
      <div>
        <AppBar title="Paths" />
        {["Read Scripture Daily", "Rise Early"].map((t) => (
          <div key={t} className="mb-2 rounded-lg border border-border bg-card px-3 py-2 text-[11px] text-stone">{t}</div>
        ))}
        <div className={cn("mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[11px] font-bold text-primary-foreground", TAP)}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New Path
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      <AppBar title="New Path" />
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-border bg-card py-2 text-center text-[10px] font-bold uppercase tracking-wider text-stone">Pursue</div>
        <div className={cn("rounded-md border border-history-breach bg-history-breach/10 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-history-breach", frame === 1 && TAP)}>Flee</div>
      </div>
      <div className="rounded-md border border-border bg-card px-2.5 py-1.5">
        <div className="text-[8px] uppercase tracking-wider text-stone">Path</div>
        <div className="text-[11px] text-foreground">{PATH}</div>
      </div>
      <div className="rounded-md border border-primary/30 bg-card px-2.5 py-1.5">
        <div className="text-[8px] uppercase tracking-wider text-primary">Scripture (KJV)</div>
        <div className="text-[10px] italic leading-snug text-parchment">"Flee fornication." — 1 Corinthians 6:18</div>
      </div>
      <div className="flex gap-1">
        {["30d", "60d", "90d"].map((d) => (
          <span key={d} className={cn("rounded-full border px-2 py-0.5 text-[9px]", d === "90d" ? "border-primary text-primary" : "border-border text-stone")}>{d}</span>
        ))}
      </div>
      <div className={cn("rounded-lg bg-primary py-2 text-center text-[11px] font-bold text-primary-foreground", frame === 2 && TAP)}>Create Path</div>
    </div>
  );
}

function PathHeader({ watchman }: { watchman?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-semibold text-foreground">{PATH}</span>
        <FleeTag />
      </div>
      <div className="mt-1 text-[9px] italic text-stone">"Flee fornication." — 1 Cor. 6:18</div>
      <div className={cn("mt-2 flex items-center gap-1.5 text-[10px]", watchman ? "text-history-held" : "text-stone")}>
        <span className={cn("h-2 w-2 rounded-full", watchman ? "bg-history-held" : "border border-stone")} aria-hidden="true" />
        {watchman ? `Watchman: ${WATCHMAN}` : "No Watchman yet"}
      </div>
    </div>
  );
}

function InviteFrame({ frame }: { frame: number }) {
  if (frame === 2) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col items-center pt-2">
          <img src={CREST} alt="" className="h-10 w-10 object-contain" />
          <div className="mt-1 text-[11px] font-semibold text-primary">Kingdom Protocol</div>
        </div>
        <div className="text-center text-[12px] font-semibold text-foreground">{WALKER} asks you to stand watch</div>
        <div className="rounded-lg border border-border bg-card p-2.5">
          <div className="flex items-center justify-between"><span className="text-[11px] text-foreground">{PATH}</span><FleeTag /></div>
          <div className="mt-1.5 text-[9px] leading-snug text-stone">You're alerted on a breach or two silent days. Free, always.</div>
        </div>
        <div className={cn("rounded-lg bg-primary py-2 text-center text-[11px] font-bold text-primary-foreground", TAP)}>Accept</div>
      </div>
    );
  }
  return (
    <div className="relative h-full">
      <AppBar title="Path" />
      <PathHeader watchman={frame === 3} />
      {frame === 3 ? (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-history-held/40 bg-history-held/10 px-3 py-2 text-[10px] text-history-held">
          <Check className="h-3.5 w-3.5" aria-hidden="true" /> {WATCHMAN} is on the wall.
        </div>
      ) : (
        <div className={cn("mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[11px] font-bold text-primary-foreground", frame === 0 && TAP)}>
          <Users className="h-3.5 w-3.5" aria-hidden="true" /> Invite Watchman
        </div>
      )}
      {frame === 1 && (
        <div className="absolute inset-x-[-0.75rem] bottom-[-0.75rem] rounded-t-2xl border-t border-border bg-card p-3 kp-loop-up">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
            <img src={CREST} alt="" className="h-8 w-8 object-contain" />
            <div className="min-w-0">
              <div className="truncate text-[10px] font-semibold text-foreground">Stand watch with {WALKER}</div>
              <div className="truncate text-[8px] text-stone">kingdomprotocol.app/invite/…</div>
            </div>
          </div>
          <div className="mt-3 flex justify-around">
            {[{ l: "Messages", icon: MessageSquare, tap: true }, { l: "Copy", icon: Send, tap: false }].map(({ l, icon: I, tap }) => (
              <div key={l} className="flex flex-col items-center gap-1">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary", tap && TAP)}><I className="h-4 w-4" aria-hidden="true" /></span>
                <span className="text-[8px] text-stone">{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckinFrame({ frame }: { frame: number }) {
  if (frame === 1) {
    return (
      <div>
        <AppBar title="Check-In" />
        <Tabs active="Logged" />
        <div className="flex items-center gap-2 rounded-lg border border-history-held/40 bg-history-held/10 px-3 py-2">
          <Check className="h-3.5 w-3.5 text-history-held" aria-hidden="true" />
          <span className="flex-1 text-[11px] text-history-held">{PATH}</span>
          <span className="text-[9px] font-semibold text-primary">Undo</span>
        </div>
        <p className="mt-3 text-center text-[9px] text-stone">Sealed. Your Watchman stays quiet.</p>
      </div>
    );
  }
  return (
    <div className="relative h-full">
      <AppBar title="Check-In" />
      <Tabs active="Today" />
      {frame === 2 && <div className="mb-1.5 text-[8px] uppercase tracking-wider text-stone">Another night</div>}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
        <span className="flex-1 text-[11px] font-semibold text-foreground">{PATH}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border border-history-held/60 bg-history-held/10 text-history-held", frame === 0 && TAP)}><Shield className="h-4 w-4" aria-hidden="true" /></span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border border-history-breach/60 bg-history-breach/10 text-history-breach", frame === 2 && TAP)}><ShieldAlert className="h-4 w-4" aria-hidden="true" /></span>
      </div>
      {frame === 3 && (
        <div className="absolute inset-0 flex items-center bg-overlay kp-loop-in">
          <div className="w-full rounded-xl border border-border bg-card p-3">
            <div className="text-[11px] font-semibold text-parchment">Review your confession</div>
            <div className="mt-1 text-[8px] leading-snug text-stone">Your Watchman is alerted the moment you confirm.</div>
            <div className="mt-2 rounded-md border border-border bg-background p-2 text-[10px] text-foreground">{NOTE}</div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <span className="rounded-md border border-border py-1.5 text-center text-[9px] text-stone">Edit</span>
              <span className={cn("rounded-md bg-history-breach py-1.5 text-center text-[9px] font-bold text-destructive-foreground", TAP)}>Confirm Breach</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tabs({ active }: { active: string }) {
  return (
    <div className="mb-3 grid grid-cols-3 gap-1 rounded-md bg-card p-0.5 text-center text-[9px]">
      {["Yesterday", "Today", "Logged"].map((t) => (
        <span key={t} className={cn("rounded py-1", t === active ? "bg-secondary font-semibold text-primary" : "text-stone")}>{t}</span>
      ))}
    </div>
  );
}

function AlarmFrame({ frame }: { frame: number }) {
  const alert = breachAlertCopy(WALKER, PATH, false);
  return (
    <div className="flex h-full flex-col items-center pt-6">
      <div className="text-[44px] font-light leading-none text-foreground">9:42</div>
      <div className="mt-1 text-[10px] text-stone">Monday, November 16</div>
      <div className={cn("mt-6 w-full rounded-2xl border border-history-breach/40 bg-card p-2.5", frame === 0 ? "kp-loop-down" : TAP)}>
        <div className="flex items-center gap-1.5">
          <img src={CREST} alt="" className="h-4 w-4 object-contain" />
          <span className="text-[8px] font-semibold uppercase tracking-wider text-stone">Kingdom Protocol</span>
          <span className="ml-auto text-[8px] text-stone">now</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-history-breach">
          <BellRing className="h-3 w-3" aria-hidden="true" /> {alert.title}
        </div>
        <div className="mt-0.5 text-[9px] leading-snug text-parchment">{alert.body}</div>
      </div>
    </div>
  );
}

function WatchFrame({ frame }: { frame: number }) {
  return (
    <div className="space-y-2.5">
      <AppBar title="The Watch" icon={Eye} />
      <div className="text-[8px] font-semibold uppercase tracking-[0.2em] text-history-breach">Needs you (1)</div>
      <div className="rounded-lg border border-history-breach/40 bg-card p-2.5">
        <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-foreground">{WALKER} · {PATH}</span></div>
        <div className="mt-1 text-[9px] text-history-breach">Breach reported:</div>
        <div className="text-[9px] italic text-parchment">"{NOTE}"</div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <span className={cn("flex items-center justify-center gap-1 rounded-md border border-action-gold-edge bg-action-edit py-1.5 text-[10px] font-semibold text-primary", frame === 0 && TAP)}><Phone className="h-3 w-3" aria-hidden="true" />Call</span>
          <span className={cn("flex items-center justify-center gap-1 rounded-md border border-action-gold-edge bg-action-edit py-1.5 text-[10px] font-semibold text-primary", frame === 0 && TAP)}><MessageSquare className="h-3 w-3" aria-hidden="true" />Text</span>
        </div>
      </div>
      {frame >= 1 && (
        <div className="rounded-lg border border-border bg-card p-2.5 kp-loop-in">
          <div className="text-[8px] uppercase tracking-wider text-stone">Encourage {WALKER}</div>
          <div className="mt-1 text-[10px] text-foreground">Calling you now. Get back on the wall.</div>
          {frame === 1 ? (
            <div className={cn("mt-2 flex items-center justify-center gap-1 rounded-md bg-primary py-1.5 text-[10px] font-bold text-primary-foreground", TAP)}><Send className="h-3 w-3" aria-hidden="true" />Send</div>
          ) : (
            <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-semibold text-history-held"><Check className="h-3 w-3" aria-hidden="true" />Sent to {WALKER}</div>
          )}
        </div>
      )}
      {frame === 2 && (
        <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] font-semibold text-primary kp-loop-in">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Tonight, the loop begins again.
        </div>
      )}
    </div>
  );
}
