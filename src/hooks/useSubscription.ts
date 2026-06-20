import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { getStripeEnvironment } from "@/lib/stripe";

export interface Subscription {
  stripe_subscription_id: string;
  product_id: string;
  price_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  environment: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  let env: string;
  try { env = getStripeEnvironment(); } catch { env = "sandbox"; }

  async function refetch(userId: string) {
    const { data } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, product_id, price_id, status, current_period_end, cancel_at_period_end, environment")
      .eq("user_id", userId)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription((data as Subscription | null) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    if (!user) { setSubscription(null); setLoading(false); return; }
    refetch(user.id);

    const channel = supabase
      .channel(`subs:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => refetch(user.id),
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, env]);

  const isLifetime = subscription?.price_id === "kp_lifetime_once" && subscription?.status === "active";
  const isActive = !!subscription && (
    isLifetime ||
    (["active", "trialing", "past_due"].includes(subscription.status) &&
      (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date())) ||
    (subscription.status === "canceled" && !!subscription.current_period_end && new Date(subscription.current_period_end) > new Date())
  );

  return { subscription, isActive, isLifetime, loading };
}
