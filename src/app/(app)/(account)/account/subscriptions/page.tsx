import type { Order, Product, Media } from '@/payload-types'

import { getPurchaseUnitPriceInCents } from '@/utilities/purchasePricing'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const formatMoney = (amount?: number | null) =>
    typeof amount === 'number'
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100)
        : '—'

const formatDate = (date?: string | null) =>
    date
        ? new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(new Date(date))
        : '—'

const getProductImage = (product?: Product | null): Media | undefined => {
    const image = product?.productGallery?.[0]?.image
    return image && typeof image === 'object' ? image : undefined
}

export default async function SubscriptionsPage() {
    const headers = await getHeaders()
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers })

    if (!user) {
        redirect(`/login?warning=${encodeURIComponent('Please login to access your subscriptions.')}`)
    }

    const result = await payload.find({
        collection: 'orders',
        user,
        overrideAccess: false,
        depth: 3,
        limit: 20,
        sort: '-createdAt',
        where: {
            and: [
                {
                    customer: {
                        equals: user.id,
                    },
                },
                {
                    purchaseType: {
                        in: ['weekly', 'monthly'],
                    },
                },
            ],
        },
    })

    const subscriptions = result.docs as Order[]

    const getSubscriptionAmount = (order: Order) => {
        const purchaseType =
            order.purchaseType === 'weekly' || order.purchaseType === 'monthly'
                ? order.purchaseType
                : 'monthly'

        return (
            order.items?.reduce((total, item) => {
                const product = typeof item.product === 'object' ? item.product : undefined
                const variant = typeof item.variant === 'object' ? item.variant : undefined

                if (!product) return total

                const unitPrice = getPurchaseUnitPriceInCents(product, variant, purchaseType)

                return total + unitPrice * (item.quantity || 1)
            }, 0) || 0
        )
    }

    return (
        <div className="space-y-12 text-white">


            <div className='mt-3'>
                <h1 className="text-5xl font-bold tracking-tight">
                    My Subscriptions
                </h1>
                <p className="mt-3 text-white/55">
                    View your all Subscriptions
                </p>
            </div>

            {subscriptions.length === 0 ? (
                <div className="border border-[#3A3325] bg-[#1A1C1C] p-10 text-white/60">
                    You do not have any active subscriptions yet.
                </div>
            ) : (
                <div className="space-y-8">
                    {subscriptions.map((subscription) => {
                        const firstItem = subscription.items?.[0]
                        const product =
                            typeof firstItem?.product === 'object'
                                ? firstItem.product
                                : undefined

                        const image = getProductImage(product)
                        const fulfillment = subscription.fulfillment as any
                        const address = subscription.shippingAddress

                        return (
                            <section
                                key={subscription.id}
                                className="grid overflow-hidden border border-[#3A3325] bg-[#141515] lg:grid-cols-[320px_1fr]"
                            >
                                <div className="relative bg-white p-8">
                                    {/* <span className="absolute left-5 top-5 bg-[#1A1C1C] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#E2B84F]">
                                        Active Member
                                    </span> */}

                                    <div className="flex h-full min-h-[300px] items-center justify-center">
                                        {image?.url ? (
                                            <img
                                                src={image.url}
                                                alt={image.alt || product?.title || 'Subscription product'}
                                                className="object-contain"
                                            />
                                        ) : (
                                            <div className="text-center text-black/50">
                                                No product image
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-10">
                                    <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold uppercase">
                                                {product?.title || 'Subscription Box'}
                                            </h2>

                                            <p className="mt-2 text-white/45">
                                                Subscription ID: {subscription.stripeSubscriptionID || `#${subscription.id}`}
                                            </p>
                                        </div>

                                        <div className="text-left md:text-right">
                                            <p className="text-xl font-bold text-[#E2B84F]">
                                                {/* {formatMoney(subscription.amount)} */}
                                                {formatMoney(getSubscriptionAmount(subscription))}
                                                <span className="text-sm font-normal text-white/50">
                                                    /{subscription.purchaseType === 'monthly' ? 'mo' : 'wk'}
                                                </span>
                                            </p>

                                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/45">
                                                {subscription.purchaseType === 'monthly'
                                                    ? 'Monthly Subscription'
                                                    : 'Weekly Subscription'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-8 border-b border-white/10 py-8 md:grid-cols-2">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                                                Next Delivery
                                            </p>
                                            <p className="mt-3 font-semibold">
                                                {formatDate(fulfillment?.date)}
                                            </p>
                                        </div>



                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                                                Shipping To
                                            </p>
                                            <p className="mt-3 font-semibold">
                                                {address?.addressLine1
                                                    ? `${address.addressLine1}, ${address.city || ''}`
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                        <Link
                                            href={`/orders/${subscription.id}`}
                                            className="bg-[#E2B84F] px-8 py-4 text-center text-xs font-black uppercase tracking-[0.25em] text-black"
                                        >
                                            Manage Selection
                                        </Link>

                                        <button

                                            className="border border-white/10 px-8 py-4 text-xs font-black uppercase tracking-[0.25em] text-white/45"
                                        >
                                            Pause Subscription
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )
                    })}
                </div>
            )}
        </div>
    )
}