'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/cn'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { cssVariables } from '@/cssVariables'
import { placeholderFor, shouldBypassNextImageOptimizer, shouldUseTempPlaceholder } from '@/utilities/placeholderImage'

const { breakpoints } = cssVariables

export const Image: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    height: heightFromProps,
    imgClassName,
    onClick,
    onLoad: onLoadFromProps,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    width: widthFromProps,
  } = props

  const [isLoading, setIsLoading] = React.useState(true)

  let width: number | undefined | null
  let height: number | undefined | null
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const {
      alt: altFromResource,
      filename: fullFilename,
      height: fullHeight,
      url,
      width: fullWidth,
    } = resource

    width = widthFromProps ?? fullWidth
    height = heightFromProps ?? fullHeight
    alt = altFromResource

    const filename = fullFilename

    const raw = url?.startsWith('http') ? url : url || ''
    const base =
      typeof process !== 'undefined'
        ? process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '') || ''
        : ''
    src = raw.startsWith('/') && base ? `${base}${raw}` : raw
  }

  if (typeof src === 'string' && shouldUseTempPlaceholder(src)) {
    src = ''
  }

  if (typeof src === 'string' && src.trim() === '') {
    src = placeholderFor('default')
    if (!fill) {
      width = width ?? 1600
      height = height ?? 1067
    }
  }

  // next/image requires width+height whenever `fill` is false (e.g. header logo with only `src`).
  if (!fill && typeof src === 'string' && src.trim() !== '') {
    const w = width ?? widthFromProps
    const h = height ?? heightFromProps
    if (w == null || h == null || w < 1 || h < 1) {
      width = w != null && w > 0 ? w : 1600
      height = h != null && h > 0 ? h : 1067
    }
  }

  // NOTE: this is used by the browser to determine which image to download at different screen sizes
  const sizes = sizeFromProps
    ? sizeFromProps
    : Object.entries(breakpoints)
      .map(([, value]) => `(max-width: ${value}px) ${value}px`)
      .join(', ')

  const unoptimized = typeof src === 'string' && shouldBypassNextImageOptimizer(src)

  return (
    <NextImage
      alt={alt || ''}
      className={cn(imgClassName)}
      fill={fill}
      height={!fill ? height || heightFromProps : undefined}
      onClick={onClick}
      onLoad={() => {
        setIsLoading(false)
        if (typeof onLoadFromProps === 'function') {
          onLoadFromProps()
        }
      }}
      priority={priority}
      quality={90}
      sizes={sizes}
      src={src}
      unoptimized={unoptimized}
      width={!fill ? width || widthFromProps : undefined}
    />
  )
}
