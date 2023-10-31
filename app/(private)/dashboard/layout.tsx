import { MainNav } from '@/components/main-nav'
import { DashboardNav } from '@/components/nav'
import { SiteFooter } from '@/components/site-footer'
import { UserAccountNav } from '@/components/user-account-nav'
import { dashboardConfig } from '@/config/dashboard'
import { getCurrentUser } from '@/lib/session'
import { notFound } from 'next/navigation'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    return notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background md:hidden">
        <div className="flex h-16 items-center justify-between p-4">
          <MainNav items={dashboardConfig.navigation} />
        </div>
      </header>
      <div className="grid flex-1 md:grid-cols-[225px_1fr]">
        <aside className="hidden w-[225px] flex-col bg-[#F5F5F5] text-dark md:flex">
          <DashboardNav items={dashboardConfig.navigation} />
        </aside>
        <main className="flex flex-1 flex-col bg-background px-4 py-6 md:px-10">
          {children}
        </main>
      </div>
      <SiteFooter className="border-t" />
    </div>
  )
}
