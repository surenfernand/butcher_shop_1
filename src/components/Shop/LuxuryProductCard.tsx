import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'

type Props = {
  product: Partial<Product> & {
    shopCardLabel?: string | null
    shopCardShortDescription?: string | null
    origin?: string | null
    cardButtonLabel?: string | null
    productGallery?: { image?: unknown }[] | null
  }
}

const originLabels: Record<string, string> = {
  'japanese-heritage': 'Japanese Heritage',
  'black-angus-heritage': 'Black Angus Heritage',
  'midwest-corn-fed': 'Midwest Corn-Fed',
}

export const LuxuryProductCard: React.FC<Props> = ({ product }) => {
  const firstImage = product.productGallery?.[0]?.image
  const image = typeof firstImage === 'object' && firstImage !== null ? firstImage : null

  console.log(image);

  const originText = product.origin ? originLabels[product.origin] || product.origin : ''

  return (
    <article className="overflow-hidden border border-[#1f1f1f] bg-[#0a0a0a] text-white">
      <Link className="group block h-full w-full" href={`/products/${product.slug}`}>
        <div className="relative">
          {product.shopCardLabel ? (
            <div className="absolute left-5 top-5 z-10 border border-[#c8a24d] bg-black/80 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#c8a24d]">
              {product.shopCardLabel}
            </div>
          ) : null}

          {image ? (
            <Media
              className="relative aspect-[4/4.4] w-full bg-[#111]"
              imgClassName={clsx(
                'h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]',
              )}
              resource={image as never}
            />
          ) : (
            <div className="aspect-[4/4.4] w-full bg-[#111]" />
          )}
        </div>

        <div className="space-y-3 p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-medium text-white">{product.title}</h3>

            {typeof product.priceInUSD === 'number' ? (
              <div className="shrink-0 text-[#c8a24d]">
                <Price amount={product.priceInUSD} />
              </div>
            ) : null}
          </div>

          {originText ? (
            <p className="text-xs uppercase tracking-[0.22em] text-[#8b8b8b]">{originText}</p>
          ) : null}

          {product.shopCardShortDescription ? (
            <p className="line-clamp-3 text-sm leading-6 text-[#c7c7c7]">
              {product.shopCardShortDescription}
            </p>
          ) : null}

          <div className="pt-2">
            <div className="border border-[#c8a24d] bg-[#c8a24d] px-5 py-3 text-center text-[11px] uppercase tracking-[0.28em] text-black transition hover:opacity-90">
              {product.cardButtonLabel || 'Add to Cart'}
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}