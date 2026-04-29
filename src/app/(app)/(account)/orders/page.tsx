import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function Orders() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  let orders: Order[] | null = null

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  try {
    const ordersResult = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: {
        customer: {
          equals: user?.id,
        },
      },
    })

    orders = ordersResult?.docs || []
  } catch (error) { }

  return (
    <div className="w-full space-y-12 text-white">
      <div className='mt-3'>
        <h1 className="text-5xl font-bold tracking-tight">
          Order History
        </h1>
        <p className="mt-3 text-white/55">
          Manage your order history.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1A1C1C]">
        {/* <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="text-2xl font-semibold">Order History</h2>

        
        </div> */}

        {(!orders || !Array.isArray(orders) || orders.length === 0) && (
          <div className="px-6 py-10 text-white/55">
            You have no orders.
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/[0.03] text-xs uppercase tracking-[0.15em] text-white/45">
                <tr>
                  <th className="px-6 py-4 font-medium">Order #</th>
                  <th className="px-6 py-4 font-medium">Order Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">
                    Total Amount
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="border-t border-white/5 hover:bg-black/[0.03] transition"
                  >
                    <td className="px-6 py-5">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-white hover:text-[#E2B84F]"
                      >
                        #{order.id}
                      </Link>
                    </td>

                    <td className="px-6 py-5 text-white/55">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                        : '—'}
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-full border border-[#E2B84F]/30 bg-[#E2B84F]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#E2B84F]">
                        {order.status || 'Processing'}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right font-semibold text-[#E2B84F]">
                      {typeof order.amount === 'number'
                        ? new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(order.amount / 100)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

        
          </div>
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Your orders.',
  openGraph: mergeOpenGraph({
    title: 'Orders',
    url: '/orders',
  }),
  title: 'Orders',
}