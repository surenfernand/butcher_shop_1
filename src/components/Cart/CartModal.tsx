'use client'

import { Price } from '@/components/Price'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCart, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import { OpenCartButton } from './OpenCart'
import { Product } from '@/payload-types'

export function CartModal() {
  const { cart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined
    return cart.items.reduce((quantity, item) => (item.quantity || 0) + quantity, 0)
  }, [cart])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <OpenCartButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full max-w-[410px] border-r border-[#6f5620]/50 bg-[#0a0a0a] p-0 text-white"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-[#1d1d1d] px-7 py-8 text-left">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-left text-[2.1rem] font-black uppercase tracking-[-0.02em] text-[#d4a63c]">
                  Cart
                </SheetTitle>

              </div>

              
            </div>
          </SheetHeader>

          {!cart || cart?.items?.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
              <ShoppingCart className="h-14 w-14 text-[#d4a63c]" />
              <p className="text-xl font-bold uppercase tracking-wide text-white">
                Your cart is empty
              </p>
              <p className="text-sm text-[#8a8a8a]">
              Add Items to view in Cart
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <ul className="space-y-6">
                  {cart?.items?.map((item, i) => {
                    const product = item.product
                    const variant = item.variant

                    if (typeof product !== 'object' || !item || !product || !product.slug) {
                      return <React.Fragment key={i} />
                    }

                    const metaImage =
                      product.meta?.image && typeof product.meta?.image === 'object'
                        ? product.meta.image
                        : undefined

                    const firstGalleryImage =
                      typeof product.gallery?.[0]?.image === 'object'
                        ? product.gallery?.[0]?.image
                        : undefined

                    let image = firstGalleryImage || metaImage
                    let price = product.priceInUSD

                    const isVariant = Boolean(variant) && typeof variant === 'object'

                    if (isVariant) {
                      price = variant?.priceInUSD

                      const imageVariant = product.gallery?.find((galleryItem) => {
                        if (!galleryItem.variantOption) return false
                        const variantOptionID =
                          typeof galleryItem.variantOption === 'object'
                            ? galleryItem.variantOption.id
                            : galleryItem.variantOption

                        return variant?.options?.some((option) => {
                          if (typeof option === 'object') return option.id === variantOptionID
                          return option === variantOptionID
                        })
                      })

                      if (imageVariant && typeof imageVariant.image === 'object') {
                        image = imageVariant.image
                      }
                    }

                    const variantText = isVariant
                      ? variant?.options
                        ?.map((option) => {
                          if (typeof option === 'object') return option.label
                          return null
                        })
                        .filter(Boolean)
                        .join(' ')
                      : ''

                    return (
                      <li key={i} className="flex items-start gap-4">
                        <Link
                          href={`/products/${(item.product as Product)?.slug}`}
                          className="block shrink-0"
                        >
                          <div className="relative h-[104px] w-[104px] overflow-hidden border border-[#2b2b2b] bg-[#121212]">
                            {image?.url && (
                              <Image
                                alt={image?.alt || product?.title || ''}
                                className="h-full w-full object-cover"
                                height={120}
                                src={image.url}
                                width={120}
                              />
                            )}
                          </div>
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/products/${(item.product as Product)?.slug}`}
                                className="block"
                              >
                                <h3 className="line-clamp-2 text-[1.05rem] font-extrabold uppercase leading-tight tracking-[0.02em] text-[#f3f0ea]">
                                  {product?.title}
                                </h3>
                              </Link>

                              {(variantText || item.quantity) && (
                                <p className="mt-2 text-[0.78rem] uppercase tracking-[0.08em] text-[#727272]">
                                  {variantText ? `Weight: ${variantText}` : ''}
                                </p>
                              )}
                            </div>

                            <DeleteItemButton item={item} />
                          </div>

                          <div className="mt-5 flex items-end justify-between gap-3">
                            <div className="flex h-8 items-center border border-[#3a3a3a] bg-transparent">
                              <EditItemQuantityButton
                                item={item}
                                type="minus"
                                className="h-8 w-8 border-r border-[#3a3a3a] text-[#bdbdbd] hover:bg-[#161616] hover:text-white"
                              />

                              <span className="flex h-8 w-9 items-center justify-center text-sm text-[#d7d7d7]">
                                {item.quantity}
                              </span>
                              <EditItemQuantityButton
                                item={item}
                                type="plus"
                                className="h-8 w-8 border-l border-[#3a3a3a] text-[#bdbdbd] hover:bg-[#161616] hover:text-white"
                              />
                            </div>

                            {typeof price === 'number' && (
                              <Price
                                amount={price * (item.quantity || 1)}
                                className="text-right text-[1.05rem] font-bold text-[#d4a63c]"
                              />
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="border-t border-[#6f5620]/40 bg-[#111414] px-7 py-6">
                <div className="space-y-3 text-sm uppercase tracking-[0.14em]">
                  <div className="flex items-center justify-between text-[#a9a9a9]">
                    <span>Subtotal</span>
                    {typeof cart?.subtotal === 'number' && (
                      <Price amount={cart.subtotal} className="text-base text-[#bcbcbc]" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[#a9a9a9]">
                    <span>Shipping Est.</span>
                    <span className="text-[#d4a63c]">Complimentary</span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-[#262626] pt-4">
                    <span className="text-lg font-extrabold tracking-[0.14em] text-[#f1f1f1]">
                      Investment Total
                    </span>
                    {typeof cart?.subtotal === 'number' && (
                      <Price amount={cart.subtotal} className="text-3xl font-black text-[#d4a63c]" />
                    )}
                  </div>
                </div>

                <div className="mt-7 space-y-5">
                  <Link
                    href="/checkout"
                    className="flex h-14 w-full items-center justify-center bg-[#d4a63c] text-sm font-extrabold uppercase tracking-[0.18em] text-black transition-all hover:brightness-110"
                  >
                    Proceed to Checkout
                  </Link>

                  {/* <div className="text-center">
                    <Link
                      href="/cart"
                      className="text-xs font-medium uppercase tracking-[0.32em] text-[#7f7f7f] transition-colors hover:text-white"
                    >
                      View Full Cart
                    </Link>
                  </div> */}

                  <div className="flex items-center justify-center gap-10 border-t border-[#1f1f1f] pt-5 text-[11px] uppercase tracking-[0.14em] text-[#555]">
                    {/* <Link href="/cart" className="transition-colors hover:text-[#d4a63c]">
                      View Cart
                    </Link> */}
                    <Link
                      href="/shipping-information"
                      className="transition-colors hover:text-[#d4a63c]"
                    >
                      Shipping Info
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}