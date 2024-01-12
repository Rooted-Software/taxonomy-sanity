'use client'

import * as React from 'react'
import Image from 'next/image'

import { SidebarNavItem } from 'types'

import { Icons } from './icons'
import { MobileNav } from './mobile-nav'

interface MainNavProps {
  items?: SidebarNavItem[]
  children?: React.ReactNode
}

export function MainNav({ items, children }: MainNavProps) {
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
