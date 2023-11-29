import Link from 'next/link'

import { getCurrentUser } from '@/lib/session'
import { AutosaveSwitch } from '@/components/autosave-switch'

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
    <div className="flex flex-col items-center gap-6 p-8">
      <h1 className="text-center text-3xl font-bold">
        Congratulations, your configuration is complete!
      </h1>

      <div className="max-width:400 m-10 text-left">
        <p>
          If you are ready to have your data automatically synced, you can turn
          on the switch below.
        </p>
        <p>
          If you would like to manually sync your data, you can do so from the
          Batch Management dashboard.
        </p>
        <p>You can find the Automatic Sync Switch on the Settings menu.</p>
        <div className="mt-5 flex justify-center">
          <AutosaveSwitch
            label="Automatic Sync"
            initialValue={user.team.automation}
            fieldName="automation"
            route="/api/teamSettings"
          />
        </div>
      </div>
      <Link
        className="font-large  mx-auto inline-flex h-10 rounded-full border border-transparent bg-accent-1  px-5 pb-2  pt-1 text-lg text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        href={`dashboard`}
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
