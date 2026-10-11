import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAccess } from "@/lib/access.functions";
import { useAuth } from "@/lib/auth";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";

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
            className="kp-lifetime-btn w-full rounded-xl px-5 py-4 text-left text-[#0a0800]"
          >
            <span className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-[0.6rem] font-bold tracking-[0.2em] uppercase opacity-75">Walk for life · Best value</span>
                <span className="block text-lg font-extrabold mt-0.5">Lifetime</span>
              </span>
              <span className="text-right">
                <span className="block text-2xl font-extrabold leading-none">$99</span>
                <span className="block text-[0.65rem] font-semibold opacity-75 mt-1">one time, never again</span>
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => start("kp_premium_monthly")}
            className="w-full rounded-xl border border-[#c9a84c]/45 bg-[#0a0800]/60 px-5 py-3.5 text-left text-[#e8dcc0]"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Monthly</span>
              <span className="text-sm"><span className="font-bold text-[#c9a84c]">$4.99</span><span className="text-[#a49d8e]"> / month · cancel anytime</span></span>
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
          $4.99 / month
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
    if (data.isLifetime) {
      return (
        <div className="mb-5 px-4 py-3 rounded-xl border border-[#3a2f12]" style={{ background: "#141004" }}>
          <p className="text-xs" style={{ color: GOLD }}>Lifetime — you're set.</p>
        </div>
      );
    }
    if (data.trialActive && data.firstChargeAt) {
      return (
        <div className="mb-5 px-4 py-3 rounded-xl border border-[#3a2f12]" style={{ background: "#141004" }}>
          <p className="text-xs" style={{ color: GOLD }}>
            You're set. First payment {formatDay(data.firstChargeAt)}, $4.99/month.
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
  return (
    <div className="p-6 rounded-xl border border-[#3a2f12]" style={{ background: "#161008" }}>
      <p className="text-sm font-semibold" style={{ color: GOLD }}>Your free month is up. Everything is still here.</p>
      <p className="text-xs text-[#c2af80] mt-1 leading-relaxed">
        {action} needs an active plan. Nothing is deleted while your account rests, and being
        someone else's watchman stays free.
      </p>
      <PlanButtons />
    </div>
  );
}
