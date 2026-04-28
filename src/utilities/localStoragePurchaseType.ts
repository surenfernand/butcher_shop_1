import type { PurchaseType } from '@/utilities/purchasePricing'

export type CartPurchaseTypeLine = {
  product: string
  variant?: string
  purchaseType: PurchaseType
}

export const getPurchaseTypeStorageKey = (productID: string, variantID?: string) =>
  variantID ? `purchaseType:${productID}:${variantID}` : `purchaseType:${productID}`

const getCartLineIDs = (line: { product?: unknown; variant?: unknown }) => {
  const productID =
    typeof line.product === 'object' && line.product && 'id' in line.product
      ? String((line.product as { id: string | number }).id)
      : line.product != null
        ? String(line.product)
        : ''

  const variantID =
    typeof line.variant === 'object' && line.variant && 'id' in line.variant
      ? String((line.variant as { id: string | number }).id)
      : line.variant != null
        ? String(line.variant)
        : undefined

  return { productID, variantID }
}

const normalizePurchaseType = (value: string | null | undefined): PurchaseType => {
  if (value === 'weekly' || value === 'monthly') return value
  return 'one_time'
}

export const getPurchaseTypesForCartItems = (
  items: Array<{ product?: unknown; variant?: unknown }> | null | undefined,
): CartPurchaseTypeLine[] => {
  if (typeof window === 'undefined' || !items?.length) return []

  return items
    .map((line) => {
      const { productID, variantID } = getCartLineIDs(line)
      if (!productID) return null

      return {
        product: productID,
        variant: variantID,
        purchaseType: normalizePurchaseType(
          localStorage.getItem(getPurchaseTypeStorageKey(productID, variantID)),
        ),
      }
    })
    .filter((line): line is CartPurchaseTypeLine => Boolean(line))
}

export const getPurchaseTypeForConfirmationFromCart = (
  items: Array<{ product?: unknown; variant?: unknown }> | null | undefined,
): PurchaseType => {
  const purchaseTypes = getPurchaseTypesForCartItems(items)

  if (purchaseTypes.some((line) => line.purchaseType === 'monthly')) return 'monthly'
  if (purchaseTypes.some((line) => line.purchaseType === 'weekly')) return 'weekly'
  return 'one_time'
}