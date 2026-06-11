import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhook, getPaddleClient, EventName, type PaddleEnv } from '@/lib/paddle.server';

let _supabase: any = null;
function getSupabase(): any {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } = data;
  const userId = customData?.userId;
  if (!userId) { console.error('No userId in customData'); return; }

  const item = items[0];
  const priceId = item.price.importMeta?.externalId;
  const productId = item.product.importMeta?.externalId;
  if (!priceId || !productId) {
    console.warn('Skipping subscription: missing importMeta.externalId', {
      rawPriceId: item.price.id,
      rawProductId: item.product.id,
    });
    return;
  }

  await getSupabase().from('subscriptions').upsert({
    user_id: userId,
    paddle_subscription_id: id,
    paddle_customer_id: customerId,
    product_id: productId,
    price_id: priceId,
    status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'paddle_subscription_id' });
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, currentBillingPeriod, scheduledChange } = data;
  await getSupabase().from('subscriptions')
    .update({
      status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      cancel_at_period_end: scheduledChange?.action === 'cancel',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', id)
    .eq('environment', env);
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  await getSupabase().from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env);
}

// Lifetime is a one-time purchase (no subscription event). Persist it as a
// synthetic subscription row keyed by the transaction so the access check
// works the same way as the monthly plan.
async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  const { id, customerId, items, customData, status } = data;
  if (status !== 'completed' && status !== 'paid') return;

  const userId = customData?.userId;
  if (!userId) { console.warn('Transaction completed with no userId'); return; }

  // Look for the lifetime item.
  const item = items?.find((it: any) => it.price?.importMeta?.externalId === 'kp_lifetime_once');
  if (!item) return;

  const priceId = item.price.importMeta?.externalId;
  // Transaction events don't include product on the item; use the known mapping.
  const productId = 'kp_lifetime';

  await getSupabase().from('subscriptions').upsert({
    user_id: userId,
    paddle_subscription_id: `lifetime_${id}`,
    paddle_customer_id: customerId,
    product_id: productId,
    price_id: priceId,
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: null, // never expires
    environment: env,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'paddle_subscription_id' });
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.eventType) {
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data, env); break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data, env); break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data, env); break;
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data, env); break;
    default:
      console.log('Unhandled event:', event.eventType);
  }
}

export const Route = createFileRoute('/api/public/payments/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error('Webhook error:', e);
          return new Response('Webhook error', { status: 400 });
        }
      },
    },
  },
});
