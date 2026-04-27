import type { PurchaseType } from '@/utilities/purchasePricing'

export const getPurchaseTypeStorageKey = (productID: string, variantID?: string) =>
  variantID ? `purchaseType:${productID}:${variantID}` : `purchaseType:${productID}`

/**
 * Client-only. Reads purchase type from keys that belong to the current cart lines
 * (avoids unrelated `purchaseType:*` entries left in localStorage).
 */
export const getPurchaseTypeForConfirmationFromCart = (
  items: Array<{ product?: unknown; variant?: unknown }> | null | undefined,
): PurchaseType => {
  if (typeof window === 'undefined' || !items?.length) return 'one_time'

  let hasMonthly = false
  let hasWeekly = false

  for (const line of items) {
    const product = line.product
    const variant = line.variant

    const productID =
      typeof product === 'object' && product && 'id' in product
        ? String((product as { id: number }).id)
        : product != null
          ? String(product)
          : ''

    if (!productID) continue

    const variantID =
      typeof variant === 'object' && variant && 'id' in variant
        ? String((variant as { id: number }).id)
        : variant != null
          ? String(variant)
          : undefined

    const raw = localStorage.getItem(getPurchaseTypeStorageKey(productID, variantID))
    if (raw === 'monthly') hasMonthly = true
    if (raw === 'weekly') hasWeekly = true
  }

  if (hasMonthly) return 'monthly'
  if (hasWeekly) return 'weekly'
  return 'one_time'
}
