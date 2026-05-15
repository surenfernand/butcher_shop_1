'use client'

import type { Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { GridTileImage } from '@/components/Grid/tile'
import { placeholderFor } from '@/utilities/placeholderImage'
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'

type Props = {
  gallery: NonNullable<Product['productGallery']>
}

export const Gallery: React.FC<Props> = ({ gallery }) => {
  const searchParams = useSearchParams()
  const [current, setCurrent] = React.useState(0)
  const [api, setApi] = React.useState<CarouselApi>()

  useEffect(() => {
    if (!api) {
      return
    }
  }, [api])

  useEffect(() => {
    const values = Array.from(searchParams.values())

    if (values && api) {
      const index = gallery.findIndex((item: NonNullable<Product['productGallery']>[number]) => {
        if (!item.id) return false
        return Boolean(values.find((value) => value === String(item.id)))
      })
      if (index !== -1) {
        setCurrent(index)
        api.scrollTo(index, true)
      }
    }
  }, [searchParams, api, gallery])

  const currentItem = gallery[current]
  const currentImage = currentItem?.image
  const currentMedia =
    typeof currentImage === 'object' && currentImage !== null ? currentImage : undefined

  return (
    <div>
      <div className="relative w-full overflow-hidden mb-8">
        <Media
          resource={currentMedia}
          src={!currentMedia ? placeholderFor('gallery') : undefined}
          className="w-full"
          imgClassName="w-full rounded-lg"
        />
      </div>

      <Carousel setApi={setApi} className="w-full" opts={{ align: 'start', loop: false }}>
        <CarouselContent>
          {gallery.map((item: NonNullable<Product['productGallery']>[number], i: number) => {
            const thumb =
              typeof item.image === 'object' && item.image !== null ? item.image : undefined
            const key = thumb?.id != null ? String(thumb.id) : `slot-${i}`

            return (
              <CarouselItem className="basis-1/5" key={key} onClick={() => setCurrent(i)}>
                <GridTileImage
                  active={i === current}
                  media={thumb}
                  placeholderArea="gallery"
                />
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
