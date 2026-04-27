'use client'

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useCart, usePayments } from '@payloadcms/plugin-ecommerce/client/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export const ConfirmOrder: React.FC = () => {
  const { confirmOrder } = usePayments()
  const { cart } = useCart()

  const searchParams = useSearchParams()
  const router = useRouter()
  // Ensure we only confirm the order once, even if the component re-renders
  const isConfirming = useRef(false)

  useEffect(() => {
    if (!cart || !cart.items || cart.items?.length === 0) {
      return
    }

    const paymentIntentID = searchParams.get('payment_intent')
    const email = searchParams.get('email')


    if (paymentIntentID) {
      if (!isConfirming.current) {
        isConfirming.current = true

        const fulfillment =
          typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('fulfillment') || '{}')
            : {}

        const purchaseType =
          typeof window !== 'undefined'
            ? Object.keys(localStorage)
              .filter((key) => key.startsWith('purchaseType:') && !key.endsWith(':price'))
              .map((key) => localStorage.getItem(key))
              .find((value) => value === 'monthly' || value === 'weekly') || 'one_time'
            : 'one_time'


        console.log('redirect confirm fulfillment', fulfillment)
        console.log('redirect confirm purchaseType', purchaseType)

        confirmOrder('stripe', {
          additionalData: {
            paymentIntentID,
            ...(email ? { customerEmail: email } : {}),
            fulfillment,
            purchaseType,
          },
        }).then((result) => {
          if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
            const accessToken = 'accessToken' in result ? (result.accessToken as string) : ''
            const queryParams = new URLSearchParams()

            if (email) {
              queryParams.set('email', email)
            }
            if (accessToken) {
              queryParams.set('accessToken', accessToken)
            }

            const queryString = queryParams.toString()
            // router.push(`/orders/${result.orderID}${queryString ? `?${queryString}` : ''}`)
            router.push(`/thank-you/${result.orderID}${queryString ? `?${queryString}` : ''}`)
          }
        })
      }
    } else {
      // If no payment intent ID is found, redirect to the home
      router.push('/')
    }
  }, [cart, confirmOrder, router, searchParams])

  return (
    <div className="text-center w-full flex flex-col items-center justify-start gap-4">
      <h1 className="text-2xl">Confirming Order</h1>

      <LoadingSpinner className="w-12 h-6" />
    </div>
  )
}
