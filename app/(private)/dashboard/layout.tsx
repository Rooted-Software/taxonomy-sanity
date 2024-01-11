import * as React from 'react'
import { notFound } from 'next/navigation'

import { dashboardConfig } from '@/config/dashboard'
import { getCurrentUser } from '@/lib/session'
import { stripe } from '@/lib/stripe'
import SubscriptionBlock from '@/components/dashboard/subscription-block'
import TrialBanner from '@/components/dashboard/trial-banner'
import { MainNav } from '@/components/main-nav'
import { DashboardNav } from '@/components/nav'
import { SiteFooter } from '@/components/site-footer'

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

  if (!user.team.stripeCustomerId) {
    return <SubscriptionBlock />
  }

  const [subscriptions, paymentMethods] = await Promise.all([
    stripe.subscriptions.list({
      customer: user.team.stripeCustomerId,
    }),
    stripe.paymentMethods.list({
      customer: user.team.stripeCustomerId,
    }),
  ])

  if (!subscriptions.data.length) {
    return (
      <SubscriptionBlock needsPaymentMethod={!paymentMethods.data.length} />
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TrialBanner
        subscription={subscriptions.data[0]}
        paymentMethods={paymentMethods.data}
      />
      <header className="sticky top-0 z-40 border-b bg-background md:hidden">
        <div className="flex h-16 items-center justify-between p-4">
          <MainNav items={dashboardConfig.navigation} />
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-0  h-screen ">
          <DashboardNav items={dashboardConfig.navigation} />
        </aside>
        <main className="flex flex-1 flex-col overflow-y-auto bg-background px-4 py-6 md:px-10">
          {children}

          <SiteFooter className="mt-auto border-t" />
        </main>
      </div>
    </div>
  )
}
