'use client'

import { signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { SidebarNavItem } from 'types'

interface DashboardNavProps {
  items: SidebarNavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const [open, setOpen] = useState(true);
  const path = usePathname();

  const toggleOpen = () => {
    const newState = open ? false : true;
    setOpen(newState);
  }

  if (!items?.length) {
    return null
  }

  return (
    <div className={`hidden ${open ? "w-[225px]" : "w-20"} h-screen flex-col bg-[#F5F5F5] text-dark duration-300 md:flex`}>
      <Icons.chevronLeft onClick={toggleOpen} className={` ${!open ? 'rotate-180' : ''} border-dark-purple absolute -right-3 top-9 w-7 cursor-pointer rounded-full border-2 bg-[#F5F5F5]`}></Icons.chevronLeft>
      <div className="group flex items-center p-4 pb-7">
        <a
          className="hidden items-center space-x-2 md:flex"
          href="https://app.donorsync.org"
        >
          <Image width={24} height={24} src="/icon.png" alt="" />
          <span className={`${open ? 'sm:inline-block' : 'hidden'} font-bold duration-200 `}>DonorSync</span>
        </a>
      </div>

      <nav className="mt-7 grid items-start gap-2">
        {items.map((item, index) => {
          const Icon = Icons[item.icon || 'arrowRight']
          return (
            item.href && (
              <Link key={index} href={item.disabled ? '/' : item.href}>
                <span
                  className={cn(
                    'group mr-8 flex items-center rounded-r-md py-2 pl-7 text-sm font-medium hover:bg-accent-1',
                    path === item.href ? 'bg-accent-1' : 'transparent',
                    item.disabled && 'cursor-not-allowed opacity-80'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span className={`${open ? '' : 'hidden'} `}>{item.title}</span>
                </span>
              </Link>
            )
          )
        })}
      </nav>
      <nav className="mb-7 mt-auto grid gap-2">
        <Link href="/dashboard/support">
          <span
            className={cn(
              'group mr-8 flex items-center rounded-r-md py-2 pl-7 text-sm font-medium hover:bg-accent-1',
              path === '/dashboard/support' ? 'bg-accent-1' : 'transparent'
            )}
          >
            <Icons.help className="mr-2 h-4 w-4" />
            <span className={`${open ? '' : 'hidden'} `}>Support</span>
          </span>
        </Link>
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault()
            signOut({
              callbackUrl: `${window.location.origin}/login?from=${path}`,
            })
          }}
        >
          <span className="group mr-8 flex items-center rounded-r-md py-2 pl-7 text-sm font-medium hover:bg-accent-1">
            <Icons.logOut className="mr-2 h-4 w-4" />
            <span className={`${open ? '' : 'hidden'} `}>Log Out</span>
          </span>
        </a>
      </nav>
    </div >
  )
}
