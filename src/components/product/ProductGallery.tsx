'use client'

import type { Media, Product } from '@/payload-types'
import { mediaUrlOrPlaceholder } from '@/utilities/placeholderImage'
import Image from 'next/image'
import { useState } from 'react'

type Props = {
  product: Product
}

export default function ProductGallery({ product }: Props) {
  const gallery = (product.productGallery || [])
    .map((item) => item.image)
    .filter((image): image is Media => typeof image === 'object' && image !== null)

  const [activeIndex, setActiveIndex] = useState(0)

  const mainImage = gallery[activeIndex] ?? gallery[0]
  const thumbSlots = [1, 2, 3] as const

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="relative aspect-[4/3] w-full max-h-[420px] overflow-hidden border border-white/10 bg-[#111] md:max-h-[480px]">
        <Image
          src={mediaUrlOrPlaceholder(mainImage?.url)}
          alt={mainImage?.alt || 'Product image'}
          fill
          sizes="(max-width: 1024px) 100vw, 58vw"
          priority
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {thumbSlots.map((slotIndex) => {
          const img = gallery[slotIndex]
          const isActive = activeIndex === slotIndex

          return (
            <button
              key={slotIndex}
              type="button"
              disabled={!img}
              onClick={() => img && setActiveIndex(slotIndex)}
              className={[
                'relative aspect-square w-full overflow-hidden border bg-[#111] transition',
                img ? 'cursor-pointer hover:opacity-95' : 'cursor-default',
                isActive ? 'border-[#d4af5f]/80 ring-1 ring-[#d4af5f]/40' : 'border-white/10',
              ].join(' ')}
              aria-label={img ? `View image ${slotIndex + 1}` : 'Empty gallery slot'}
            >
              <Image
                src={mediaUrlOrPlaceholder(img?.url)}
                alt={img?.alt || `Product image ${slotIndex + 1}`}
                fill
                sizes="(max-width: 1024px) 33vw, 20vw"
                className="object-cover"
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
