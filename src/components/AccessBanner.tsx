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

function PlanButtons({ compact }: { compact?: boolean }) {
  const { user } = useAuth();
  const { openCheckout, closeCheckout, isOpen, checkoutElement } = useStripeCheckout();
  const start = (priceId: string) =>
    openCheckout({
      priceId,
      customerEmail: user?.email,
      userId: user?.id,
      returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    });

  return (
    <>
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
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto p-4 flex items-start justify-center">
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

/** Soft trial notice / firm lapsed notice. Renders nothing for paid users. */
export function AccessBanner() {
  const { data } = useAccessState();
  if (!data) return null;

  if (!data.hasAccess) {
    return (
      <div className="mb-5 p-5 rounded-xl border border-[#7f1d1d]" style={{ background: "#1a0b0b" }}>
        <p className="text-sm font-semibold text-[#f87171]">Your free month has ended.</p>
        <p className="text-xs text-[#c9a3a3] mt-1 leading-relaxed">
          Your paths and history stay right where they are. Choose a plan to check in again.
        </p>
        <PlanButtons />
      </div>
    );
  }

  if (data.trialActive) {
    return (
      <div className="mb-5 px-4 py-3 rounded-xl border border-[#3a2f12] flex items-center justify-between gap-3" style={{ background: "#141004" }}>
        <p className="text-xs" style={{ color: GOLD }}>
          <span className="font-semibold">{data.daysLeft} day{data.daysLeft === 1 ? "" : "s"}</span> left in your first month — free, no card.
        </p>
      </div>
    );
  }

  return null;
}

/** Hard gate: renders children only when access is granted. */
export function AccessGate({ children, action }: { children: React.ReactNode; action: string }) {
  const { data, isLoading } = useAccessState();
  if (isLoading || !data) return <>{children}</>;
  if (data.hasAccess) return <>{children}</>;
  return (
    <div className="p-6 rounded-xl border border-[#7f1d1d]" style={{ background: "#1a0b0b" }}>
      <p className="text-sm font-semibold text-[#f87171]">Your free month has ended.</p>
      <p className="text-xs text-[#c9a3a3] mt-1 leading-relaxed">{action} requires an active plan. Watchmen are always free.</p>
      <PlanButtons />
    </div>
  );
}
