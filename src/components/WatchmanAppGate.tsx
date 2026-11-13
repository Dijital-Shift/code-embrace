import { useEffect, useState, type ReactNode } from "react";
import { BellRing } from "lucide-react";
import { deviceKind, mustOpenInApp } from "@/lib/app-mode";
import { InstallWalkthrough } from "@/components/InstallWalkthrough";

/** On a phone browser, the Watchman finishes in the installed app, because breach alarms reach only the Home Screen app. */
export function WatchmanAppGate({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState<boolean | null>(null);
  useEffect(() => {
    const kind = deviceKind(navigator.userAgent, navigator.maxTouchPoints, navigator.platform);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    let embedded = false;
    try { embedded = window.self !== window.top; } catch { embedded = true; }
    setLocked(mustOpenInApp({ kind, standalone, embedded }));
  }, []);
  if (locked === null) return null;
  if (!locked) return <>{children}</>;
  return (
    <section className="kp-role-briefing p-5 rounded-md border border-border">
      <div className="flex items-center gap-2 text-primary"><BellRing size={18} aria-hidden="true" /><p className="text-xs font-semibold uppercase tracking-wider">One step left</p></div>
      <h2 className="mt-2 text-xl font-bold text-parchment leading-tight">Put Kingdom Protocol on your Home Screen.</h2>
      <p className="mt-2 text-sm text-stone">Your watch is saved. Alarms can't reach a browser tab, only the app on your Home Screen. No app store. Under a minute.</p>
      <InstallWalkthrough />
      <p className="mt-5 text-sm text-stone">In the app, sign in with the same account. Your watch is waiting there.</p>
    </section>
  );
}
