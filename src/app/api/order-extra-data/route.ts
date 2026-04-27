import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { orderID, fulfillment, purchaseType } = body

    if (!orderID) {
      return NextResponse.json(
        { error: 'Missing orderID' },
        { status: 400 },
      )
    }

    const payload = await getPayload({
      config: configPromise,
    })

    await payload.update({
      collection: 'orders',
      id: orderID,
      data: {
        fulfillment,
        purchaseType,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Failed to save order extra data:', error)

    return NextResponse.json(
      { error: 'Failed to save order extra data' },
      { status: 500 },
    )
  }
}