import { AutosaveSwitch } from '@/components/autosave-switch'
import { BatchPreview } from '@/components/dashboard/batch-preview'
import { MappingCreateButton } from '@/components/dashboard/mapping-create-button'
import { VirtuousSyncButton } from '@/components/dashboard/virtuous-sync-button'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { Stepper } from '@/components/stepper'
import { getCurrentUser } from '@/lib/session'
import { getVirtuousBatches } from '@/lib/virGifts'
import { getVirtuousProjects } from '@/lib/virProjects'
import { getProjectAccountMappings } from '@/lib/virProjects'
import Link from 'next/link'

export const metadata = {
  title: 'Configuration Complete',
  description: 'Configuration complete.',
}

// Get Batches from Latest Gifts for Samples

export default async function CompletePage() {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }

  return (
    <>
      <div className="container mx-auto grid h-screen  w-screen  grid-cols-1 flex-col  bg-dark  text-center lg:max-w-none lg:grid-cols-1 ">
        <h1 className="mx-auto place-self-center  text-center text-3xl text-white">
          Congratulations, your configuration is complete!
        </h1>
     
        <div className="mx-auto">
        <div className="max-width:400 px m-10 text-left">
        If you are ready to have your data automatically synced, you can turn on the switch below.<br/>  If you would like to manually sync your data, you can do so from the Batch Management dashboard.<br/> You can find the Automatic Sync Switch on the Settings menu. 
        <br/><br/>
          <AutosaveSwitch
            label="Automatic Sync"
            initialValue={user.team.automation}
            fieldName="automation"
            route="/api/teamSettings"
          />
        </div>
        </div>
        <Link
          className="font-large  mx-auto inline-flex h-10 rounded-full border border-transparent bg-accent-1  px-5 pt-1  pb-2 text-lg text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          href={`dashboard`}
        >
          Go to Dashboard
        </Link>
      </div>
    </>
  )
}
