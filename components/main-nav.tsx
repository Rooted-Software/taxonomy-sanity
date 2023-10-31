'use client'

import { Icons } from '@/components/icons'
import { MobileNav } from '@/components/mobile-nav'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import * as React from 'react'
import { SidebarNavItem } from 'types'

interface MainNavProps {
  items?: SidebarNavItem[]
  children?: React.ReactNode
}

export function MainNav({ items, children }: MainNavProps) {
  const segment = useSelectedLayoutSegment()
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false)

  return (
    <div>
      <button
        className="flex items-center space-x-2 md:hidden"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        {showMobileMenu ? (
          <Icons.close />
        ) : (
          <Image width={24} height={24} src="/icon.png" alt="" />
        )}
        <span className="font-bold">Menu</span>
      </button>
      {showMobileMenu && items && (
        <MobileNav items={items}>{children}</MobileNav>
      )}
    </div>
  )
}
