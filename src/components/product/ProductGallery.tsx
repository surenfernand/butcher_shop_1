import type { Media, Product } from '@/payload-types'
import Image from 'next/image'

type Props = {
  product: Product
}

export default function ProductGallery({ product }: Props) {
  const gallery = (product.productGallery || [])
    .map((item) => item.image)
    .filter((image): image is Media => typeof image === 'object' && image !== null)


  const featured = gallery[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/10 bg-[#111]">
        {featured?.url && (
          <Image
            src={featured.url}
            alt={featured.alt || 'Product image'}
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {gallery.slice(1, 4).map((img, i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden border border-white/10 bg-[#111]"
          >
            {img?.url && (
              <Image
                src={img.url}
                alt={img.alt || `Product image ${i + 1}`}
                fill
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}