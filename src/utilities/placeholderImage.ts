/**
 * Remote fallbacks when CMS media has no `url` (or no media).
 * All defaults use `images.unsplash.com` — must stay allowed in `next.config.ts` → `images.remotePatterns`.
 *
 * Overrides (optional):
 * - `NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL` — used for any area when no per-area override is set
 * - `NEXT_PUBLIC_PLACEHOLDER_<AREA>_URL` — e.g. `NEXT_PUBLIC_PLACEHOLDER_HERO_URL` (AREA = uppercase key from PlaceholderArea)
 */

const u = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/** Built-in Unsplash assets (butcher / craft / venue themed). */
const BUILT_IN = {
  /** Generic CMS `Media` with empty URL — treat like product photography */
  default: u('photo-1604503468506-a8da13d82791', 1600),
  product: u('photo-1604503468506-a8da13d82791', 1600),
  cart: u('photo-1567521214889-8a446d5f901a', 1200),
  gallery: u('photo-1604503468506-a8da13d82791', 1600),
  hero: u('photo-1544025162-d76694265947', 2000),
  logo: u('photo-1607623813342-90543285690a', 800),
  story: u('photo-1588347818038-88fda0d7f1a0', 1600),
  location: u('photo-1517248135467-4c7edcad34c4', 1600),
  info: u('photo-1558030006-425675369496', 1600),
  editorial: u('photo-1567521214889-8a446d5f901a', 1600),
  featured: u('photo-1599488615731-7e0c95d66f58', 1600),
  seo: u('photo-1604503468506-a8da13d82791', 1200),
} as const

export type PlaceholderArea = keyof typeof BUILT_IN

const AREA_ENV_KEYS: Record<PlaceholderArea, string> = {
  default: 'NEXT_PUBLIC_PLACEHOLDER_DEFAULT_URL',
  product: 'NEXT_PUBLIC_PLACEHOLDER_PRODUCT_URL',
  cart: 'NEXT_PUBLIC_PLACEHOLDER_CART_URL',
  gallery: 'NEXT_PUBLIC_PLACEHOLDER_GALLERY_URL',
  hero: 'NEXT_PUBLIC_PLACEHOLDER_HERO_URL',
  logo: 'NEXT_PUBLIC_PLACEHOLDER_LOGO_URL',
  story: 'NEXT_PUBLIC_PLACEHOLDER_STORY_URL',
  location: 'NEXT_PUBLIC_PLACEHOLDER_LOCATION_URL',
  info: 'NEXT_PUBLIC_PLACEHOLDER_INFO_URL',
  editorial: 'NEXT_PUBLIC_PLACEHOLDER_EDITORIAL_URL',
  featured: 'NEXT_PUBLIC_PLACEHOLDER_FEATURED_URL',
  seo: 'NEXT_PUBLIC_PLACEHOLDER_SEO_URL',
}

function readEnv(key: string): string | undefined {
  if (typeof process === 'undefined') return undefined
  const v = process.env[key]?.trim()
  return v || undefined
}

/** Resolved URL for a UI context (env overrides → global → built-in). */
export function placeholderFor(area: PlaceholderArea = 'default'): string {
  const perArea = readEnv(AREA_ENV_KEYS[area])
  if (perArea) return perArea

  const global = readEnv('NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL')
  if (global) return global

  return BUILT_IN[area]
}

/**
 * @deprecated Prefer `placeholderFor('product')` etc. Kept for imports that mean “generic Media fallback”.
 * Same resolution as `placeholderFor('default')`.
 */
export const PLACEHOLDER_IMAGE_URL: string = placeholderFor('default')

/** Returns the media URL when present; otherwise the placeholder for that area. */
export function mediaUrlOrPlaceholder(
  url: string | null | undefined,
  area: PlaceholderArea = 'product',
): string {
  if (typeof url === 'string' && url.trim() !== '') return url
  return placeholderFor(area)
}
