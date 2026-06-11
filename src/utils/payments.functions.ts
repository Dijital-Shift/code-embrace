import { createServerFn } from "@tanstack/react-start";
import { gatewayFetch, getPaddleClient, type PaddleEnv } from "@/lib/paddle.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const resolvePaddlePrice = createServerFn({ method: "GET" })
  .inputValidator((data: { priceId: string; environment: PaddleEnv }) => data)
  .handler(async ({ data }) => {
    const response = await gatewayFetch(
      data.environment,
      `/prices?external_id=${encodeURIComponent(data.priceId)}`,
    );
    const result = await response.json();
    if (!result.data?.length) throw new Error("Price not found");
    return result.data[0].id as string;
  });

/**
 * Cancel the user's active monthly subscription at period end.
 * Called after a Lifetime purchase so they don't double-pay.
 */
export const cancelMonthlyAtPeriodEnd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { environment: PaddleEnv }) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("paddle_subscription_id, product_id, status")
      .eq("user_id", userId)
      .eq("environment", data.environment)
      .eq("product_id", "kp_premium")
      .in("status", ["active", "trialing", "past_due"]);

    if (!subs?.length) return { canceled: 0 };

    const paddle = getPaddleClient(data.environment);
    let canceled = 0;
    for (const s of subs) {
      try {
        await paddle.subscriptions.cancel(s.paddle_subscription_id, {
          effectiveFrom: "next_billing_period",
        });
        canceled++;
      } catch (e) {
        console.error("Failed to cancel sub", s.paddle_subscription_id, e);
      }
    }
    return { canceled };
  });
