import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/utilities/formatDateTime'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeftIcon } from 'lucide-react'
import { ProductItem } from '@/components/ProductItem'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { OrderStatus } from '@/components/OrderStatus'
import { AddressItem } from '@/components/addresses/AddressItem'
import { getPurchaseUnitPriceInCents } from '@/utilities/purchasePricing'
import {
  resolveOrderLineProductForPricing,
  resolveOrderLineVariantForPricing,
} from '@/utilities/resolveOrderLinePricingDocs'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ email?: string; accessToken?: string }>
}

export default async function Order({ params, searchParams }: PageProps) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const { id } = await params
  const { email = '', accessToken = '' } = await searchParams

  let order: Order | null = null



  try {
    const {
      docs: [orderResult],
    } = await payload.find({
      collection: 'orders',
      user,
      overrideAccess: !Boolean(user),
      depth: 2,
      where: {
        and: [
          {
            id: {
              equals: id,
            },
          },
          ...(user
            ? [
              {
                customer: {
                  equals: user.id,
                },
              },
            ]
            : [
              {
                accessToken: {
                  equals: accessToken,
                },
              },
              ...(email
                ? [
                  {
                    customerEmail: {
                      equals: email,
                    },
                  },
                ]
                : []),
            ]),
        ],
      },
      select: {
        amount: true,
        currency: true,
        items: true,
        purchaseType: true,
        customerEmail: true,
        customer: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
        fulfillment: true, // ✅ ADD THIS
      },
    })

    const canAccessAsGuest =
      !user &&
      email &&
      accessToken &&
      orderResult &&
      orderResult.customerEmail &&
      orderResult.customerEmail === email

    const canAccessAsUser =
      user &&
      orderResult &&
      orderResult.customer &&
      (typeof orderResult.customer === 'object'
        ? orderResult.customer.id
        : orderResult.customer) === user.id

    if (orderResult && (canAccessAsGuest || canAccessAsUser)) {
      order = orderResult
    }
  } catch (error) {
    console.error(error)
  }

  if (!order) {
    notFound()
  }

  const linePricingDocs = await Promise.all(
    (order.items || []).map(async (item) => {
      const pricingProduct = await resolveOrderLineProductForPricing(payload, item.product)
      const pricingVariant = await resolveOrderLineVariantForPricing(payload, item.variant)

      const embeddedProduct = typeof item.product === 'object' ? item.product : undefined
      const embeddedVariant = typeof item.variant === 'object' ? item.variant : undefined

      return {
        item,
        product: pricingProduct ?? embeddedProduct,
        variant: pricingVariant ?? embeddedVariant,
      }
    }),
  )

  const purchaseTypeForPricing =
    order.purchaseType === 'weekly' ||
    order.purchaseType === 'monthly' ||
    order.purchaseType === 'one_time'
      ? order.purchaseType
      : 'one_time'

  const itemsSubtotal =
    linePricingDocs.reduce((total, row) => {
      const { item, product, variant } = row

      if (!product) return total

      const unitPrice = getPurchaseUnitPriceInCents(product, variant, purchaseTypeForPricing)
      const quantity = item.quantity || 0

      return total + unitPrice * quantity
    }, 0) || 0

  const fulfillment = (order as any).fulfillment

  const shippingTotal =
    fulfillment?.serviceType === 'delivery'
      ? Number(fulfillment?.shippingCharge || 0)
      : 0

  return (
    <div className="min-h-screen text-neutral-200 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between gap-8">
          {user ? (
            <Button
              asChild
              variant="ghost"
              className="px-0 font-mono text-xs uppercase tracking-[0.16em] text-neutral-500 hover:bg-transparent hover:text-[#f5a400]"
            >
              <Link href="/orders">
                <ChevronLeftIcon className="size-4" />
                All orders
              </Link>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            {order.status && (
              <OrderStatus
                className="border border-[#f5a400]/50 bg-[#f5a400]/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.16em] text-[#f5a400]"
                status={order.status}
              />
            )}
          </div>
        </div>

        <div className="mb-10">
          <h1 className="mb-3 text-5xl font-black uppercase tracking-tight text-neutral-100">
            Order #{order.id}
          </h1>

          <p className="text-neutral-500">
            Placed on{' '}
            <time dateTime={order.createdAt}>
              {formatDateTime({ date: order.createdAt, format: 'MMMM dd, yyyy' })}
            </time>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="border border-[#222] bg-[#111] px-6 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <h2 className="mb-6 text-2xl font-black uppercase tracking-tight text-neutral-100">
                Order Items
              </h2>

              {linePricingDocs.length > 0 && (
                <ul className="flex flex-col gap-6">
                  {linePricingDocs.map(({ item, product, variant }, index) => {
                    if (typeof item.product === 'string') {
                      return null
                    }

                    if (!product) {
                      return (
                        <li key={index} className="text-neutral-500">
                          This item is no longer available.
                        </li>
                      )
                    }

                    const lineSubtotalInCents =
                      getPurchaseUnitPriceInCents(
                        product,
                        variant,
                        purchaseTypeForPricing,
                      ) * (item.quantity || 1)

                    return (
                      <li
                        key={item.id}
                        className="border-b border-[#222] pb-6 last:border-b-0 last:pb-0"
                      >
                        <ProductItem
                          product={product}
                          quantity={item.quantity}
                          variant={variant}
                          lineSubtotalInCents={lineSubtotalInCents}
                        />
                      </li>
                    )
                  })}
                </ul>
              )}

              <div className="mt-8 border-t border-[#222] pt-6">
                <div className="mb-3 flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <Price amount={itemsSubtotal} />
                </div>

                <div className="mb-5 flex justify-between text-neutral-400">
                  <span>Shipping</span>
                  <Price amount={shippingTotal} />
                </div>

                <div className="flex justify-between border-t border-[#222] pt-5">
                  <span className="font-mono text-2xl font-bold uppercase tracking-[0.14em] text-[#f5a400]">
                    Total
                  </span>

                  {order.amount && (
                    <Price
                      className="text-2xl font-bold text-[#f5a400]"
                      amount={order.amount}
                    />
                  )}
                </div>
              </div>
            </section>

            <section className="border border-[#222] bg-[#111] px-6 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <h2 className="mb-6 text-2xl font-black uppercase tracking-tight text-neutral-100">
                Order Progress
              </h2>

              <div>
                {order.status && <OrderStatus className="text-sm" status={order.status} />}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            {order.shippingAddress && (
              <section className="border border-[#222] bg-[#111] px-6 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                <h2 className="mb-6 text-2xl font-black uppercase tracking-tight text-neutral-100">
                  Shipping Address
                </h2>

                <div className="text-neutral-400">
                  {/* @ts-expect-error - some kind of type hell */}
                  <AddressItem address={order.shippingAddress} hideActions />
                </div>
              </section>
            )}

            


          </aside>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  return {
    description: `Order details for order ${id}.`,
    openGraph: mergeOpenGraph({
      title: `Order ${id}`,
      url: `/orders/${id}`,
    }),
    title: `Order ${id}`,
  }
}