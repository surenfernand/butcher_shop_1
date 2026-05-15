/**
 * Default remote image when CMS media has no `url`.
 * Override with `NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL` (must match `next.config.ts` → `images.remotePatterns`).
 */
export const PLACEHOLDER_IMAGE_URL: string =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL?.trim()) ||
  'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=1600&q=80'

/** Returns the media URL when present; otherwise the configured placeholder. */
export function mediaUrlOrPlaceholder(url: string | null | undefined): string {
  if (typeof url === 'string' && url.trim() !== '') return url
  return PLACEHOLDER_IMAGE_URL
}
