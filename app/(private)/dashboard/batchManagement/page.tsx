import { redirect } from 'next/navigation'

import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
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
import { DashboardHeader } from '@/components/header'
import { DashboardShell } from '@/components/shell'

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
    console.log(projects)
  }

  if (!feEnvironment) {
    redirect('/step2')
  }
  if (!journalName) {
    redirect('/step3')
  }

  return (
    <div className="lg:h-[90vh]">
      <DashboardShell>
        <DashboardHeader heading="Batch Management" />
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
        ) : (
          `getting projects and accounts...`
        )}
      </DashboardShell>
    </div>
  )
}
