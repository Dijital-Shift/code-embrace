import { useEffect, useState } from "react";
import { Download, MoreVertical, PlusSquare, Share , Compass } from "lucide-react";

type Tab = "ios" | "android";
const CREST = "/kingdom-protocol-logo.png";

/** Looping coded phone mock of the install taps, drawn in the app's own colors and crest. */
export function InstallDemo({ tab }: { tab: Tab }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const id = window.setInterval(() => setStep((s) => (s + 1) % 4), 1900);
    return () => window.clearInterval(id);
  }, [tab]);
  const ring = "ring-2 ring-primary ring-offset-2 ring-offset-card animate-pulse";
  const labels = tab === "ios"
    ? ["Tap Share", "Tap Add to Home Screen", "Tap Add", "Kingdom Protocol is on your Home Screen"]
    : ["Tap the ⋮ menu", "Tap Install app", "Tap Install", "Kingdom Protocol is on your Home Screen"];

  return (
    <figure className="mx-auto mt-3 w-32 short:shrink-0" aria-label="Animated install walkthrough">
      <div className="relative h-52 overflow-hidden rounded-[1.5rem] border-[3px] border-primary/25 bg-card shadow-[0_10px_32px_rgba(0,0,0,0.65),inset_0_1px_0_hsl(var(--primary)/0.18)]">
        <div className="flex items-center justify-between border-b border-border bg-card px-2 py-1.5 text-[8px] text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1 truncate">{tab === "ios" ? <><Compass size={9} className="shrink-0 text-primary" aria-hidden="true" /><span className="font-semibold text-primary">Safari</span><span aria-hidden="true">·</span></> : <><span className="font-semibold text-primary">Chrome</span><span aria-hidden="true">·</span></>}kingdomprotocol.app</span>
          {tab === "android" && <span className={`rounded p-0.5 text-foreground ${step === 0 ? ring : ""}`}><MoreVertical size={11} /></span>}
        </div>
        <div className="flex h-28 flex-col items-center justify-center gap-1.5 bg-background">
          <img src={CREST} alt="" className="h-11 w-11 object-contain" />
          <span className="text-[10px] font-semibold text-primary">Kingdom Protocol</span>
        </div>
        {tab === "ios" && (
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-border bg-card py-1.5 text-muted-foreground">
            <span className="text-[10px]">‹</span><span className="text-[10px]">›</span>
            <span className={`rounded p-0.5 text-foreground ${step === 0 ? ring : ""}`}><Share size={12} /></span>
            <span className="text-[10px]">▢</span>
          </div>
        )}
        <div className={`absolute inset-x-0 bottom-0 rounded-t-xl border-t border-border bg-card p-2 transition-transform duration-500 ${step === 1 || step === 2 ? "translate-y-0" : "translate-y-full"}`}>
          {step === 1 && (
            <div className="grid gap-1 text-[9px] text-foreground">
              <span className="rounded px-2 py-1 text-muted-foreground">{tab === "ios" ? "Copy" : "New tab"}</span>
              <span className={`flex items-center justify-between rounded bg-primary/15 px-2 py-1 font-semibold ${ring}`}>
                {tab === "ios" ? "Add to Home Screen" : "Install app"} {tab === "ios" ? <PlusSquare size={11} /> : <Download size={11} />}
              </span>
              <span className="rounded px-2 py-1 text-muted-foreground">{tab === "ios" ? "Add Bookmark" : "Bookmarks"}</span>
            </div>
          )}
          {step === 2 && (
            <div className="text-[9px] text-foreground">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Cancel</span><span className={`rounded px-2 py-0.5 font-semibold text-primary ${ring}`}>{tab === "ios" ? "Add" : "Install"}</span></div>
              <div className="mt-2 flex items-center gap-2"><img src={CREST} alt="" className="h-6 w-6 rounded bg-background object-contain p-0.5" />Kingdom Protocol</div>
            </div>
          )}
        </div>
        <div className={`absolute inset-0 grid place-items-center bg-background transition-opacity duration-500 ${step === 3 ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <div className="flex flex-col items-center gap-1.5">
            <img src={CREST} alt="" className={`h-11 w-11 rounded-xl border border-border bg-card object-contain p-1.5 ${step === 3 ? ring : ""}`} />
            <span className="text-[9px] text-foreground">Kingdom Protocol</span>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 min-h-8 text-center text-xs font-semibold leading-4 text-primary">{step + 1}. {labels[step]}</figcaption>
    </figure>
  );
}
