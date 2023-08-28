import { FeFrame } from '@/components/dashboard/fe-frame'
import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import { getCurrentUser } from '@/lib/session'
import { getVirtuousBatches } from '@/lib/virGifts'
import { getVirtuousProjects } from '@/lib/virProjects'
import { getProjectAccountMappings } from '@/lib/virProjects'
import { redirect } from 'next/navigation'
import { getFeEnvironment } from '@/lib/feEnvironment'



export const metadata = {
  title: 'Sync First Batch',
  description: 'See how your sync turned out.',
}


// Get Batches from Latest Gifts for Samples

export default async function ReviewDataPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/signUp')
  }


  const feEnvironmentData = getFeEnvironment(user.team.id)

  const [ feEnvironment ] =
    await Promise.all([

      feEnvironmentData,

    ])
  if (!feEnvironment) {
    redirect('/step2')
  }


  return (
    <>
      <div className="container grid w-screen ">
        {feEnvironment ? (
          <FeFrame

            feEnvironment={feEnvironment.environment_id}

            className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          />
        ) : (
          `getting settings...`
        )}
      </div>
    </>
  )
}
