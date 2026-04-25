import type { CollectionBeforeValidateHook } from 'payload'

export const validateMaxOrdersPerDay = (orderSlug = 'orders'): CollectionBeforeValidateHook => {
  return async ({ data, req, operation }) => {
    if (!data || operation !== 'create') return data

    const branch = data.fulfillment?.branch || data.branch
    const serviceType = data.fulfillment?.serviceType || data.serviceType
    const requestedDate = data.fulfillment?.date || data.fulfillmentDate

    if (!branch || !serviceType || !requestedDate) return data

    const schedules = await req.payload.find({
      collection: 'fulfillment-schedules',
      depth: 0,
      limit: 1,
      where: {
        and: [
          { branch: { equals: branch } },
          { serviceType: { equals: serviceType } },
          { isActive: { equals: true } },
        ],
      },
    })

    const max = Number((schedules.docs[0] as any)?.maxOrdersPerDay || 0)
    if (!max) return data

    const start = new Date(requestedDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    const existing = await req.payload.find({
      collection: orderSlug,
      depth: 0,
      limit: 0,
      where: {
        and: [
          { 'fulfillment.branch': { equals: branch } },
          { 'fulfillment.serviceType': { equals: serviceType } },
          { 'fulfillment.date': { greater_than_equal: start.toISOString() } },
          { 'fulfillment.date': { less_than: end.toISOString() } },
        ],
      },
    })

    if (existing.totalDocs >= max) {
      throw new Error('This delivery/pickup date is fully booked. Please select another date.')
    }

    return data
  }
}
