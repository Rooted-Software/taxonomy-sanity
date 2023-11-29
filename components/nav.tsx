"use client"

import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarNavItem } from "types"

interface DashboardNavProps {
  items: SidebarNavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const path = usePathname()

  if (!items?.length) {
    return null
  }

  return (
    <div className="flex h-full flex-col">
      <div className="group flex items-center p-4 pb-7">
        <a
          className="hidden items-center space-x-2 md:flex"
          href="https://app.donorsync.org"
        >
          <Image width={24} height={24} src="/icon.png" alt="" />
          <span className="hidden font-bold sm:inline-block">DonorSync</span>
        </a>
      </div>

      <nav className="mt-7 grid items-start gap-2">
        {items.map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"]
          return (
            item.href && (
              <Link key={index} href={item.disabled ? "/" : item.href}>
                <span
                  className={cn(
                    "group mr-8 flex items-center rounded-r-md py-2 pl-7 text-sm font-medium hover:bg-accent-1",
                    path === item.href ? "bg-accent-1" : "transparent",
                    item.disabled && "cursor-not-allowed opacity-80"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </span>
              </Link>
            )
          )
        })}
      </nav>
      <nav className="mb-7 mt-auto">
        <Link href="support">
          <span
            className={cn(
              "group mr-8 flex items-center rounded-r-md py-2 pl-7 text-sm font-medium hover:bg-accent-1",
              path === "/support" ? "bg-accent-1" : "transparent"
            )}
          >
            <Icons.help className="mr-2 h-4 w-4" />
            <span>Support</span>
          </span>
        </Link>
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault()
            signOut({
              callbackUrl: `${window.location.origin}/login?from=/dashboard`,
            })
          }}
        >
          <span
            className={cn(
              "group mr-8 flex items-center rounded-r-md py-2 pl-7 text-sm font-medium hover:bg-accent-1",
              path === "/support" ? "bg-accent-1" : "transparent"
            )}
          >
            <Icons.logOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </span>
        </a>
      </nav>
    </div>
  )
}
