import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { type StripeEnv, verifyWebhook, createStripeClient } from "@/lib/stripe.server";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

function priceLookup(item: any): string {
  return item?.price?.lookup_key
    || item?.price?.metadata?.lovable_external_id
    || item?.price?.id;
}

async function cancelActiveMonthlySubs(userId: string, env: StripeEnv) {
  const sb = getSupabase();
  const { data: rows } = await sb
    .from("subscriptions")
    .select("stripe_subscription_id, price_id, status")
    .eq("user_id", userId)
    .eq("environment", env);
  if (!rows) return;
  const stripe = createStripeClient(env);
  for (const row of rows as Array<{ stripe_subscription_id: string; price_id: string; status: string }>) {
    if (row.price_id === "kp_premium_monthly" && ["active", "trialing", "past_due"].includes(row.status)) {
      try {
        await stripe.subscriptions.update(row.stripe_subscription_id, { cancel_at_period_end: true });
      } catch (e) {
        console.error("Failed to cancel monthly sub", row.stripe_subscription_id, e);
      }
    }
  }
}

async function handleSubscriptionUpsert(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("No userId in subscription metadata");
    return;
  }
  const item = subscription.items?.data?.[0];
  const priceId = priceLookup(item);
  const productId = item?.price?.product;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      product_id: productId,
      price_id: priceId,
      status: subscription.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  if (session.mode !== "payment") return;
  const userId = session.metadata?.userId;
  if (!userId) return;
  const stripe = createStripeClient(env);
  const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items.data.price"] });
  const line = full.line_items?.data?.[0];
  const price: any = line?.price;
  const priceId = price?.lookup_key || price?.metadata?.lovable_external_id || price?.id;
  if (priceId !== "kp_lifetime_once") return;

  const productId = typeof price?.product === "string" ? price.product : price?.product?.id;
  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: `lifetime_${session.id}`,
      stripe_customer_id: session.customer,
      product_id: productId,
      price_id: priceId,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: null,
      cancel_at_period_end: false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  // Auto-cancel any active monthly subscription on lifetime purchase
  await cancelActiveMonthlySubs(userId, env);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpsert(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env);
      break;
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object, env);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("Webhook received with invalid env:", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
