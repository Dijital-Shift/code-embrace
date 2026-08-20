import { useState } from "react";
import {
  checkForAppUpdate,
  forceAppRefresh,
  requestUpdatePillReexpand,
} from "@/lib/registerServiceWorker";

type Status = "idle" | "checking" | "current" | "found" | "unavailable";

export function AppUpdateSection() {
  const [status, setStatus] = useState<Status>("idle");

  const check = async () => {
    setStatus("checking");
    const result = await checkForAppUpdate("manual").catch(() => "unavailable" as const);
    if (result === "stale" || result === "updating") {
      setStatus("found");
      requestUpdatePillReexpand();
    } else if (result === "current") {
      setStatus("current");
    } else {
      setStatus("unavailable");
    }
  };

  return (
    <div className="mt-12 max-w-md">
      <p className="text-[0.7rem] text-[#9e968a] uppercase tracking-wider font-semibold mb-2">
        App Version
      </p>
      <div className="rounded border border-[#141414] px-3 py-3" style={{ background: "#0a0a0a" }}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-[#b8b0a4]">Check for updates</span>
          <button
            type="button"
            onClick={check}
            disabled={status === "checking"}
            className="text-xs px-3 py-2 bg-[#c9a84c] text-black rounded font-semibold disabled:opacity-60"
          >
            {status === "checking" ? "Checking…" : "Check"}
          </button>
        </div>

        {status === "current" && (
          <p className="text-[0.7rem] text-[#948d80] mt-2">You're on the latest version.</p>
        )}
        {status === "found" && (
          <p className="text-[0.7rem] text-[#c9a84c] mt-2">
            Update ready — tap the gold pill to refresh.
          </p>
        )}
        {status === "unavailable" && (
          <p className="text-[0.7rem] text-[#948d80] mt-2">
            Updates only apply to the installed app.
          </p>
        )}

        <button
          type="button"
          onClick={() => void forceAppRefresh()}
          className="mt-3 text-[0.7rem] text-[#948d80] underline bg-transparent border-0 p-0 cursor-pointer"
        >
          Force refresh
        </button>
      </div>
    </div>
  );
}
