'use client'

import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import { Clock3, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { FormBlock } from '@/blocks/Form/Component'

const icons: Record<string, LucideIcon> = {
  'map-pin': MapPin,
  phone: Phone,
  mail: Mail,
}

type Media = {
  url?: string | null
  alt?: string | null
}

type Card = {
  icon?: string | null
  title?: string | null
  line1?: string | null
  line2?: string | null
}

type StoreHour = {
  day?: string | null
  time?: string | null
}

type Props = {
  formTitle?: string | null
  cards?: Card[] | null
  storeHours?: StoreHour[] | null
  storeNote?: string | null
  form?: FormType
  mapImage?: Media | number | string | null
  mapTitle?: string | null
  mapLabel?: string | null
  mapEmbedUrl?: string | null
}

const getImageUrl = (image?: Media | number | string | null) =>
  image && typeof image === 'object' && image.url ? image.url : null

export const ContactPageBlock: React.FC<Props> = ({
  formTitle,
  cards,
  storeHours,
  storeNote,
  form,
  mapImage,
  mapTitle,
  mapLabel,
  mapEmbedUrl,
}) => {
  const mapImageUrl = getImageUrl(mapImage)

  return (
    <section className="bg-black px-6 py-20 text-white">
      <div className="mx-auto grid max-w-[1280px] gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          {(cards || []).map((card, index) => {
            const Icon = icons[card.icon || 'map-pin'] || MapPin

            return (
              <div key={index} className="bg-[#1b1f1e] p-7">
                <Icon className="mb-5 h-5 w-5 text-[#d9aa45]" />
                <h3 className="mb-3 text-sm font-semibold">{card.title}</h3>
                <p className="text-sm leading-7 text-white/80">{card.line1}</p>
                {card.line2 && <p className="text-sm leading-7 text-white/80">{card.line2}</p>}
              </div>
            )
          })}

          <div className="border border-[#4f3a12] bg-black p-7">
            <div className="mb-6 flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#d9aa45]" />
              <h3 className="text-sm font-semibold uppercase text-[#d9aa45]">Store Hours</h3>
            </div>

            <div className="space-y-4">
              {(storeHours || []).map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b border-white/10 pb-3 text-sm"
                >
                  <span className="font-bold uppercase">{item.day}</span>
                  <span className="font-bold text-[#d9aa45]">{item.time}</span>
                </div>
              ))}
            </div>

            {storeNote && <p className="mt-6 text-xs italic text-white/70">{storeNote}</p>}
          </div>
        </div>

        <div className="bg-[#1b1f1e] p-8 md:p-12">
          <h2 className="text-3xl font-extrabold uppercase">{formTitle || 'Send An Inquiry'}</h2>
          <div className="mb-10 mt-4 h-[3px] w-12 bg-[#d9aa45]" />

          {form && <FormBlock form={form} enableIntro={false} />}
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-[1280px]">
        <div className="relative h-[440px] overflow-hidden bg-[#1b1f1e]">
          {mapEmbedUrl ? (
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 grayscale"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white/60">
              Google Map not configured
            </div>
          )}

          {(mapTitle || mapLabel) && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {mapTitle && <h3 className="text-5xl font-bold text-black">{mapTitle}</h3>}
                {mapLabel && (
                  <p className="mt-2 bg-black px-4 py-2 text-xs uppercase text-white">
                    {mapLabel}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}