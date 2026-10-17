import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAccess } from "@/lib/access.functions";
import { useAuth } from "@/lib/auth";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { createPortalSession, requestRefund } from "@/utils/payments.functions";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getStripeEnvironment } from "@/lib/stripe";

const GOLD = "#c9a84c";

export function useAccessState() {
  const fn = useServerFn(getAccess);
  const { user } = useAuth();
  return useQuery({
    queryKey: ["access", user?.id],
    queryFn: () => fn(),
    enabled: !!user,
    staleTime: 60_000,
  });
}

function formatDay(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function PlanButtons({ compact, deferToTrialEnd, premium }: { compact?: boolean; deferToTrialEnd?: boolean; premium?: boolean }) {
  const { user } = useAuth();
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();
  const start = (priceId: string) =>
    openCheckout({
      priceId,
      customerEmail: user?.email,
      userId: user?.id,
      deferToTrialEnd: deferToTrialEnd && priceId === "kp_premium_monthly",
      returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });

  return (
    <>
      {premium ? (
        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => start("kp_lifetime_once")}
            className="kp-lifetime-btn w-full rounded-xl px-5 py-4 text-[#0a0800]"
          >
            <span className="block text-center text-[0.6rem] font-bold tracking-[0.28em] uppercase opacity-70">Walk for life</span>
            <span className="mt-1.5 flex items-end justify-between gap-3">
              <span className="text-left">
                <span className="block text-xl font-extrabold leading-none">Lifetime</span>
                <span className="block text-[0.68rem] font-semibold opacity-75 mt-1.5">One time. Never again.</span>
              </span>
              <span className="text-3xl font-extrabold leading-none tracking-tight">$99</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => start("kp_premium_monthly")}
            className="w-full rounded-xl border border-[#c9a84c]/45 bg-[#0a0800]/60 px-5 py-3.5 text-left text-[#e8dcc0]"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Monthly</span>
              <span className="text-sm"><span className="font-bold text-[#c9a84c]">$7.99</span><span className="text-[#a49d8e]"> / month · cancel anytime</span></span>
            </span>
          </button>
        </div>
      ) : (
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => start("kp_premium_monthly")}
          className={`rounded-lg border border-[#c9a84c]/40 text-[#c9a84c] font-semibold ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"}`}
        >
          $7.99 / month
        </button>
        <button
          type="button"
          onClick={() => start("kp_lifetime_once")}
          className={`rounded-lg bg-[#c9a84c] text-black font-bold ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm"}`}
        >
          $99 lifetime
        </button>
      </div>
      )}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 overflow-y-auto p-4 flex items-start justify-center">
          <div className="w-full max-w-2xl mt-8 bg-white rounded-2xl overflow-hidden">
            <div className="flex justify-end p-2">
              <button type="button" onClick={closeCheckout} className="text-gray-600 hover:text-black px-3 py-1 text-sm font-medium">
                Close
              </button>
            </div>
            {checkoutElement}
          </div>
        </div>
      )}
    </>
  );
}

/** Soft trial notice / final-stretch prompt / resting notice. */
export function AccessBanner() {
  const { data } = useAccessState();
  if (!data) return null;

  // Lapsed — the account is resting, nothing is lost.
  if (!data.hasAccess) {
    return (
      <div className="kp-upgrade mb-6">
        <div className="kp-upgrade-inner">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c9a84c]/40 px-3 py-1 text-[0.6rem] font-bold tracking-[0.22em] uppercase text-[#c9a84c]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" /> Resting · Record intact
            </span>
          </div>
          <h2 className="mt-4 text-center text-xl leading-snug text-[#f3e6c4]" style={{ fontFamily: "Cinzel, serif" }}>
            Your free month is up.<br />
            <span className="text-[#c9a84c]">Everything is still here.</span>
          </h2>
          <ul className="mt-5 space-y-2.5 text-sm text-[#d6c9a8]">
            {[
              "Your paths, history and watchmen stay exactly where you left them",
              "Nothing counts against you while it rests",
              "Being someone else's watchman stays free",
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="mt-[3px] text-[#c9a84c] text-xs">◆</span>
                <span className="leading-snug">{t}</span>
              </li>
            ))}
          </ul>
          <PlanButtons premium />
          <p className="mt-4 text-center text-[0.7rem] text-[#8f887c]">Pick a plan and your walk resumes immediately.</p>
        </div>
      </div>
    );
  }

  // Already paid — quiet confirmation, no countdown.
  if (data.planLockedIn) {
    if (data.trialActive && data.firstChargeAt) {
      return (
        <div className="mb-5 px-4 py-3 rounded-xl border border-[#3a2f12]" style={{ background: "#141004" }}>
          <p className="text-xs" style={{ color: GOLD }}>
            You're set. First payment {formatDay(data.firstChargeAt)}, $7.99/month.
          </p>
        </div>
      );
    }
    return null;
  }

  // Final five days — an active prompt, not a passive line.
  if (data.inFinalStretch) {
    return (
      <div className="mb-5 p-4 rounded-xl border border-[#c9a84c]/50" style={{ background: "#1c1506" }}>
        <p className="text-sm font-semibold" style={{ color: GOLD }}>
          {data.daysLeft} day{data.daysLeft === 1 ? "" : "s"} left in your free month.
        </p>
        <p className="text-xs text-[#c2af80] mt-1 leading-relaxed">
          Lock it in now and nothing changes until the day it ends — you keep every free day left.
        </p>
        <PlanButtons deferToTrialEnd />
      </div>
    );
  }

  if (data.trialActive) {
    return (
      <div className="mb-5 px-4 py-3 rounded-xl border border-[#3a2f12] flex items-center justify-between gap-3" style={{ background: "#141004" }}>
        <p className="text-xs" style={{ color: GOLD }}>
          <span className="font-semibold">{data.daysLeft} day{data.daysLeft === 1 ? "" : "s"}</span> left in your first month.
        </p>
      </div>
    );
  }

  return null;
}

/** Small gold mark beside the greeting — lifetime members, and nothing else. */
export function LifetimeBadge() {
  const { data } = useAccessState();
  if (!data?.isLifetime) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[0.55rem] font-bold uppercase tracking-[0.22em]"
      style={{
        borderColor: "rgba(201,168,76,0.35)",
        background: "linear-gradient(180deg, rgba(201,168,76,0.14), rgba(201,168,76,0.03))",
        color: GOLD,
      }}
      title="Lifetime member"
    >
      <span className="w-1 h-1 rounded-full" style={{ background: GOLD }} />
      Lifetime
    </span>
  );
}

/** Once-a-day reminder in the last five days of the free month. */
export function TrialEndingModal() {
  const { data } = useAccessState();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(true);

  const show = !!data?.inFinalStretch;
  const key = user?.id ? `kp-trial-nudge:${user.id}:${new Date().toLocaleDateString("en-CA")}` : null;

  useEffect(() => {
    if (!show || !key) return;
    try {
      setDismissed(localStorage.getItem(key) === "1");
    } catch {
      setDismissed(false);
    }
  }, [show, key]);

  if (!show || dismissed || !data) return null;

  function close() {
    if (key) {
      try { localStorage.setItem(key, "1"); } catch { /* private mode */ }
    }
    setDismissed(true);
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/75 flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-2xl border border-[#c9a84c]/40 p-6" style={{ background: "#120e05" }}>
        <p className="text-lg font-bold" style={{ color: GOLD }}>
          Your free month ends in {data.daysLeft} day{data.daysLeft === 1 ? "" : "s"}.
        </p>
        <p className="text-sm text-[#c2af80] mt-2 leading-relaxed">
          Your paths, your history and your watchmen all stay. Choose now and nothing changes until
          the day your free month ends — you keep every free day you have left.
        </p>
        <PlanButtons deferToTrialEnd />
        <button
          type="button"
          onClick={close}
          className="mt-4 w-full text-xs text-[#9e968a] bg-transparent border-0 py-1"
        >
          Not yet
        </button>
      </div>
    </div>
  );
}

/** Hard gate: renders children only when access is granted. */
export function AccessGate({ children, action }: { children: React.ReactNode; action: string }) {
  const { data, isLoading } = useAccessState();
  if (isLoading || !data) return <>{children}</>;
  if (data.hasAccess) return <>{children}</>;
  return <AccessBanner />;
}

/** Settings → Plan: always-available upgrade, regardless of trial day. */
export function PlanSection({ showReceipts }: { showReceipts?: boolean } = {}) {
  const { data } = useAccessState();
  const portalFn = useServerFn(createPortalSession);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const refundFn = useServerFn(requestRefund);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [refundErr, setRefundErr] = useState<string | null>(null);
  const [refundArmed, setRefundArmed] = useState(false);
  useEffect(() => {
    if (!refundArmed) return;
    const t = setTimeout(() => setRefundArmed(false), 5000);
    return () => clearTimeout(t);
  }, [refundArmed]);
  useEffect(() => { if (!refundOpen) setRefundArmed(false); }, [refundOpen]);
  if (!data) return null;

  async function manage() {
    setErr(null); setBusy(true);
    // Open the tab synchronously on tap so Safari/iOS don't block it as a pop-up.
    const tab = window.open("", "_blank");
    try {
      const r = await portalFn({ data: { returnUrl: window.location.href, environment: getStripeEnvironment() } });
      if ("error" in r) throw new Error(r.error);
      if (tab && !tab.closed) tab.location.href = r.url;
      else window.location.href = r.url;
    } catch (e: any) {
      tab?.close();
      setErr(e?.message ?? "Couldn't open billing.");
    } finally { setBusy(false); }
  }

  async function confirmRefund() {
    if (refunding) return;
    setRefundErr(null); setRefunding(true);
    try {
      const r = await refundFn({ data: { environment: getStripeEnvironment() } });
      if ("error" in r) throw new Error(r.error);
      setRefundOpen(false);
      toast.success("Refund issued", { description: r.message, duration: 8000 });
      setTimeout(() => window.location.reload(), 1500);
    } catch (e: any) {
      setRefundErr(e?.message ?? "Couldn't process the refund.");
    } finally { setRefunding(false); }
  }

  let title = "";
  let sub = "";
  if (data.isLifetime) { title = "Lifetime"; sub = "You're set for life. Nothing more to pay."; }
  else if (data.planLockedIn) {
    title = "Monthly · $7.99";
    sub = data.firstChargeAt ? `Next payment ${formatDay(data.firstChargeAt)}.` : "Active.";
  } else if (data.trialActive) {
    title = "Free month";
    sub = `${data.daysLeft} day${data.daysLeft === 1 ? "" : "s"} left. Lock in now — monthly keeps every free day left; first charge waits until your free month ends.`;
  } else { title = "Resting"; sub = "Your record is intact. Pick a plan to resume."; }

  return (
    <div className="mt-10">
      <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-[0.18em] font-semibold mb-3 px-1">Plan</p>
      <div className="kp-card p-5">
        <p className="text-base font-semibold" style={{ color: GOLD }}>{title}</p>
        <p className="text-xs text-[#a8a094] mt-1 leading-relaxed">{sub}</p>
        {!data.isLifetime && !data.planLockedIn && <PlanButtons premium deferToTrialEnd={data.trialActive} />}
        {data.planLockedIn && !data.isLifetime && (
          <>
            <PlanButtonsLifetimeOnly />
            <button type="button" disabled={busy} onClick={manage} className="mt-3 w-full text-xs text-[#c9a84c] underline bg-transparent border-0 py-1">
              {busy ? "Opening…" : "Manage billing"}
            </button>
          </>
        )}
        {showReceipts && data.isLifetime && (
          <button type="button" disabled={busy} onClick={manage} className="mt-3 w-full text-xs text-[#c9a84c] underline bg-transparent border-0 py-1">
            {busy ? "Opening…" : "Receipts & purchase details"}
          </button>
        )}
        {showReceipts && data.planLockedIn && !data.isLifetime && (
          <p className="text-[0.7rem] text-[#8f887c] mt-2 text-center">Manage billing shows your receipts, card, and cancel option.</p>
        )}
        {err && <p className="text-xs text-red-400 mt-2">{err}</p>}
        {showReceipts && data.planLockedIn && (
          <div className="mt-5 pt-4 border-t border-[#c9a84c]/15">
            <button type="button" onClick={() => { setRefundErr(null); setRefundOpen(true); }} className="w-full text-sm text-[#ded8cc] bg-transparent border border-[#c9a84c]/30 rounded-xl py-2.5">
              Request a refund
            </button>
            <p className="text-[0.65rem] text-[#8f887c] mt-2 text-center">Within 30 days. Self-serve — no email needed.</p>
          </div>
        )}
      </div>
      <Dialog open={refundOpen} onOpenChange={(o) => { if (!refunding) setRefundOpen(o); }}>
        <DialogContent className="kp-removal-dialog max-w-sm">
          <DialogTitle style={{ color: GOLD }}>Request a refund?</DialogTitle>
          <DialogDescription className="text-sm text-[#a8a094] leading-relaxed">
            {data.isLifetime
              ? "We'll refund your $99 Lifetime purchase to your original payment method."
              : "We'll refund your most recent $7.99 charge and cancel your monthly plan."}
            {" "}It usually appears in 5–10 business days. Your account returns to resting — your Paths, history, and Watchman messages stay intact.
          </DialogDescription>
          {refundErr && <p className="text-xs text-red-400">{refundErr}</p>}
          <div className="flex flex-col mt-3">
            <button type="button" disabled={refunding} onClick={() => setRefundOpen(false)} className="w-full rounded-xl py-3 text-sm font-semibold text-[#ded8cc] bg-transparent border border-[#c9a84c]/30">
              Keep my plan
            </button>
            <div className="h-8" aria-hidden="true" />
            <button
              type="button"
              disabled={refunding}
              onClick={() => { if (refundArmed) confirmRefund(); else setRefundArmed(true); }}
              aria-live="polite"
              className="w-full rounded-xl py-3 text-sm font-bold disabled:opacity-60 transition-colors"
              style={refundArmed ? { background: "#b45309", color: "#fff7ed" } : { background: "transparent", color: GOLD, border: `1px solid ${GOLD}` }}
            >
              {refunding ? "Processing…" : refundArmed ? "Are you sure? Tap to confirm" : "Yes, refund me"}
            </button>
            {refundArmed && !refunding && <p className="text-[0.65rem] text-[#8f887c] mt-2 text-center">Resets in 5 seconds if you don't confirm.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanButtonsLifetimeOnly() {
  const { user } = useAuth();
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();
  return (
    <>
      <button
        type="button"
        onClick={() => openCheckout({ priceId: "kp_lifetime_once", customerEmail: user?.email, userId: user?.id, returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}` })}
        className="kp-lifetime-btn mt-4 w-full rounded-xl px-5 py-3.5 text-[#0a0800] font-bold text-sm"
      >
        Upgrade to Lifetime · $99
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 overflow-y-auto p-4 flex items-start justify-center">
          <div className="w-full max-w-2xl mt-8 bg-white rounded-2xl overflow-hidden">
            <div className="flex justify-end p-2">
              <button type="button" onClick={closeCheckout} className="text-gray-600 hover:text-black px-3 py-1 text-sm font-medium">Close</button>
            </div>
            {checkoutElement}
          </div>
        </div>
      )}
    </>
  );
}
