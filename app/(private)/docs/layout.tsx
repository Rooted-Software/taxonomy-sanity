import { MainNav } from '@/components/main-nav'

import { DocsSidebarNav } from '@/components/docs/sidebar-nav'
import { getDocsCategoriesWithArticleLinks } from 'lib/sanity.client'
import { SiteFooter } from '@/components/site-footer'
import { UserAccountNav } from '@/components/user-account-nav'
import { dashboardConfig } from '@/config/dashboard'
import { getCurrentUser } from '@/lib/session'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'

interface DocsLayoutProps {
  children: React.ReactNode
}

export default async function DocsLayout({ children }: DocsLayoutProps) {
  let docCategories = await getDocsCategoriesWithArticleLinks()


  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav items={dashboardConfig.mainNav} />
          
        </div>
      </header>
    <div className="container flex-1 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
      <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r border-r-slate-100 py-6 pr-2 md:sticky md:block lg:py-10">
        <DocsSidebarNav items={docCategories} />
      </aside>
      <div className="flex-1">{children}</div>
    </div>
    <SiteFooter className="border-t" />
    </div>
  )
}

