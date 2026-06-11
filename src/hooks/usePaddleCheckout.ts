import { useState } from "react";
import { initializePaddle, getPaddlePriceId, getPaddleEnvironment } from "@/lib/paddle";
import { useAuth } from "@/lib/auth";
import { cancelMonthlyAtPeriodEnd } from "@/utils/payments.functions";

export function usePaddleCheckout() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const openCheckout = async (options: {
    priceId: string;
    successUrl?: string;
  }) => {
    setLoading(true);
    try {
      await initializePaddle();
      const paddlePriceId = await getPaddlePriceId(options.priceId);
      const environment = getPaddleEnvironment();

      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        customer: user?.email ? { email: user.email } : undefined,
        customData: {
          userId: user?.id || "",
          priceId: options.priceId,
          environment,
        },
        settings: {
          displayMode: "overlay",
          successUrl: options.successUrl || `${window.location.origin}/dashboard?checkout=success`,
          allowLogout: false,
          variant: "one-page",
        },
        eventCallback: async (event: any) => {
          if (
            event?.name === "checkout.completed" &&
            options.priceId === "kp_lifetime_once" &&
            user
          ) {
            try {
              await cancelMonthlyAtPeriodEnd({ data: { environment } });
            } catch (e) {
              console.error("Failed to auto-cancel monthly:", e);
            }
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
