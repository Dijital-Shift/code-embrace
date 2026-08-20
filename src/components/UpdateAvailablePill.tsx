import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  APP_UPDATE_AVAILABLE_EVENT,
  APP_UPDATE_BLOCKED_CHANGED_EVENT,
  APP_UPDATE_REEXPAND_EVENT,
  applyAppUpdate,
  isAppUpdateAvailable,
  isUpdateBlocked,
} from "@/lib/registerServiceWorker";
import { cn } from "@/lib/utils";

type Mode = "hidden" | "expanded" | "collapsed";

const EXPANDED_MS = 30_000;

const UpdateAvailablePill = () => {
  const [mode, setMode] = useState<Mode>("hidden");
  const [applying, setApplying] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAppUpdateAvailable()) setMode((prev) => (prev === "hidden" ? "expanded" : prev));

    const onAvailable = () => setMode((prev) => (prev === "hidden" ? "expanded" : prev));
    const onReexpand = () => {
      if (isAppUpdateAvailable()) setMode("expanded");
    };
    const onBlockedChanged = () => setBusy(isUpdateBlocked());

    setBusy(isUpdateBlocked());
    window.addEventListener(APP_UPDATE_AVAILABLE_EVENT, onAvailable);
    window.addEventListener(APP_UPDATE_REEXPAND_EVENT, onReexpand);
    window.addEventListener(APP_UPDATE_BLOCKED_CHANGED_EVENT, onBlockedChanged);
    return () => {
      window.removeEventListener(APP_UPDATE_AVAILABLE_EVENT, onAvailable);
      window.removeEventListener(APP_UPDATE_REEXPAND_EVENT, onReexpand);
      window.removeEventListener(APP_UPDATE_BLOCKED_CHANGED_EVENT, onBlockedChanged);
    };
  }, []);

  useEffect(() => {
    if (mode !== "expanded") return;
    const t = window.setTimeout(() => setMode("collapsed"), EXPANDED_MS);
    return () => window.clearTimeout(t);
  }, [mode]);

  // Stay out of the way while the user is mid-check-in.
  if (busy) return null;
  if (mode === "hidden") return null;

  const handleApply = () => {
    if (applying) return;
    setApplying(true);
    applyAppUpdate();
  };

  return (
    <div
      className="pointer-events-none fixed right-3 z-[60] flex justify-end md:right-[max(0.75rem,calc(50%-17rem))]"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      {mode === "expanded" ? (
        <button
          type="button"
          onClick={handleApply}
          aria-label="Update available — tap to apply"
          className={cn(
            "pointer-events-auto group flex items-center gap-2 rounded-full",
            "border border-[#c9a84c]/60 bg-[#0a0800]/90 backdrop-blur",
            "px-3.5 py-2 text-xs font-medium tracking-wide text-[#e8dfc4] shadow-lg shadow-black/50",
            "transition-all duration-500 hover:border-[#c9a84c] hover:bg-[#0a0800]",
          )}
        >
          <RefreshCw className={cn("h-3.5 w-3.5 text-[#c9a84c]", applying && "animate-spin")} />
          <span>{applying ? "Updating…" : "Update ready · tap to refresh"}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setMode("expanded")}
          aria-label="App update available"
          title="Update available"
          className={cn(
            "pointer-events-auto h-3 w-3 rounded-full",
            "bg-[#c9a84c] shadow-[0_0_0_3px_rgba(201,168,76,0.18)]",
            "animate-pulse ring-1 ring-[#c9a84c]/70",
            "transition-transform hover:scale-125",
          )}
        />
      )}
    </div>
  );
};

export default UpdateAvailablePill;
