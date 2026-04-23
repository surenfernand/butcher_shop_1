'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Image from 'next/image'

export const HighImpactHero: React.FC<Page['hero']> = ({
  links,
  media,
  eyebrow,
  heading,
  description,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  const imageUrl =
    media && typeof media === 'object' && media.url ? media.url : null

  return (
    <section
      className="relative -mt-[10.4rem] min-h-screen overflow-hidden bg-black text-white"
      data-theme="dark"
    >
      <div className="absolute inset-0">
        <div className="relative h-full w-full">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={(media && typeof media === 'object' && media.alt) || 'Hero image'}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="container w-full px-4 md:px-8">
          <div className="max-w-xl pt-24 md:pt-32">
            {eyebrow && (
              <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-[#d4a63c]">
                {eyebrow}
              </p>
            )}

            {heading && (
              <h1 className="mb-4 text-3xl font-light uppercase leading-tight md:text-5xl">
                {heading}
              </h1>
            )}

            {description && (
              <p className="mb-8 text-sm leading-7 text-white/80 md:text-base">
                {description}
              </p>
            )}

            {Array.isArray(links) && links.length > 0 && (
              <ul className="flex flex-wrap gap-4">
                {links.map(({ link }, i) => (
                  <li key={i}>
                    <CMSLink
                      {...link}
                      className="inline-flex min-w-[160px] items-center justify-center border border-[#d4a63c] px-6 py-3 text-xs uppercase tracking-[0.2em] transition"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}