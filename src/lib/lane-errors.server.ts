export function friendlyLaneError(
  error: { code?: string; message?: string } | null | undefined,
  title: string,
): string {
  if (error?.code === '23505' || (error?.message ?? '').includes('lanes_user_id_title_key')) {
    return `You already have a path called "${title}". Give this one a different name — for example "${title} — week one" — or reopen the existing one.`;
  }
  return error?.message ?? 'Something went wrong.';
}
