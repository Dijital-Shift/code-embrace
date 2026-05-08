export function checkCronAuth(request: Request): Response | null {
  const expected = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const provided = request.headers.get('apikey') || request.headers.get('x-apikey');
  if (!expected) return null;
  if (provided !== expected) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}
