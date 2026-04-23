import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'

export const ProductGridBlock = async () => {
  const payload = await getPayload({ config })

  const products = await payload.find({
    collection: 'products',
    limit: 12,
    depth: 2,
  })

  return (
    <section className="bg-black py-16 text-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-8 md:grid-cols-4">
        <div className="space-y-10">
          <div>
            <h3 className="mb-3 text-sm uppercase text-gray-400">Cut Type</h3>
            {['Prime Rib', 'Wagyu Strips', 'Filet Mignon', 'Tomahawk'].map((item) => (
              <div key={item} className="text-sm text-gray-300">
                {item}
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-3 text-sm uppercase text-gray-400">Aging</h3>
            {['21 Days Dry-Aged', '45 Days Dry-Aged', 'Wet-Aged Prime'].map((item) => (
              <div key={item} className="text-sm text-gray-300">
                {item}
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-3 text-sm uppercase text-gray-400">Origin</h3>
            {['Japanese Miyazaki', 'Australian Wagyu', 'Heritage Angus'].map((item) => (
              <div key={item} className="text-sm text-gray-300">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl uppercase">The Shop</h2>
              <p className="text-sm text-gray-400">
                Curated selections of the world&apos;s finest prime cuts.
              </p>
            </div>

            <div className="text-sm text-gray-400">
              SORT BY: <span className="text-yellow-400">RECOMMENDED</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {products.docs.map((product: any) => {
              const image =
                product.gallery?.[0]?.image && typeof product.gallery[0].image === 'object'
                  ? product.gallery[0].image
                  : null

              let price = product.priceInUSD

              const variants = product.variants?.docs
              if (variants && variants.length > 0) {
                const variant = variants[0]
                if (
                  variant &&
                  typeof variant === 'object' &&
                  typeof variant.priceInUSD === 'number'
                ) {
                  price = variant.priceInUSD
                }
              }

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="block border border-white/5 bg-[#121414] transition hover:border-[#d3a84b]/30"
                >
                  <div className="relative h-[300px] bg-black">
                    {image ? (
                      <Media resource={image} fill imgClassName="object-cover" />
                    ) : null}

                    {product.eyebrow ? (
                      <span className="absolute left-3 top-3 bg-black px-2 py-1 text-xs text-yellow-400">
                        {product.eyebrow}
                      </span>
                    ) : null}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg">{product.title}</h3>
                      {typeof price === 'number' && (
                        <span className="text-yellow-400">
                          <Price amount={price} />
                        </span>
                      )}
                    </div>

                    {product.meta?.description ? (
                      <p className="mt-3 text-sm text-gray-500">{product.meta.description}</p>
                    ) : null}

                    <button className="mt-6 w-full bg-yellow-500 py-3 text-sm uppercase text-black">
                      View Product
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}