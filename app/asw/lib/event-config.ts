const FALLBACK_EVENT_SLUG = 'asw-2026';

export function getDefaultEventSlug(): string {
  const fromPublicEnv = process.env.NEXT_PUBLIC_DEFAULT_EVENT_SLUG?.trim();
  if (fromPublicEnv) return fromPublicEnv;

  const fromServerEnv = process.env.DEFAULT_EVENT_SLUG?.trim();
  if (fromServerEnv) return fromServerEnv;

  return FALLBACK_EVENT_SLUG;
}
