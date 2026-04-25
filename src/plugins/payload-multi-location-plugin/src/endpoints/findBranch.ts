import type { Endpoint } from 'payload'
import { getPostalPrefix, normalizePostalCode } from '../utilities/normalizePostalCode'

export const findBranchEndpoint: Endpoint = {
  path: '/multi-location/find-branch',
  method: 'post',
  handler: async (req) => {
    const body = await req.json?.().catch(() => ({}))
    const postalCode = normalizePostalCode(body?.postalCode)
    const prefix = getPostalPrefix(postalCode)

    if (!postalCode) {
      return Response.json({ error: 'postalCode is required' }, { status: 400 })
    }

    const branches = await req.payload.find({
      collection: 'branches',
      depth: 0,
      limit: 100,
      where: { isActive: { equals: true } },
    })

    const branch = branches.docs.find((candidate: any) => {
      const codes = candidate.postalCodes || []
      return codes.some((entry: any) => {
        const code = normalizePostalCode(entry?.code || entry)
        return code === postalCode || code === prefix || postalCode.startsWith(code)
      })
    })

    return Response.json({ branch: branch || null })
  },
}
