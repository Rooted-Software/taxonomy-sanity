import { ApiRefreshButton } from '@/components/dashboard/api-refresh-button'
import { DashboardHeader } from '@/components/dashboard/header'
import { UniversalButton } from '@/components/dashboard/universal-button'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { PostItem } from '@/components/post-item'
import { DashboardShell } from '@/components/shell'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import * as React from 'react'

export default async function ReJournalsPage() {
  const user = await getCurrentUser()

  if (!user && authOptions?.pages?.signIn) {
    redirect(authOptions.pages.signIn)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Journals"
        text="Journal Management"
      ></DashboardHeader>
      <div className="">
        Get RE Journals
        <UniversalButton
          title="Get Journals"
          route={process.env.NEXT_PUBLIC_APP_URL + '/api/reJournals'}
          method="GET"
          fields={['journal_code_id', 'code', 'journal']}
        />
      </div>
    </DashboardShell>
  )
}
