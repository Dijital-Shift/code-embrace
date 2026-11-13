import { useEffect, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { deviceKind, installBrowser, installSteps, type InstallBrowser } from "@/lib/app-mode";
import { useAppInstall } from "@/components/AppInstallProvider";
import { InstallDemo } from "@/components/InstallDemo";

type Tab = "ios" | "android";

/** iPhone / Android install steps that open on the visitor's phone type and adapt to the browser they're in. */
export function InstallWalkthrough() {
  const { available, busy, install } = useAppInstall();
  const [tab, setTab] = useState<Tab>("ios");
  const [browser, setBrowser] = useState<InstallBrowser>("desktop");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setTab(deviceKind(ua, navigator.maxTouchPoints, navigator.platform) === "android" ? "android" : "ios");
    setBrowser(installBrowser(ua, navigator.maxTouchPoints, navigator.platform));
  }, []);

  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 2500); } catch { /* steps still explain */ }
  }

  const steps = installSteps(tab, browser);
  const oneTap = tab === "android" && (available || busy);

  return (
    <div className="mt-5">
      <div role="tablist" aria-label="Phone type" className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1">
        {(["ios", "android"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            {t === "ios" ? "iPhone / iPad" : "Android"}
          </button>
        ))}
      </div>
      {oneTap && (
        <button type="button" onClick={() => void install()} disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground">
          <Download className="h-4 w-4" /> {busy ? "Installing…" : "Install Kingdom Protocol"}
        </button>
      )}
      {!["inapp", "ios-other", "android-other"].includes(browser) && <InstallDemo tab={tab} />}
      <ol className="mt-5 grid gap-3">
        {steps.map((s, i) => (
          <li key={`${tab}-${i}`} className="flex items-start gap-3 text-sm text-foreground">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary text-primary font-semibold">{i + 1}</span>
            <div className="pt-1">
              {s.text}
              {s.copyLink && (
                <button type="button" onClick={copyLink} className="mt-2 flex min-h-11 items-center gap-1.5 rounded-lg border border-primary px-3 text-xs font-semibold text-primary">
                  {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Link copied" : "Copy this page's link"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
