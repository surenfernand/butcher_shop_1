/**
 * Fallback image URLs when CMS media has no usable `url` (e.g. S3 not wired yet).
 *
 * **Built-ins** use Unsplash (meat / butcher / craft). Allow `images.unsplash.com` in
 * `next.config.ts` → `images.remotePatterns`. `next/image` uses `unoptimized` for that host
 * (see `shouldBypassNextImageOptimizer`) so the optimizer does not block requests.
 *
 * **Until S3 is connected**
 * - `tempMediaBypassEnabled()` is **on in production** by default (so [Render](https://render.com)
 *   without S3 swaps broken `/api/media/…` for Unsplash). It is **off in `next dev`** for local uploads.
 * - Set **`NEXT_PUBLIC_TEMP_MEDIA_UNTIL_S3=false`** in production when S3 (or disk) URLs are valid.
 * - Set **`NEXT_PUBLIC_SERVER_URL`** to your public site URL at **build** time so `next.config`
 *   `remotePatterns` matches your host for absolute media URLs.
 *
 * Overrides: `NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL`, or `NEXT_PUBLIC_PLACEHOLDER_<AREA>_URL`
 * (AREA uppercase, e.g. `NEXT_PUBLIC_PLACEHOLDER_HERO_URL`).
 */

/** Unsplash photo path (see https://unsplash.com — hotlink format). */
const u = (photoPath: string, w: number) =>
  `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=${w}&q=80`

/** Curated online placeholders (meat / butcher / craft / venue). All Unsplash for one allowlisted host. */
const ONLINE = {
  default: u('photo-1604503468506-a8da13d82791', 1600),
  product: u('photo-1604503468506-a8da13d82791', 1600),
  cart: u('photo-1567521214889-8a446d5f901a', 1200),
  gallery: u('photo-1588347818038-88fda0d7f1a0', 1600),
  hero: u('photo-1544025162-d76694265947', 2400),
  logo: u('photo-1607623813342-90543285690a', 1000),
  story: u('photo-1588347818038-88fda0d7f1a0', 1600),
  location: u('photo-1559339352-11d035aa65de', 1600),
  info: u('photo-1558030006-425675369496', 1600),
  editorial: u('photo-1567521214889-8a446d5f901a', 1600),
  featured: u('photo-1599488615731-7e0c95d66f58', 1600),
  seo: u('photo-1604503468506-a8da13d82791', 1200),
} as const

export type PlaceholderArea = keyof typeof ONLINE

/** Hostnames where we skip Next image optimization (avoids upstream 403 from the optimizer). */
const PLACEHOLDER_CDN_HOSTS = new Set(['images.unsplash.com'])

/** Use with `<Image unoptimized={...} />` for built-in placeholder CDNs. */
export function shouldBypassNextImageOptimizer(url: string): boolean {
  if (url.startsWith('/api/media/')) return true
  try {
    const { hostname } = new URL(url)
    if (PLACEHOLDER_CDN_HOSTS.has(hostname)) return true
    if (
      process.env.NODE_ENV === 'development' &&
      (hostname === 'localhost' || hostname === '127.0.0.1')
    ) {
      return true
    }
    return false
  } catch {
    return false
  }
}

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

/**
 * When true, `shouldUseTempPlaceholder` replaces Payload `/api/media` and common cloud URLs
 * with Unsplash placeholders.
 *
 * Defaults **on in production** (e.g. [Render](https://render.com) without S3) and **off in
 * `next dev`** so local disk uploads still load. Override with `NEXT_PUBLIC_TEMP_MEDIA_UNTIL_S3`
 * (`true` / `false`).
 */
export function tempMediaBypassEnabled(): boolean {
  if (readEnv('NEXT_PUBLIC_MEDIA_USE_TEMP_IMAGES') === 'true') return true
  const flag = readEnv('NEXT_PUBLIC_TEMP_MEDIA_UNTIL_S3')
  if (flag === 'false') return false
  if (flag === 'true') return true
  return process.env.NODE_ENV === 'production'
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
  if (lower.includes('/api/media')) return true
  if (lower.startsWith('/') && lower.includes('/media/')) return true
  if (
    /(amazonaws\.com|digitaloceanspaces\.com|cloudflarestorage\.com|supabase\.co\/storage|r2\.dev)/i.test(
      lower,
    )
  )
    return true
  return false
}

/** Resolved URL for a UI context (env overrides → global → built-in online). */
export function placeholderFor(area: PlaceholderArea = 'default'): string {
  const perArea = readEnv(AREA_ENV_KEYS[area])
  if (perArea) return perArea

  const global = readEnv('NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL')
  if (global) return global

  return ONLINE[area]
}

/**
 * @deprecated Prefer `placeholderFor('product')` etc.
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
