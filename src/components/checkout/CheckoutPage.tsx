'use client'

import { Media } from '@/components/Media'
import { Message } from '@/components/Message'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import { useTheme } from '@/providers/Theme'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Suspense, useCallback, useEffect, useState } from 'react'

import { cssVariables } from '@/cssVariables'
import { CheckoutForm } from '@/components/forms/CheckoutForm'
import { useAddresses, useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { CheckoutAddresses } from '@/components/checkout/CheckoutAddresses'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { Address } from '@/payload-types'
import { Checkbox } from '@/components/ui/checkbox'
import { AddressItem } from '@/components/addresses/AddressItem'
import { FormItem } from '@/components/forms/FormItem'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const apiKey = `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
const stripe = loadStripe(apiKey)

const formatMoney = (amount = 0) => `$${amount.toFixed(2)}`

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const { cart } = useCart()
  const [error, setError] = useState<null | string>(null)
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [emailEditable, setEmailEditable] = useState(true)
  const [paymentData, setPaymentData] = useState<null | Record<string, unknown>>(null)
  const { initiatePayment } = usePayments()
  const { addresses } = useAddresses()
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>()
  const [billingAddress, setBillingAddress] = useState<Partial<Address>>()
  const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true)
  const [isProcessingPayment, setProcessingPayment] = useState(false)
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>('pickup')

  const cartIsEmpty = !cart || !cart.items || !cart.items.length
  const subtotal = cart?.subtotal || 0
  const shipping = fulfillmentMethod === 'delivery' ? 12 : 0
  const estimatedTax = subtotal * 0.08
  const displayTotal = subtotal + shipping + estimatedTax

  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow, Oct 24th')

  const canGoToPayment = Boolean(
    (email || user) && billingAddress && (billingAddressSameAsShipping || shippingAddress),
  )

  useEffect(() => {
    if (!shippingAddress) {
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses[0]
        if (defaultAddress) {
          setBillingAddress(defaultAddress)
        }
      }
    }
  }, [addresses, shippingAddress])

  useEffect(() => {
    return () => {
      setShippingAddress(undefined)
      setBillingAddress(undefined)
      setBillingAddressSameAsShipping(true)
      setEmail('')
      setEmailEditable(true)
    }
  }, [])

  const initiatePaymentIntent = useCallback(
    async (paymentID: string) => {
      try {
        const paymentData = (await initiatePayment(paymentID, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
          },
        })) as Record<string, unknown>

        if (paymentData) {
          setPaymentData(paymentData)
        }
      } catch (error) {
        const errorData = error instanceof Error ? JSON.parse(error.message) : {}
        let errorMessage = 'An error occurred while initiating payment.'

        if (errorData?.cause?.code === 'OutOfStock') {
          errorMessage = 'One or more items in your cart are out of stock.'
        }

        setError(errorMessage)
        toast.error(errorMessage)
      }
    },
    [billingAddress, billingAddressSameAsShipping, email, initiatePayment, shippingAddress],
  )

  if (!stripe) return null

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="min-h-[60vh] bg-black py-20 text-center text-stone-100">
        <p className="mb-8 font-serif text-lg tracking-[0.2em] text-amber-400">Processing your payment...</p>
        <LoadingSpinner />
      </div>
    )
  }

  if (cartIsEmpty) {
    return (
      <div className="min-h-[60vh] bg-black px-6 py-20 text-center text-stone-100">
        <p className="mb-4 font-serif text-xl uppercase tracking-[0.2em] text-amber-400">Your cart is empty.</p>
        <Link className="underline underline-offset-4" href="/search">
          Continue shopping?
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-stone-100 mt-5">
    

      <main className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:px-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <section className="space-y-12">
          <p className="font-serif text-sm uppercase tracking-wider text-amber-400">Checkout</p>

          <section>
            <div className="mb-8 flex items-center gap-4 border-b  pb-6">
              <span className="font-serif text-2xl font-black text-amber-400">01</span>
              <h1 className="text-2xl font-black uppercase tracking-tight text-stone-100">Shipping Information</h1>
            </div>

            <div className="space-y-8">
              {!user && (
                <div className="border  bg-[#121212] p-6">
                  <p className="mb-4 font-serif text-sm uppercase tracking-[0.18em] text-stone-400">
                    Checkout as guest
                  </p>
                  <FormItem>
                    <Label className="font-serif text-xs uppercase tracking-[0.18em] text-stone-400" htmlFor="email">
                      Email Address
                    </Label>
                    <Input
                      className="mt-2 h-14 rounded-none  bg-[#121212] px-4 text-stone-100 placeholder:text-slate-500 focus-visible:ring-amber-500"
                      disabled={!emailEditable}
                      id="email"
                      name="email"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      type="email"
                    />
                  </FormItem>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <Button
                      className="rounded-none bg-amber-400 px-8 font-serif font-black uppercase tracking-[0.18em] text-black hover:bg-amber-300"
                      disabled={!email || !emailEditable}
                      onClick={(e) => {
                        e.preventDefault()
                        setEmailEditable(false)
                      }}
                    >
                      Continue as guest
                    </Button>
                    <Link className="text-sm text-stone-400 underline underline-offset-4" href="/login">
                      Log in instead
                    </Link>
                  </div>
                </div>
              )}

              {user && (
                <div className="border  bg-[#121212] p-6">
                  <p className="font-serif text-xs uppercase tracking-[0.18em] text-stone-400">Signed in as</p>
                  <p className="mt-2 text-stone-100">{user.email}</p>
                  <Link className="mt-2 inline-block text-sm text-amber-400 underline underline-offset-4" href="/logout">
                    Not you? Log out
                  </Link>
                </div>
              )}

              <div>
                <p className="mb-3 font-serif text-xs uppercase tracking-[0.18em] text-stone-400">
                  Billing Address
                </p>
                {billingAddress ? (
                  <div className="border  bg-[#121212] p-5">
                    <AddressItem
                      actions={
                        <Button
                          className="rounded-none  text-amber-400 hover:bg-amber-400 hover:text-black"
                          variant="outline"
                          disabled={Boolean(paymentData)}
                          onClick={(e) => {
                            e.preventDefault()
                            setBillingAddress(undefined)
                          }}
                        >
                          Remove
                        </Button>
                      }
                      address={billingAddress}
                    />
                  </div>
                ) : user ? (
                  <CheckoutAddresses heading="Billing address" setAddress={setBillingAddress} />
                ) : (
                  <CreateAddressModal
                    disabled={!email || Boolean(emailEditable)}
                    callback={(address) => {
                      setBillingAddress(address)
                    }}
                    skipSubmission={true}
                  />
                )}
              </div>

              <div className="flex items-center gap-4">
                <Checkbox
                  id="shippingTheSameAsBilling"
                  checked={billingAddressSameAsShipping}
                  disabled={Boolean(paymentData || (!user && (!email || Boolean(emailEditable))))}
                  onCheckedChange={(state) => {
                    setBillingAddressSameAsShipping(state as boolean)
                  }}
                />
                <Label className="font-serif text-xs uppercase tracking-[0.18em] text-stone-400" htmlFor="shippingTheSameAsBilling">
                  Shipping is the same as billing
                </Label>
              </div>

              {!billingAddressSameAsShipping && (
                <div>
                  <p className="mb-3 font-serif text-xs uppercase tracking-[0.18em] text-stone-400">
                    Shipping Address
                  </p>
                  {shippingAddress ? (
                    <div className="border  bg-[#121212] p-5">
                      <AddressItem
                        actions={
                          <Button
                            className="rounded-none  text-amber-400 hover:bg-amber-400 hover:text-black"
                            variant="outline"
                            disabled={Boolean(paymentData)}
                            onClick={(e) => {
                              e.preventDefault()
                              setShippingAddress(undefined)
                            }}
                          >
                            Remove
                          </Button>
                        }
                        address={shippingAddress}
                      />
                    </div>
                  ) : user ? (
                    <CheckoutAddresses
                      heading="Shipping address"
                      description="Please select a shipping address."
                      setAddress={setShippingAddress}
                    />
                  ) : (
                    <CreateAddressModal
                      callback={(address) => {
                        setShippingAddress(address)
                      }}
                      disabled={!email || Boolean(emailEditable)}
                      skipSubmission={true}
                    />
                  )}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="mb-8 flex items-center gap-4 border-b  pb-6">
              <span className="font-serif text-2xl font-black text-amber-400">02</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-stone-100">Payment Details</h2>
            </div>

            <div className="border  bg-[#121212] p-6">
              {!paymentData && (
                <Button
                  className="rounded-none bg-amber-400 px-10 py-6 font-serif font-black uppercase tracking-[0.18em] text-black hover:bg-amber-300 disabled:opacity-40"
                  disabled={!canGoToPayment}
                  onClick={(e) => {
                    e.preventDefault()
                    void initiatePaymentIntent('stripe')
                  }}
                >
                  Go to payment
                </Button>
              )}

              {!paymentData?.['clientSecret'] && error && (
                <div className="mt-8">
                  <Message error={error} />
                  <Button
                    className="mt-5 rounded-none bg-amber-400 font-serif font-black uppercase tracking-[0.18em] text-black hover:bg-amber-300"
                    onClick={(e) => {
                      e.preventDefault()
                      router.refresh()
                    }}
                    variant="default"
                  >
                    Try again
                  </Button>
                </div>
              )}

              <Suspense fallback={<React.Fragment />}>
                {/* @ts-ignore */}
                {paymentData && paymentData?.['clientSecret'] && (
                  <div>
                    <p className="mb-6 font-serif text-sm uppercase tracking-[0.18em] text-stone-400">
                      Secure card payment
                    </p>
                    {error && <p className="mb-4 text-red-400">{`Error: ${error}`}</p>}
                    <Elements
                      options={{
                        appearance: {
                          theme: 'night',
                          variables: {
                            borderRadius: '0px',
                            colorPrimary: '#d8ad45',
                            gridColumnSpacing: '20px',
                            gridRowSpacing: '20px',
                            colorBackground: theme === 'dark' ? '#000000' : '#0f0f0f',
                            colorDanger: cssVariables.colors.error500,
                            colorDangerText: cssVariables.colors.error500,
                            colorIcon: '#a8a29e',
                            colorText: '#f5f5f4',
                            colorTextPlaceholder: '#64748b',
                            fontFamily: 'Geist, sans-serif',
                            fontSizeBase: '16px',
                            fontWeightBold: '700',
                            fontWeightNormal: '500',
                            spacingUnit: '4px',
                          },
                        },
                        clientSecret: paymentData['clientSecret'] as string,
                      }}
                      stripe={stripe}
                    >
                      <div className="flex flex-col gap-8">
                        <CheckoutForm
                          customerEmail={email}
                          billingAddress={billingAddress}
                          setProcessingPayment={setProcessingPayment}
                        />
                        <Button
                          variant="ghost"
                          className="self-start rounded-none text-stone-400 hover:text-amber-400"
                          onClick={() => setPaymentData(null)}
                        >
                          Cancel payment
                        </Button>
                      </div>
                    </Elements>
                  </div>
                )}
              </Suspense>
            </div>
          </section>
        </section>

        <aside className="h-fit border  bg-[#121212] p-8 lg:sticky lg:top-8">
          <h2 className="font-serif text-sm uppercase tracking-wider text-amber-400">Order Summary</h2>
          <div className="my-6 h-px bg-amber-500/30" />

          <div className="space-y-6">
            {cart?.items?.map((item, index) => {
              if (typeof item.product === 'object' && item.product) {
                const {
                  product,
                  product: { meta, title, gallery },
                  quantity,
                  variant,
                } = item

                if (!quantity) return null

                let image = gallery?.[0]?.image || meta?.image
                let price = product?.priceInUSD

                const isVariant = Boolean(variant) && typeof variant === 'object'

                if (isVariant) {
                  price = variant?.priceInUSD

                  const imageVariant = product.gallery?.find((item) => {
                    if (!item.variantOption) return false
                    const variantOptionID =
                      typeof item.variantOption === 'object' ? item.variantOption.id : item.variantOption

                    const hasMatch = variant?.options?.some((option) => {
                      if (typeof option === 'object') return option.id === variantOptionID
                      return option === variantOptionID
                    })

                    return hasMatch
                  })

                  if (imageVariant && typeof imageVariant.image !== 'string') {
                    image = imageVariant.image
                  }
                }

                return (
                  <div className="grid grid-cols-[80px_1fr_auto] items-center gap-4" key={index}>
                    <div className="relative h-20 w-20 border  bg-black">
                      {image && typeof image !== 'string' && (
                        <Media className="" fill imgClassName="object-cover grayscale" resource={image} />
                      )}
                    </div>
                    <div>
                      <p className="font-serif text-base font-black uppercase text-stone-100">{title}</p>
                      {variant && typeof variant === 'object' && (
                        <p className="mt-1 font-serif text-xs italic text-stone-400">
                          {variant.options
                            ?.map((option) => {
                              if (typeof option === 'object') return option.label
                              return null
                            })
                            .join(', ')}
                        </p>
                      )}
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">Qty {quantity}</p>
                    </div>
                    {typeof price === 'number' && (
                      <Price className="font-serif font-black text-amber-400" amount={price} />
                    )}
                  </div>
                )
              }
              return null
            })}
          </div>

          <div className="my-8 h-px bg-amber-500/30" />

          <div className="space-y-5 font-serif text-sm uppercase tracking-wide">
            <div className="flex justify-between text-stone-400">
              <span>Subtotal</span>
              <span className="text-stone-100">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Shipping {fulfillmentMethod === 'delivery' ? '(Standard)' : '(Pickup)'}</span>
              <span className="text-stone-100">{shipping ? formatMoney(shipping) : 'Free'}</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>Estimated Tax</span>
              <span className="text-stone-100">{formatMoney(estimatedTax)}</span>
            </div>
            <div className="h-px bg-amber-500/30" />
            <div className="flex justify-between text-base text-amber-400">
              <span>Total</span>
              <span>{formatMoney(displayTotal)}</span>
            </div>
          </div>

          <div className="mt-10 text-center">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-serif text-xs font-black uppercase tracking-[0.28em] text-amber-400 text-left">
                 Delivery Date: {selectedDate}
              </p>

              <button
                onClick={() => setIsDateModalOpen(true)}
                className="ml-4 border border-amber-400 px-3 py-1 text-xs font-serif uppercase tracking-[0.2em] text-amber-400 hover:bg-amber-400 hover:text-black"
              >
                Change
              </button>
            </div >

            <div className="grid grid-cols-2 border-4 border-black">
              <button
                type="button"
                className={`py-3 font-serif text-sm font-black uppercase tracking-[0.24em] ${fulfillmentMethod === 'pickup'
                  ? 'bg-amber-400 text-black'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-100'
                  }`}
                onClick={() => setFulfillmentMethod('pickup')}
              >
                Pickup
              </button>
              <button
                type="button"
                className={`py-3 font-serif text-sm font-black uppercase tracking-[0.24em] ${fulfillmentMethod === 'delivery'
                  ? 'bg-amber-400 text-black'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-100'
                  }`}
                onClick={() => setFulfillmentMethod('delivery')}
              >
                Delivery
              </button>
            </div>
          </div>

          <Button
            className="mt-8 w-full rounded-none bg-amber-400 py-6 font-serif font-black uppercase tracking-[0.2em] text-black hover:bg-amber-300"
            disabled={!canGoToPayment}
            onClick={(e) => {
              e.preventDefault()
              if (!paymentData) void initiatePaymentIntent('stripe')
            }}
          >
            Complete Purchase
          </Button>

          <p className="mt-6 text-center font-serif text-[10px] uppercase tracking-[0.2em] text-stone-500">
            SSL encrypted transaction
          </p>
        </aside>
      </main>

      {isDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-[420px] border border-amber-500/30 bg-[#0f0f0f] p-6 shadow-xl">

            {/* Header */}
            <p className="mb-2 text-center font-serif text-xs uppercase tracking-[0.3em] text-amber-400">
              The Butcher’s Craft
            </p>

            <h2 className="mb-6 text-center font-serif text-xl font-black uppercase tracking-wide text-stone-100">
              Order Type
            </h2>

            {/* Delivery / Pickup */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <button
                className={`py-3 font-serif text-sm font-black uppercase tracking-[0.2em] ${fulfillmentMethod === 'delivery'
                  ? 'bg-amber-400 text-black'
                  : 'bg-stone-800 text-stone-400'
                  }`}
                onClick={() => setFulfillmentMethod('delivery')}
              >
                Delivery
              </button>

              <button
                className={`py-3 font-serif text-sm font-black uppercase tracking-[0.2em] ${fulfillmentMethod === 'pickup'
                  ? 'bg-amber-400 text-black'
                  : 'bg-stone-800 text-stone-400'
                  }`}
                onClick={() => setFulfillmentMethod('pickup')}
              >
                Pickup
              </button>
            </div>

            {/* Address */}
            <div className="mb-6 border border-amber-500/30 p-4 text-sm text-stone-300">
              <p className="font-serif text-amber-400">Filet Gourmet</p>
              <p className="mt-1 text-xs">
                1449 Av. de la Gare, Mascouche, QC J7K 0Z6, Canada
              </p>
            </div>

            {/* Date Picker */}
            <div className="mb-6">
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-stone-400">
                Select Date
              </label>

              <input
                type="date"
                className="w-full border border-amber-500/30 bg-black px-3 py-2 text-stone-100"
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Actions */}
            <button
              className="w-full bg-amber-400 py-3 font-serif font-black uppercase tracking-[0.2em] text-black hover:bg-amber-300"
              onClick={() => setIsDateModalOpen(false)}
            >
              Confirm and Proceed
            </button>

            <button
              className="mt-4 w-full text-sm uppercase tracking-[0.2em] text-stone-400"
              onClick={() => setIsDateModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>


  )


}
