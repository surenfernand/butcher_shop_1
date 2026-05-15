/**
 * Temporary / fallback image URLs when CMS media has no usable `url` (e.g. S3 not wired yet).
 * Defaults use `images.unsplash.com` (allowed in `next.config.ts` → `images.remotePatterns`).
 *
 * **Until S3 is connected**
 * - In **development**, URLs that look like Payload media API paths or object storage are
 *   replaced with placeholders so the UI still shows relevant images.
 * - In **production**, set `NEXT_PUBLIC_TEMP_MEDIA_UNTIL_S3=true` for the same behavior, or
 *   `NEXT_PUBLIC_MEDIA_USE_TEMP_IMAGES=true` to always use placeholders for CMS `url` fields.
 * - Set `NEXT_PUBLIC_TEMP_MEDIA_UNTIL_S3=false` to turn off the dev default once uploads work.
 *
 * Overrides:
 * - `NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL` — used for any area when no per-area override is set
 * - `NEXT_PUBLIC_PLACEHOLDER_<AREA>_URL` — e.g. `NEXT_PUBLIC_PLACEHOLDER_HERO_URL` (AREA uppercase)
 */

const u = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/** Curated butcher / craft / venue shots (stable Unsplash photo ids). */
const BUILT_IN = {
  /** Generic CMS `Media` with empty URL */
  default: u('photo-1604503468506-a8da13d82791', 1600),
  product: u('photo-1604503468506-a8da13d82791', 1600),
  cart: u('photo-1567521214889-8a446d5f901a', 1200),
  gallery: u('photo-1604503468506-a8da13d82791', 1600),
  hero: u('photo-1544025162-d76694265947', 2400),
  logo: u('photo-1607623813342-90543285690a', 800),
  story: u('photo-1588347818038-88fda0d7f1a0', 1600),
  location: u('photo-1559339352-11d035aa65de', 1600),
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

/** When true, CMS `url` values that point at storage/API are ignored in favor of placeholders. */
export function tempMediaBypassEnabled(): boolean {
  if (readEnv('NEXT_PUBLIC_MEDIA_USE_TEMP_IMAGES') === 'true') return true
  const flag = readEnv('NEXT_PUBLIC_TEMP_MEDIA_UNTIL_S3')
  if (flag === 'true') return true
  if (flag === 'false') return false
  return process.env.NODE_ENV === 'development'
}

/**
 * True → treat URL as unusable (empty, local Payload media route, or object storage host)
 * and show a placeholder instead. Used without S3 / broken uploads.
 */
export function shouldUseTempPlaceholder(resolvedUrl: string | null | undefined): boolean {
  if (!tempMediaBypassEnabled()) return false
  const s = (resolvedUrl ?? '').trim()
  if (!s) return true
  const lower = s.toLowerCase()
  if (lower.startsWith('/') && (lower.includes('/api/media') || lower.includes('/media/')))
    return true
  if (
    /(amazonaws\.com|digitaloceanspaces\.com|cloudflarestorage\.com|supabase\.co\/storage|r2\.dev)/i.test(
      lower,
    )
  )
    return true
  return false
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
 * @deprecated Prefer `placeholderFor('product')` etc. Kept for backward compatibility.
 * Same resolution as `placeholderFor('default')`.
 */
export const PLACEHOLDER_IMAGE_URL: string = placeholderFor('default')

/** Returns the media URL when present and usable; otherwise the placeholder for that area. */
export function mediaUrlOrPlaceholder(
  url: string | null | undefined,
  area: PlaceholderArea = 'product',
): string {
  if (typeof url === 'string' && url.trim() !== '') {
    if (shouldUseTempPlaceholder(url)) return placeholderFor(area)
    return url
  }
  return placeholderFor(area)
}
