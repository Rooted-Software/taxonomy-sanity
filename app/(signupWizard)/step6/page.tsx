import { BatchPreview } from '@/components/dashboard/batch-preview'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import { getFeEnvironment } from '@/lib/feEnvironment'
import { getFeJournalName } from '@/lib/feEnvironment'
import { getCurrentUser } from '@/lib/session'
import { dateFilterOptions } from '@/lib/utils'
import {
  getRelatedProjects,
  getVirtuousBatch,
  getVirtuousBatches,
} from '@/lib/virGifts'
import { getProjectAccountMappings } from '@/lib/virProjects'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Review your data',
  description: 'Double Check Your Mapping Before Syncing.',
}

// Get Batches from Latest Gifts for Samples

export default async function ReviewDataPage({ searchParams }) {
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
  const mappingData = getProjectAccountMappings(user.team.id)
  const batchData = getVirtuousBatches(user.team.id)
  const selectedBatchData = searchParams.batchId
    ? getVirtuousBatch(user.team.id, searchParams.batchId)
    : Promise.resolve()
  const feEnvironmentData = getFeEnvironment(user.team.id)
  const feGetJournalName = getFeJournalName(
    user?.team?.defaultJournal,
    user.team.id
  )
  const [
    feAccounts,
    mappings,
    batches,
    feEnvironment,
    journalName,
    selectedBatch,
  ] = await Promise.all([
    feAccountsData,
    mappingData,
    batchData,
    feEnvironmentData,
    feGetJournalName,
    selectedBatchData,
  ])

  // Only load needed projects for selected batch
  let projects: any[] = []
  if (selectedBatch) {
    projects = await getRelatedProjects(selectedBatch)
  }

  if (!feEnvironment) {
    redirect('/step2')
  }
  if (!journalName) {
    redirect('/step3')
  }
  return (
    <div className="flex h-full w-full flex-col justify-center">
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
  )
}
