import { ContextualHelp } from '@/components/contextual-help'
import { UniversalSelect } from '@/components/dashboard/universal-select'
import { VirtuousSettingsForm } from '@/components/dashboard/virtuous-settings'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { User } from '@prisma/client'
import { cache } from 'react'

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}

const getApiKey = cache(async (teamId: User['teamId']) => {
  if (!teamId) return null
  return await db.apiSetting.findFirst({
    where: {
      teamId: teamId,
    },
    select: {
      id: true,
      virtuousAPI: true,
      teamId: true,
      team: true,
    },
  })
})

export default async function ConnectVirtuousOrg() {
  const user = await getCurrentUser()
  console.log(user)
  const data = await getApiKey(user?.team.id)
  return (
    <>
      <ContextualHelp articleId="creating-a-virtuous-permissions-groups" />

      <div className="mb-12 text-center">
        <p className="text-lg leading-8 text-white">
          <span className="font-bold text-accent-1">STEP 1:</span> Get API Key
          from Virtuous
        </p>
        <p className="leading-8 text-muted-foreground">
          Access your Virtuous account to create and copy an API key.
        </p>
        <a
          href="https://app.virtuoussoftware.com/Generosity/People/ApiKeys"
          target="_blank"
          className="relative mt-3 inline-flex items-center rounded-full border border-transparent  bg-accent-1 px-4 py-1 text-lg font-medium text-dark hover:bg-accent-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          Get API Key
        </a>
      </div>

      <div className="flex-col items-center justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center ">
          {/* https://app.virtuoussoftware.com/Generosity/People/ApiKeys */}
          <VirtuousSettingsForm
            apiKey={data?.virtuousAPI || ''}
            teamName={data?.team.name || ''}
          />
        </div>
      </div>
    </>
  )
}
