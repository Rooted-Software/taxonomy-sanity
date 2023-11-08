import * as React from 'react'

// import { DocsSidebarNav } from '@/components/docs/sidebar-nav'

import { MainNav } from '@/components/main-nav'
import { SiteFooter } from '@/components/site-footer'

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav />
        </div>
      </header>
      <main className="flex-1">
        <div className="mt-4 pt-4">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}
