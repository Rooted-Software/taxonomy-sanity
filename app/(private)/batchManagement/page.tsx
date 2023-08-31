import { BatchPreview } from '@/components/dashboard/batch-preview'
import { MappingCreateButton } from '@/components/dashboard/mapping-create-button'
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
import {
  dateFilterOptions,
  getVirtuousBatch,
  getVirtuousBatches,
} from '@/lib/virGifts'
import { getVirtuousProjects } from '@/lib/virProjects'
import { getProjectAccountMappings } from '@/lib/virProjects'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

// TODO: show sync date and view in FE in gift panel
// TODO: add note that any changes since sync date are not carried over

const getFeEnvironment = async (teamId) => {
  return await db.feSetting.findFirst({
    select: {
      id: true,
      environment_id: true,
    },
    where: {
      teamId: teamId,
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

export default async function BatchManagementPage({ searchParams }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const batchDays =
    searchParams.batchDays && !Number.isNaN(searchParams.batchDays)
      ? parseInt(searchParams.batchDays)
      : dateFilterOptions[0]
  const currentDateIndex = dateFilterOptions.indexOf(batchDays)
  const nextBatchDays = dateFilterOptions[currentDateIndex + 1]

  const feAccountsData = getFeAccountsFromBlackbaud(user.team.id)
  const projectsData = getVirtuousProjects(user.team.id)
  const mappingData = getProjectAccountMappings(user.team.id)
  const batchData = getVirtuousBatches(user.team.id, batchDays)
  const selectedBatchData = searchParams.batchId
    ? getVirtuousBatch(user.team.id, searchParams.batchId)
    : Promise.resolve()
  const feEnvironmentData = getFeEnvironment(user.team.id)
  const feGetJournalName = getFeJournalName(
    user?.team.defaultJournal,
    user.team.id
  )
  const [
    projects,
    feAccounts,
    mappings,
    batches,
    feEnvironment,
    journalName,
    selectedBatch,
  ] = await Promise.all([
    projectsData,
    feAccountsData,
    mappingData,
    batchData,
    feEnvironmentData,
    feGetJournalName,
    selectedBatchData,
  ])

  if (!feEnvironment) {
    redirect('/step2')
  }
  if (!journalName) {
    redirect('/step3')
  }
  console.log('selected batch:')
  console.log(selectedBatch)
  selectedBatch?.gifts?.forEach((gift) => {
    gift.giftDesignations ? console.log(gift.giftDesignations) : console.log('no gift designations') 
  })
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
            batchDaysLoaded={batchDays}
            nextBatchDays={nextBatchDays}
            selectedBatch={selectedBatch}
            className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          />
        ) : (
          `getting projects and accounts...`
        )}
      </div>
    </>
  )
}
