import type { Endpoint } from 'payload'

export const getFulfillmentOptionsEndpoint: Endpoint = {
  path: '/multi-location/fulfillment-options',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url || '', 'http://payload.local')
    const branch = url.searchParams.get('branch')
    const serviceType = url.searchParams.get('serviceType')

    const where: any = { isActive: { equals: true } }
    const and: any[] = []
    if (branch) and.push({ branch: { equals: branch } })
    if (serviceType) and.push({ serviceType: { equals: serviceType } })

    const schedules = await req.payload.find({
      collection: 'fulfillment-schedules',
      depth: 1,
      limit: 100,
      where: and.length ? { and: [where, ...and] } : where,
    })

    return Response.json({ schedules: schedules.docs })
  },
}
