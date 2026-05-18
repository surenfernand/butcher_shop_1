/**
 * Fallback images when CMS media has no usable `url`.
 *
 * Built-ins are **local** assets under `/public/images/placeholders/` (no external CDN).
 * Override per area with `NEXT_PUBLIC_PLACEHOLDER_<AREA>_URL` or globally with
 * `NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL`.
 *
 * Temp swap (off by default): set `NEXT_PUBLIC_TEMP_MEDIA_UNTIL_S3=true` only if you want
 * `/api/media` / S3 URLs replaced with these local fallbacks until storage is fixed.
 */

/** Local static placeholders (served from `public/`). */
const LOCAL = {
  default: '/images/placeholders/product.png',
  product: '/images/placeholders/product.png',
  cart: '/images/placeholders/product.png',
  gallery: '/images/placeholders/product.png',
  hero: '/images/placeholders/hero.png',
  logo: '/images/placeholders/logo.png',
  story: '/images/placeholders/product.png',
  location: '/images/placeholders/product.png',
  info: '/images/placeholders/product.png',
  editorial: '/images/placeholders/product.png',
  featured: '/images/placeholders/product.png',
  seo: '/images/placeholders/product.png',
} as const

export type PlaceholderArea = keyof typeof LOCAL

/** Use with `<Image unoptimized={...} />` when the optimizer cannot fetch the source. */
export function shouldBypassNextImageOptimizer(url: string): boolean {
  if (url.startsWith('/api/media/')) return true
  if (url.startsWith('/images/')) return false
  try {
    const { hostname } = new URL(url)
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

/** Off by default — CMS uploads render as stored unless explicitly opted in. */
export function tempMediaBypassEnabled(): boolean {
  if (readEnv('NEXT_PUBLIC_MEDIA_USE_TEMP_IMAGES') === 'true') return true
  if (readEnv('NEXT_PUBLIC_TEMP_MEDIA_UNTIL_S3') === 'true') return true
  return false
}

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

export function placeholderFor(area: PlaceholderArea = 'default'): string {
  const perArea = readEnv(AREA_ENV_KEYS[area])
  if (perArea) return perArea

  const global = readEnv('NEXT_PUBLIC_PLACEHOLDER_IMAGE_URL')
  if (global) return global

  return LOCAL[area]
}

/**
 * @deprecated Prefer `placeholderFor('product')` etc.
 */
export const PLACEHOLDER_IMAGE_URL: string = placeholderFor('default')

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
