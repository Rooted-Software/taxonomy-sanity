
import { getCurrentUser } from '@/lib/session'

import { getVirtuousProjects } from '@/lib/virProjects'
import { getFeAccounts } from '@/lib/feAccounts'
import { getProjectAccountMappings } from '@/lib/virProjects'
import { getVirtuousBatches} from '@/lib/virGifts'

import { FeFrame} from '@/components/dashboard/fe-frame'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
const getFeEnvironment = async (user) => {
  return await db.feSetting.findFirst({
    select: {
      id: true,
      environment_id: true,
     
    }, 
    where: {
      teamId: user.team.id,
    }
  })
}

  export const metadata = {
    title: 'Sync First Batch',
    description: 'See how your sync turned out.',
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
    redirect('/signUp')
  }
  
    const feAccountsData = getFeAccounts(user)
    const projectsData = getVirtuousProjects(user)
    const mappingData = getProjectAccountMappings(user)
    const batchData = getVirtuousBatches(user)
    const feEnvironmentData = getFeEnvironment(user)
    const feGetJournalName = getFeJournalName(user.team.defaultJournal, user.id)
    const [projects, feAccounts, mappings, batches, feEnvironment, journalName] = await Promise.all([projectsData, feAccountsData, mappingData, batchData, feEnvironmentData, feGetJournalName  ])
    if (!feEnvironment) { 
      redirect('/step2')
    }
    if (!journalName) { 
      redirect('/step3')
    }

  return (<>
    <div className="container grid w-screen ">
    {batches && feAccounts && mappings && projects ? (
           <FeFrame
           batches={batches}
           projects={projects}
           feAccounts={feAccounts}
           mappings={mappings}
           defaultCreditAccount={user.team.defaultCreditAccount}
           defaultDebitAccount={user.team.defaultDebitAccount}
           defaultJournal={user.team.defaultJournal} 
           feEnvironment={feEnvironment.environment_id}
           journalName={journalName.journal}
           className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
         />
        ) : `getting projects and accounts...`}
      
     
    </div>
    </>
  )
}
