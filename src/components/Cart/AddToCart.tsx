'use client'

import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import clsx from 'clsx'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type Props = {
  product: Product
  className?: string
}

type BranchStock = {
  stockQuantity: number
  stockStatus: string
}

export function AddToCart({ product, className }: Props) {
  const { addItem, cart, isLoading } = useCart()
  const searchParams = useSearchParams()

  const [branchStock, setBranchStock] = useState<BranchStock>({
    stockQuantity: 0,
    stockStatus: 'outofstock',
  })

  const variants = product.variants?.docs || []

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')

      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, searchParams, variants])

  useEffect(() => {
    const loadBranchStock = async () => {
      const fulfillment = JSON.parse(localStorage.getItem('fulfillment') || '{}')
      const branchId = fulfillment.branch

      if (!branchId) {
        setBranchStock({
          stockQuantity: 0,
          stockStatus: 'outofstock',
        })
        return
      }

      const productId = product.id

      const res = await fetch(
        `/api/multi-location/product-price?product=${productId}&branch=${branchId}`,
      )

      if (!res.ok) {
        setBranchStock({
          stockQuantity: 0,
          stockStatus: 'outofstock',
        })
        return
      }

      const data = await res.json()

      setBranchStock({
        stockQuantity: data.stockQuantity || 0,
        stockStatus: data.stockStatus || 'outofstock',
      })
    }

    if (product.enableVariants && !selectedVariant) {
      setBranchStock({
        stockQuantity: 0,
        stockStatus: 'outofstock',
      })
      return
    }

    loadBranchStock()
  }, [product.id, product.enableVariants, selectedVariant])

  const addToCart = useCallback(
    (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (branchStock.stockStatus === 'outofstock' || branchStock.stockQuantity <= 0) {
        toast.error('This item is out of stock.')
        return
      }

      addItem({
        product: product.id,
        variant: selectedVariant?.id ?? undefined,
      }).then(() => {
        toast.success('Item added to cart.')
      })
    },
    [addItem, product.id, selectedVariant?.id, branchStock],
  )

  const disabled = useMemo<boolean>(() => {
    if (product.enableVariants && !selectedVariant) {
      return true
    }

    if (branchStock.stockStatus === 'outofstock' || branchStock.stockQuantity <= 0) {
      return true
    }

    const existingItem = cart?.items?.find((item) => {
      const productID = typeof item.product === 'object' ? item.product?.id : item.product
      const variantID = item.variant
        ? typeof item.variant === 'object'
          ? item.variant?.id
          : item.variant
        : undefined

      if (productID === product.id) {
        if (product.enableVariants) {
          return variantID === selectedVariant?.id
        }

        return true
      }

      return false
    })

    if (existingItem) {
      return existingItem.quantity >= branchStock.stockQuantity
    }

    return false
  }, [
    selectedVariant,
    cart?.items,
    product.id,
    product.enableVariants,
    branchStock.stockQuantity,
    branchStock.stockStatus,
  ])

  return (
    <Button
      aria-label="Add to cart"
      // variant="outline"
      className={className}
      disabled={false}
      onClick={addToCart}
      type="submit"
      style={{borderRadius: "0px", }}
    >
      {isLoading ? 'Adding...' : product.primaryCTA?.label || 'Add To Cart'}
    </Button>
  )
}