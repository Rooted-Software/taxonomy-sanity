// import { DocsSidebarNav } from '@/components/docs/sidebar-nav'
import { Icons } from '@/components/icons'
import { MainNav } from '@/components/main-nav'
import { DocsSearch } from '@/components/search'
import { SiteFooter } from '@/components/site-footer'
import { docsConfig } from '@/config/docs'
import { siteConfig } from '@/config/site'
import Link from 'next/link'

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
        <div className="mt-4 pt-4">
          <div className="container mt-4 grid grid-cols-1 gap-4 pt-4 lg:grid-cols-2">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
