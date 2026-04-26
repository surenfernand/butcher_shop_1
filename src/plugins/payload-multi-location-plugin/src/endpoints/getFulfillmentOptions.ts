import type { Endpoint } from 'payload'
import { getPostalPrefix, normalizePostalCode } from '../utilities/normalizePostalCode'

export const getFulfillmentOptionsEndpoint: Endpoint = {
  path: '/multi-location/fulfillment-options',
  method: 'get',
  handler: async (req) => {
    const url = new URL(req.url || '', 'http://payload.local')
    const branch = url.searchParams.get('branch')
    const serviceType = url.searchParams.get('serviceType') || 'pickup'
    const postalCode = normalizePostalCode(url.searchParams.get('postalCode'))
    const prefix = getPostalPrefix(postalCode)

    if (!branch) {
      return Response.json({ error: 'branch is required' }, { status: 400 })
    }

    const schedules = await req.payload.find({
      collection: 'fulfillment-schedules',
      depth: 1,
      limit: 100,
      where: {
        and: [
          { branch: { equals: branch } },
          { serviceType: { equals: serviceType } },
          { isActive: { equals: true } },
        ],
      },
    })

    const filteredSchedules = schedules.docs.filter((schedule: any) => {
      if (serviceType === 'pickup') return true
      if (!postalCode) return false

      const codes = schedule.postalCodes || []
      return codes.some((entry: any) => {
        const code = normalizePostalCode(entry?.code || entry)
        return code === postalCode || code === prefix || postalCode.startsWith(code)
      })
    })

    return Response.json({ schedules: filteredSchedules })
  },
}
