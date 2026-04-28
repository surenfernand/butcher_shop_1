import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { getPurchaseUnitPriceInCents, type PurchaseType } from '@/utilities/purchasePricing'
import { batchResolveOrderLinesForPricing } from '@/utilities/resolveOrderLinePricingDocs'

const normalizePurchaseType = (value: unknown): PurchaseType => {
  if (value === 'weekly' || value === 'monthly') return value
  return 'one_time'
}

const getRefID = (value: unknown) => {
  if (typeof value === 'object' && value && 'id' in value) return String(value.id)
  if (value !== null && value !== undefined) return String(value)
  return ''
}

const getRelationshipID = (value: unknown): number | undefined => {
  const ref = getRefID(value)
  if (!ref) return undefined
  const numericID = Number(ref)
  return Number.isFinite(numericID) ? numericID : undefined
}

const normalizePurchaseTypes = (value: unknown) => {
  if (!Array.isArray(value)) return []

  return value
    .map((line) => {
      if (!line || typeof line !== 'object') return null

      const product = 'product' in line ? getRelationshipID(line.product) : undefined
      if (!product) return null

      const variant = 'variant' in line ? getRefID(line.variant) || undefined : undefined
      const purchaseType = normalizePurchaseType(
        'purchaseType' in line ? line.purchaseType : undefined,
      )

      return {
        product,
        ...(variant ? { variant } : {}),
        purchaseType,
      }
    })
    .filter(Boolean) as Array<{ product: number; variant?: string; purchaseType: PurchaseType }>
}

const getPurchaseTypeForOrderLine = (
  item: { product?: unknown; variant?: unknown },
  purchaseTypes: Array<{ product: number; variant?: string; purchaseType: PurchaseType }>,
  fallback: PurchaseType,
): PurchaseType => {
  const productID = getRefID(item.product)
  const variantID = getRefID(item.variant)

  const match = purchaseTypes.find((line) => {
    if (String(line.product) !== productID) return false
    return (line.variant || '') === (variantID || '')
  })

  return match?.purchaseType || fallback
}

const toCents = (value: unknown) => {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? Math.round(amount) : 0
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { orderID, fulfillment, purchaseType, purchaseTypes } = body

    if (!orderID) {
      return NextResponse.json({ error: 'Missing orderID' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    const normalizedPurchaseType = normalizePurchaseType(purchaseType)
    const normalizedPurchaseTypes = normalizePurchaseTypes(purchaseTypes)

    const order = await payload.findByID({
      collection: 'orders',
      id: orderID,
      depth: 0,
      overrideAccess: true,
    })

    const linePricingDocs = await batchResolveOrderLinesForPricing(payload, order.items)

    const itemsSubtotal = linePricingDocs.reduce((total, row) => {
      const purchaseTypeForLine = getPurchaseTypeForOrderLine(
        row.item,
        normalizedPurchaseTypes,
        normalizedPurchaseType,
      )

      return (
        total +
        getPurchaseUnitPriceInCents(row.product, row.variant, purchaseTypeForLine) *
        (row.item.quantity || 0)
      )
    }, 0)

    const shippingTotal =
      fulfillment?.serviceType === 'delivery' ? toCents(fulfillment?.shippingCharge) : 0
    const estimatedTax = toCents(fulfillment?.estimatedTax)
    const amount = itemsSubtotal + shippingTotal + estimatedTax

    await payload.update({
      collection: 'orders',
      id: orderID,
      data: {
        amount,
        fulfillment: fulfillment || {},
        purchaseType: normalizedPurchaseType,
        ...(Array.isArray(purchaseTypes)
          ? { purchaseTypes: normalizedPurchaseTypes }
          : {}),
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('order-extra-data failed:', error)
    return NextResponse.json({ error: 'Failed to save order extra data' }, { status: 500 })
  }
}