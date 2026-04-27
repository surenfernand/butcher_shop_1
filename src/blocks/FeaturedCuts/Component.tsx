import React from 'react'
import type { DefaultDocumentIDType } from 'payload'
import type { FeaturedCutsBlock as FeaturedCutsBlockProps } from '@/payload-types'

type Props = FeaturedCutsBlockProps & {
  id?: DefaultDocumentIDType
  className?: string
}

export const FeaturedCutsBlock: React.FC<Props> = ({
  eyebrow,
  title,
  intro,
  items,
  className,
}) => {
  if (!items || !items.length) return null

  return (
    <section className={['py-20', className].filter(Boolean).join(' ')}>
      <div className="container">
        <div className="mb-12 text-center">
          {eyebrow && (
            <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-[#d4a63c]">
              {eyebrow}
            </p>
          )}

          {title && <h2 className="text-sm font-medium text-white md:text-base">{title}</h2>}

          {intro && <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/70">{intro}</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.id || index}
              className="flex min-h-[280px] flex-col bg-black px-6 py-8 text-white"
            >
              <div className="mb-10 text-3xl font-light text-[#8f6a18]">
                {String(index + 1).padStart(2, '0')}
              </div>

              <h3 className="mb-4 text-base font-medium">{item.name}</h3>

              {item.description && (
                <p className="mb-10 max-w-[22ch] text-sm leading-6 text-white/75">
                  {item.description}
                </p>
              )}

              <div className="mt-auto flex items-end justify-between gap-4">
                {item.price && (
                  <span className="text-base font-semibold text-[#d4a63c]">{item.price}</span>
                )}

                {item.tag && (
                  <span className="border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/80">
                    {item.tag}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}