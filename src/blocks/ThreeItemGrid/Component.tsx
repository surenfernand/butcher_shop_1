import type { Media, Product, ThreeItemGridBlock as ThreeItemGridBlockProps } from '@/payload-types'
import Link from 'next/link'
import React from 'react'
import type { DefaultDocumentIDType } from 'payload'
import Image from 'next/image'

type ProductCardItem = Product & {
  title?: string
  slug?: string
  meta?: {
    image?: Media | null
    description?: string | null
  } | null
}

type CardProps = {
  item: ProductCardItem
}

const ProductCard: React.FC<CardProps> = ({ item }) => {
  const image = item.meta?.image as Media | undefined
  const imageUrl = image?.url

  if (!item || !item.slug) return null

  return (
    <Link
      href={`/products/${item.slug}`}
      className="group block overflow-hidden bg-black"
    >
      <div className="relative aspect-[4/4] w-full">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={image?.alt || item.title || 'Product'}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      <div className="px-5 py-5 text-white">
        <h3 className="mb-2 text-sm font-medium">{item.title || 'Untitled product'}</h3>
        <p className="mb-4 text-sm text-white/70">
          {item.meta?.description || 'Discover our curated selection.'}
        </p>
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#d4a63c]">
          Explore →
        </span>
      </div>
    </Link>
  )
}

export const ThreeItemGridBlock: React.FC<
  ThreeItemGridBlockProps & {
    id?: DefaultDocumentIDType
    className?: string
  }
> = async ({ products }) => {
  if (!products || !products[0] || !products[1]) return null

  const [firstProduct, secondProduct] = products

  return (
    <section className="bg-[#0b0f12] py-16">
      <div className="container">
        <div className="mb-10 grid gap-6 md:grid-cols-2 md:items-start">
          <div>
            <p className="inline-block border-b border-[#d4a63c] pb-2 text-sm text-white">
              Our Products
            </p>
          </div>

          <div className="max-w-md md:justify-self-end">
            <p className="text-sm leading-6 text-white/80">
              A meticulous selection from the best livestock to ensure unparalleled
              tenderness and flavor.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ProductCard item={firstProduct as ProductCardItem} />
          <ProductCard item={secondProduct as ProductCardItem} />
        </div>
      </div>
    </section>
  )
}