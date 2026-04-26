'use client'

import { useMemo, useState } from 'react'
import type { Product } from '@/payload-types'
import Link from 'next/link'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { showCartErrorToast, showCartSuccessToast } from '../Cart/CartToastAlert'
import { AddToCart } from '@/components/Cart/AddToCart'

type ProductWithUIFields = Product & {
  title?: string
  slug?: string
  meta?: {
    description?: string | null
    image?: unknown
  } | null
}

type Props = {
  product: ProductWithUIFields
}

export default function ProductDetails({ product }: Props) {
  const { addItem, isLoading } = useCart()

  const defaultOptionIndex = useMemo(() => {
    if (!Array.isArray(product.purchaseOptions) || product.purchaseOptions.length === 0) {
      return null
    }

    const highlightedIndex = product.purchaseOptions.findIndex((option) => option.highlighted)
    return highlightedIndex >= 0 ? highlightedIndex : 0
  }, [product.purchaseOptions])

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    defaultOptionIndex,
  )

  const handleAddToCart = async () => {
    try {
      await addItem({
        product: product.id,
      })

      console.log('Added to cart:', {
        productId: product.id,
        selectedOption:
          selectedOptionIndex !== null && Array.isArray(product.purchaseOptions)
            ? product.purchaseOptions[selectedOptionIndex]
            : null,
      })

      showCartSuccessToast(product.title)

    } catch (error) {
      showCartErrorToast()
      console.error('Failed to add item to cart:', error)
    }
  }

  return (
    <div className="flex flex-col">
      {product.eyebrow && (
        <div className="mb-3">
          <span className="text-xs uppercase tracking-[0.2em] text-[#d4a63c]">
            {product.eyebrow}
          </span>
        </div>
      )}

      <h1 className="mb-4 text-5xl font-bold uppercase tracking-tight text-white">
        {product.title}
      </h1>

      {Array.isArray(product.badges) && product.badges.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-3">
          {product.badges.map((badge, i) => (
            <span
              key={i}
              className="rounded-full border border-[#d4a63c]/40 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[#d4a63c]"
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {product.meta?.description && (
        <p className="mb-8 text-lg leading-8 text-[#d8ccb7]">
          {product.meta.description}
        </p>
      )}

      {Array.isArray(product.whatsInside) && product.whatsInside.length > 0 && (
        <div className="mb-10 border border-white/10 bg-[#111] p-6">
          <h3 className="mb-4 text-2xl font-semibold text-white">What&apos;s Inside</h3>

          <ul className="space-y-3 text-base text-[#e7dfcf]">
            {product.whatsInside.map((item, i) => (
              <li key={i}>
                <span className="mr-2 font-bold text-[#d4a63c]">{item.quantity}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(product.purchaseOptions) && product.purchaseOptions.length > 0 && (
        <div className="mb-8">
          <span className="mb-4 block text-xs uppercase tracking-[0.2em] text-[#8f8679]">
            Select Experience
          </span>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {product.purchaseOptions.map((option, i) => {
              const isSelected = selectedOptionIndex === i

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedOptionIndex(i)}
                  className={
                    isSelected
                      ? 'border border-[#d4a63c] bg-[#d4a63c]/5 p-5 text-left'
                      : 'border border-white/10 p-5 text-left'
                  }
                >
                  <span
                    className={
                      isSelected
                        ? 'mb-1 block text-xs uppercase tracking-[0.15em] text-[#d4a63c]'
                        : 'mb-1 block text-xs uppercase tracking-[0.15em] text-[#8f8679]'
                    }
                  >
                    {option.label}
                  </span>

                  <span className="block text-3xl font-semibold text-white">
                    {option.price}
                  </span>

                  {option.subtext && (
                    <span
                      className={
                        isSelected
                          ? 'mt-1 block text-[10px] uppercase tracking-[0.14em] text-[#b89e62]'
                          : 'mt-1 block text-[10px] uppercase tracking-[0.14em] text-[#8f8679]'
                      }
                    >
                      {option.subtext}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* <button
          type="button"
          onClick={handleAddToCart}
          disabled={isLoading}
          className="flex h-16 items-center justify-center bg-[#d4a63c] text-sm font-bold uppercase tracking-[0.2em] text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Adding...' : product.primaryCTA?.label || 'Add To Cart'}
        </button> */}

        <AddToCart
          product={product}
          className="flex h-16 items-center justify-center bg-[#d4a63c] text-sm font-bold uppercase tracking-[0.2em] text-black"
        />

        {product.secondaryCTA?.label && (
          <Link
            href={product.secondaryCTA.url || '#'}
            className="flex h-16 items-center justify-center border border-[#d4a63c] text-sm font-bold uppercase tracking-[0.2em] text-[#d4a63c]"
          >
            {product.secondaryCTA.label}
          </Link>
        )}
      </div>
    </div>
  )
}