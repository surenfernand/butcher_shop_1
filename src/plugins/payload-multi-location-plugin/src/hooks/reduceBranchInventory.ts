import type { CollectionAfterChangeHook } from 'payload'

export const reduceBranchInventory = (): CollectionAfterChangeHook => {
  return async ({ doc, operation, req }) => {
    if (operation !== 'create') return doc

    const branch = doc.fulfillment?.branch || doc.branch
    const items = doc.items || doc.lineItems || []
    if (!branch || !Array.isArray(items)) return doc

    for (const item of items) {
      const productID = item.product?.id || item.product || item.productID
      const quantity = Number(item.quantity || 1)
      if (!productID) continue

      const inventory = await req.payload.find({
        collection: 'branch-inventory',
        depth: 0,
        limit: 1,
        where: { and: [{ branch: { equals: branch } }, { product: { equals: productID } }] },
      })

      const stock = inventory.docs[0] as any
      if (!stock?.manageStock) continue

      const nextQuantity = Math.max(0, Number(stock.stockQuantity || 0) - quantity)
      await req.payload.update({
        collection: 'branch-inventory',
        id: stock.id,
        data: {
          stockQuantity: nextQuantity,
          stockStatus: nextQuantity > 0 ? stock.stockStatus : 'outofstock',
        },
      })
    }

    return doc
  }
}
