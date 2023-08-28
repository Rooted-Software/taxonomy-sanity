import { BatchPreview } from '@/components/dashboard/batch-preview'
import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import { getCurrentUser } from '@/lib/session'
import { getVirtuousBatches } from '@/lib/virGifts'
import { getVirtuousProjects } from '@/lib/virProjects'
import { getProjectAccountMappings } from '@/lib/virProjects'
import { redirect } from 'next/navigation'
import { getFeEnvironment } from '@/lib/feEnvironment'
import { getFeJournalName } from '@/lib/feEnvironment'

export const metadata = {
  title: 'Review your data',
  description: 'Double Check Your Mapping Before Syncing.',
}


// Get Batches from Latest Gifts for Samples

export default async function ReviewDataPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const feAccountsData = getFeAccountsFromBlackbaud(user.team.id)
  const projectsData = getVirtuousProjects(user.team.id)
  const mappingData = getProjectAccountMappings(user.team.id)
  const batchData = getVirtuousBatches(user.team.id)
  const feEnvironmentData = getFeEnvironment(user.team.id)
  const feGetJournalName = getFeJournalName(
    user?.team?.defaultJournal,
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
