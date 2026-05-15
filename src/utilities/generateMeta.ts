import type { Metadata } from 'next'

import type { Page, Product } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'

export const generateMeta = async (args: {
  doc: Page | Product | null | undefined
}): Promise<Metadata> => {
  const { doc } = args || {}
  if (!doc || typeof doc !== 'object') {
    return {
      openGraph: mergeOpenGraph({
        title: 'Payload Ecommerce Template',
        url: '/',
      }),
      title: 'Payload Ecommerce Template',
    }
  }

  const pageMeta = 'meta' in doc ? doc.meta : undefined

  const imageUrl =
    typeof pageMeta?.image === 'object' && pageMeta.image !== null && 'url' in pageMeta.image
      ? pageMeta.image.url
      : null

  const ogImage =
    imageUrl &&
    (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
      ? imageUrl
      : `${process.env.NEXT_PUBLIC_SERVER_URL}${imageUrl}`)

  return {
    description: pageMeta?.description,
    openGraph: mergeOpenGraph({
      ...(pageMeta?.description
        ? {
            description: pageMeta.description,
          }
        : {}),
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title: pageMeta?.title || doc?.title || 'Payload Ecommerce Template',
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title: pageMeta?.title || doc?.title || 'Payload Ecommerce Template',
  }
}
