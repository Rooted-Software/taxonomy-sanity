import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { getCurrentUser } from '@/lib/session'
import { DashboardHeader } from '@/components/dashboard/header'
import { UniversalButton } from '@/components/dashboard/universal-button'
import { DashboardShell } from '@/components/shell'

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
