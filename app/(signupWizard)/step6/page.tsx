import { redirect } from 'next/navigation'

import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import { getFeEnvironment, getFeJournalName } from '@/lib/feEnvironment'
import { createJournalEntries } from '@/lib/feGiftBatches'
import { getCurrentUser } from '@/lib/session'
import { dateFilterOptions } from '@/lib/utils'
import {
  getRelatedProjects,
  getVirtuousBatch,
  getVirtuousBatches,
} from '@/lib/virGifts'
import { getProjectAccountMappings } from '@/lib/virProjects'
import { BatchPreview } from '@/components/dashboard/batch-preview'

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
  const batchData = getVirtuousBatches(user.team.id, batchDays)
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
    <div className="flex h-full w-full flex-col justify-center p-4">
      <p className="justify-left p-8 pb-0 text-lg text-white">
        <span className="font-bold text-accent-1">STEP 6:</span> Review your
        virtuous gifts and sync your first batch
      </p>
      {batches && feAccounts && mappings && projects ? (
        <div className="h-0 flex-1 px-8 pt-8 lg:pr-0">
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
            journalEntries={
              selectedBatch
                ? await createJournalEntries(
                    selectedBatch.gifts,
                    feAccounts,
                    mappings,
                    user.team
                  )
                : undefined
            }
          />
        </div>
      ) : (
        `getting projects and accounts...`
      )}
    </div>
  )
}
