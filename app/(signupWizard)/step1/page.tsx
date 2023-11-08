import { cache } from 'react'
import { User } from '@prisma/client'

import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { ContextualHelp } from '@/components/contextual-help'
import { VirtuousSettingsForm } from '@/components/dashboard/virtuous-settings'

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
      <div className="flex-col items-center justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center ">
          <p className="justify-left text-lg text-white">
            <span className="font-bold text-accent-1">STEP 1:</span> Paste in
            your Virtuous API Key
          </p>
          <VirtuousSettingsForm
            apiKey={data?.virtuousAPI || ''}
            teamName={data?.team.name || ''}
          />
        </div>
      </div>
    </>
  )
}
