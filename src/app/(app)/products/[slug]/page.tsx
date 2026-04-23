import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import ProductGallery from '@/components/product/ProductGallery'
import ProductDetails from '@/components/product/ProductDetails'
import ProductReviews from '@/components/product/ProductReviews'

type Args = {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: Args) {
    const { slug } = await params 

  if (!slug) return notFound()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    limit: 1,
    pagination: false,
    depth: 2,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const product = result.docs?.[0]

  if (!product) return notFound()

  return (
    <main className="bg-black pt-32 pb-20 text-white">
      <div className="container">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ProductGallery product={product} />
          </div>

          <div className="lg:col-span-5">
            <ProductDetails product={product} />
          </div>
        </div>

        <ProductReviews product={product} />
      </div>
    </main>
  )
}