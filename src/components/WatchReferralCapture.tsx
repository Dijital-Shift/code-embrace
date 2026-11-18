import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth";
import { saveWatchReferral } from "@/lib/watch-requests.functions";
import { WATCH_REFERRAL_EVENT, WATCH_REFERRAL_KEY, decodeWatchReferral } from "@/lib/watch-referral";

// Moves a remembered Watchman link onto the signed-in account, so "Invite {name}"
// still appears after installing the app or switching devices.
export function WatchReferralCapture() {
  const { user } = useAuth();
  const save = useServerFn(saveWatchReferral);
  useEffect(() => {
    if (!user) return;
    let busy = false;
    const run = () => {
      if (busy) return;
      let raw: string | null = null;
      try { raw = localStorage.getItem(WATCH_REFERRAL_KEY); } catch { return; }
      const ref = decodeWatchReferral(raw, Date.now());
      if (!ref) { try { if (raw) localStorage.removeItem(WATCH_REFERRAL_KEY); } catch { /* blocked */ } return; }
      busy = true;
      save({ data: { token: ref.token } })
        .then(() => { try { localStorage.removeItem(WATCH_REFERRAL_KEY); } catch { /* blocked */ } })
        .catch(() => undefined)
        .finally(() => { busy = false; });
    };
    run();
    window.addEventListener(WATCH_REFERRAL_EVENT, run);
    return () => window.removeEventListener(WATCH_REFERRAL_EVENT, run);
  }, [user?.id, save]);
  return null;
}
