import type { Media as MediaType } from '@/payload-types'

import { Label } from '@/components/Grid/Label'
import { Media } from '@/components/Media'
import type { PlaceholderArea } from '@/utilities/placeholderImage'
import { placeholderFor } from '@/utilities/placeholderImage'
import clsx from 'clsx'
import React from 'react'

type Props = {
  active?: boolean
  isInteractive?: boolean
  label?: {
    amount: number
    position?: 'bottom' | 'center'
    title: string
  }
  media?: MediaType | null
  /** When `media` is missing, which built-in / env placeholder to use */
  placeholderArea?: PlaceholderArea
}

export const GridTileImage: React.FC<Props> = ({
  active,
  isInteractive = true,
  label,
  placeholderArea = 'product',
  ...props
}) => {
  return (
    <div
      className={clsx(
        'group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-black hover:border-blue-600 dark:bg-black',
        {
          'border-2 border-blue-600': active,
          'border-neutral-200 dark:border-neutral-800': !active,
          relative: label,
        },
      )}
    >
      <Media
        className={clsx('relative h-full w-full object-cover', {
          'transition duration-300 ease-in-out group-hover:scale-105': isInteractive,
        })}
        height={80}
        imgClassName="h-full w-full object-cover"
        resource={props.media ?? undefined}
        src={!props.media ? placeholderFor(placeholderArea) : undefined}
        width={80}
      />
      {label ? <Label amount={label.amount} position={label.position} title={label.title} /> : null}
    </div>
  )
}
