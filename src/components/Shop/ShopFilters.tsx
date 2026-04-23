'use client'

import { createUrl } from '@/utilities/createUrl'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

type ShopFiltersProps = {
  labels?: {
    cutTypeLabel?: string
    agingProcessLabel?: string
    originLabel?: string
    priceRangeLabel?: string
  }
  sortLabel?: string
}

const cutTypes = [
  { label: 'Prime Rib', value: 'prime-rib' },
  { label: 'Wagyu Strips', value: 'wagyu-strips' },
  { label: 'Filet Mignon', value: 'filet-mignon' },
  { label: 'Tomahawk', value: 'tomahawk' },
]

const agingProcesses = [
  { label: 'Dry-Aged', value: 'dry-aged' },
  { label: 'Wet-Aged', value: 'wet-aged' },
]

const origins = [
  { label: 'Japanese Heritage', value: 'japanese-heritage' },
  { label: 'Black Angus Heritage', value: 'black-angus-heritage' },
  { label: 'Midwest Corn-Fed', value: 'midwest-corn-fed' },
]

const sorting = [
  { label: 'Exclusivity', value: '-sortPriority' },
  { label: 'Alphabetic A-Z', value: 'title' },
  { label: 'Latest arrivals', value: '-createdAt' },
  { label: 'Price: Low to high', value: 'priceInUSD' },
  { label: 'Price: High to low', value: '-priceInUSD' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-[11px] uppercase tracking-[0.24em] text-[#9f8650]">{children}</h3>
  )
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({ labels, sortLabel }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCutType = searchParams.get('cutType') || ''
  const currentAgingProcess = searchParams.get('agingProcess') || ''
  const currentOrigin = searchParams.get('origin') || ''
  const currentSort = searchParams.get('sort') || '-sortPriority'
  const currentMinPrice = searchParams.get('minPrice') || ''
  const currentMaxPrice = searchParams.get('maxPrice') || ''

  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (!value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    params.delete('page')
    router.push(createUrl(pathname, params))
  }

  const updateMany = (entries: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(entries).forEach(([key, value]) => {
      if (!value) params.delete(key)
      else params.set(key, value)
    })

    params.delete('page')
    router.push(createUrl(pathname, params))
  }

  return (
    <aside className="w-full max-w-[260px] bg-black text-white">
      <div className="space-y-8">
        <div>
          <SectionTitle>{labels?.cutTypeLabel || 'Cut Type'}</SectionTitle>
          <div className="space-y-3">
            {cutTypes.map((item) => {
              const checked = currentCutType === item.value

              return (
                <label key={item.value} className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    checked={checked}
                    className="h-4 w-4 accent-[#c8a24d]"
                    onChange={() => updateParam('cutType', checked ? '' : item.value)}
                    type="checkbox"
                  />
                  <span>{item.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <SectionTitle>{labels?.agingProcessLabel || 'Aging Process'}</SectionTitle>
          <div className="flex gap-2">
            {agingProcesses.map((item) => {
              const active = currentAgingProcess === item.value

              return (
                <button
                  key={item.value}
                  className={clsx(
                    'border px-4 py-2 text-xs uppercase tracking-[0.2em] transition',
                    active
                      ? 'border-[#c8a24d] bg-[#c8a24d] text-black'
                      : 'border-[#2a2a2a] text-white hover:border-[#c8a24d]',
                  )}
                  onClick={() => updateParam('agingProcess', active ? '' : item.value)}
                  type="button"
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <SectionTitle>{labels?.originLabel || 'Origin'}</SectionTitle>
          <select
            className="w-full border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm text-white outline-none"
            onChange={(e) => updateParam('origin', e.target.value)}
            value={currentOrigin}
          >
            <option value="">All Origins</option>
            {origins.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <SectionTitle>{labels?.priceRangeLabel || 'Price Range'}</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-white outline-none"
              defaultValue={currentMinPrice}
              placeholder="Min"
              type="number"
              onBlur={(e) =>
                updateMany({
                  minPrice: e.target.value,
                  maxPrice: currentMaxPrice,
                })
              }
            />
            <input
              className="border border-[#2a2a2a] bg-[#111] px-3 py-2 text-sm text-white outline-none"
              defaultValue={currentMaxPrice}
              placeholder="Max"
              type="number"
              onBlur={(e) =>
                updateMany({
                  minPrice: currentMinPrice,
                  maxPrice: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div>
          <SectionTitle>{sortLabel || 'Sort by'}</SectionTitle>
          <select
            className="w-full border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm text-white outline-none"
            onChange={(e) => updateParam('sort', e.target.value)}
            value={currentSort}
          >
            {sorting.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  )
}