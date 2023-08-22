import { BatchPreview } from '@/components/dashboard/batch-preview'
import { MappingCreateButton } from '@/components/dashboard/mapping-create-button'
import { VirtuousSyncButton } from '@/components/dashboard/virtuous-sync-button'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { MainNav } from '@/components/main-nav'
import { DashboardNav } from '@/components/nav'
import { SiteFooter } from '@/components/site-footer'
import { Stepper } from '@/components/stepper'
import { UserAccountNav } from '@/components/user-account-nav'
import { dashboardConfig } from '@/config/dashboard'
import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import { getCurrentUser } from '@/lib/session'
import { getVirtuousBatches } from '@/lib/virGifts'
import { getVirtuousProjects } from '@/lib/virProjects'
import { getProjectAccountMappings } from '@/lib/virProjects'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

const getFeEnvironment = async (user) => {
  return await db.feSetting.findFirst({
    select: {
      id: true,
      environment_id: true,
    },
    where: {
      teamId: user.team.id,
    },
  })
}

export const metadata = {
  title: 'Review your data',
  description: 'Double Check Your Mapping Before Syncing.',
}

// get FE journal name based on user's default journal
const getFeJournalName = async (journalId, teamId) => {
  return await db.feJournal.findFirst({
    select: {
      journal: true,
      id: true,
    },
    where: {
      teamId: teamId,
      id: parseInt(journalId),
    },
  })
}

// Get Batches from Latest Gifts for Samples

export default async function ReveiwDataPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const feAccountsData = getFeAccountsFromBlackbaud(user)
  const projectsData = getVirtuousProjects(user)
  const mappingData = getProjectAccountMappings(user)
  const batchData = getVirtuousBatches(user)
  const feEnvironmentData = getFeEnvironment(user)
  const feGetJournalName = getFeJournalName(
    user?.team.defaultJournal,
    user.team.id
  )
  const [projects, feAccounts, mappings, batches, feEnvironment, journalName] =
    await Promise.all([
      projectsData,
      feAccountsData,
      mappingData,
      batchData,
      feEnvironmentData,
      feGetJournalName,
    ])

  if (!feEnvironment) {
    redirect('/step2')
  }
  if (!journalName) {
    redirect('/step3')
  }
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav items={dashboardConfig.mainNav} />
          <UserAccountNav
            user={{
              name: user.name,
              image: user.image,
              email: user.email,
            }}
          />
        </div>
      </header>
      <div className="container grid w-screen  grid-cols-3  flex-col items-center bg-dark  lg:max-w-none lg:grid-cols-3 lg:px-0">
        {batches && feAccounts && mappings && projects ? (
          <BatchPreview
            batches={batches}
            projects={projects}
            feAccounts={feAccounts}
            mappings={mappings}
            defaultCreditAccount={user?.team.defaultCreditAccount}
            defaultDebitAccount={user?.team.defaultDebitAccount}
            defaultJournal={user?.team.defaultJournal}
            feEnvironment={feEnvironment.environment_id}
            journalName={journalName.journal}
            className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          />
        ) : (
          `getting projects and accounts...`
        )}
      </div>
    </>
  )
}
