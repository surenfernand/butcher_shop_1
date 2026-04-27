import type { BasePayload } from 'payload'

import type { Product, Variant } from '@/payload-types'

const productId = (ref: number | Product | null | undefined): number | undefined => {
  if (typeof ref === 'number') return ref
  if (ref && typeof ref === 'object' && 'id' in ref && ref.id != null) return ref.id
  return undefined
}

const variantId = (ref: number | Variant | null | undefined): number | undefined => {
  if (typeof ref === 'number') return ref
  if (ref && typeof ref === 'object' && 'id' in ref && ref.id != null) return ref.id
  return undefined
}

/** Full product doc so `purchaseFrequencies` is present (order relation populate often omits it). */
export const resolveOrderLineProductForPricing = async (
  payload: BasePayload,
  productRef: number | Product | null | undefined,
): Promise<Product | undefined> => {
  const id = productId(productRef)
  if (id == null) return typeof productRef === 'object' && productRef ? (productRef as Product) : undefined

  try {
    const doc = await payload.findByID({
      collection: 'products',
      id,
      depth: 0,
    })
    return doc as Product
  } catch {
    return typeof productRef === 'object' && productRef ? (productRef as Product) : undefined
  }
}

export const resolveOrderLineVariantForPricing = async (
  payload: BasePayload,
  variantRef: number | Variant | null | undefined,
): Promise<Variant | undefined> => {
  const id = variantId(variantRef)
  if (id == null) return typeof variantRef === 'object' && variantRef ? (variantRef as Variant) : undefined

  try {
    const doc = await payload.findByID({
      collection: 'variants',
      id,
      depth: 0,
    })
    return doc as Variant
  } catch {
    return typeof variantRef === 'object' && variantRef ? (variantRef as Variant) : undefined
  }
}
