import { createServerFn } from '@tanstack/react-start';

// Public: the VAPID public key is safe to expose to the browser — it's the
// applicationServerKey the client needs to create a push subscription.
export const getVapidPublicKey = createServerFn({ method: 'GET' }).handler(async () => {
  return { key: process.env['VAPID_PUBLIC_KEY'] ?? null };
});
