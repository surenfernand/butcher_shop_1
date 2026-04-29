'use client'

import { Cart } from '@/components/Cart'
import { OpenCartButton } from '@/components/Cart/OpenCart'
import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import type { Header } from 'src/payload-types'
import { MobileMenu } from './MobileMenu'
// import { LogoIcon } from '@/components/icons/logo'
import { Search, User } from 'lucide-react'

import { Media } from '@/components/Media'

type Props = {
  header: Header
}

export function HeaderClient({ header }: Props) {
  const menu = header.navItems || []
  const pathname = usePathname()
 
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#3a2d14] bg-black/70 backdrop-blur-sm transition-all duration-300 ease-out hover:text-[#d4a63c] hover:-translate-y-0.5">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Mobile menu */}
        <div className="flex items-center md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>

        {/* Left: Logo */}
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center">

            <Media
              resource={header.logo}
              imgClassName="h-20 w-auto object-contain"
            />

            {/* <span className="text-md font-black uppercase tracking-wide text-[#d4a63c]">
              The Butcher’s Craft
            </span> */}

          </Link>
        </div>

        {/* Center: Desktop nav */}
        <div className="hidden flex-1 justify-center md:flex">
          {menu.length ? (
            <ul className="flex items-center gap-8">
              {menu.map((item) => (
                <li key={item.id}>
                  <CMSLink
                    {...item.link}
                    appearance="nav"
                    size="clear"
                    className={cn(
                      'relative text-[11px] uppercase tracking-[0.18em] text-white/85 transition hover:text-[#d4a63c] transition-all duration-300 ease-out hover:text-[#d4a63c] hover:-translate-y-0.5',
                      {
                        'text-[#d4a63c] after:absolute after:left-0 after:-bottom-2 after:h-[1px] after:w-full after:bg-[#d4a63c]':
                          item.link?.url === '/'
                            ? pathname === '/'
                            : item.link?.url
                              ? pathname.startsWith(item.link.url)
                              : false,
                      },
                    )}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Right: icons */}
        <div className="flex flex-1 items-center justify-end gap-4 text-[#d4a63c] transition-all duration-300 ease-out hover:text-[#d4a63c] hover:-translate-y-0.5">
          <button
            type="button"
            className="hidden md:inline-flex transition hover:opacity-80"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <Suspense fallback={<OpenCartButton />}>
            <Cart />

          </Suspense>

          <Link href="/account" className="hidden md:inline-flex transition hover:opacity-80">
            <User className="h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>
  )
}