import crypto from 'crypto'
import { cache } from 'react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { User } from '@prisma/client'
import { AuthorizationCode } from 'simple-oauth2'

import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { ContextualHelp } from '@/components/contextual-help'
import { RESetupForm } from '@/components/dashboard/re-setup'

const reSettingsForUser = cache(async (teamId: string) => {
  if (!teamId) return null
  return await db.feSetting.findFirst({
    select: {
      id: true,
      environment_name: true,
      legal_entity_id: true,
      email: true,
      expires_in: true,
    },
    where: {
      teamId: teamId,
    },
  })
})

const config = {
  client: {
    id: process.env.AUTH_CLIENT_ID,
    secret: process.env.AUTH_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://app.blackbaud.com/oauth/authorize',
  },
}
const client = new AuthorizationCode(config)
const stateID = crypto.randomBytes(48).toString('hex')
const reAuthorizeURL = client.authorizeURL({
  redirect_uri: process.env.AUTH_REDIRECT_URI,
  state: stateID,
})
console.log('here goes')
console.log(reAuthorizeURL)
const getApiKey = cache(async (teamId: User['teamId']) => {
  if (!teamId) return null
  return await db.apiSetting.findFirst({
    where: {
      teamId: teamId,
    },
    select: {
      id: true,
      virtuousAPI: true,
    },
  })
})

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}

export default async function ConnectFEPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/step1')
  }
  const data = await reSettingsForUser(user?.teamId)
  return (
    <div className="my-auto grid grid-cols-1 lg:grid-cols-2 lg:pl-20">
      <div className="content-center space-y-6 p-8">
        <div className="flex flex-col space-y-2 md:max-w-xl lg:max-w-3xl">
          <ContextualHelp articleId="setting-up-financial-edge" />
          <p className="justify-left text-lg text-white">
            <span className="font-bold text-accent-1">STEP 2:</span> Now
            it&apos;s time to connect Financial Edge. Please be sure you if you
            have a pop up blocker it is disabled.
          </p>
          <p className="justify-left mt-8 pt-8 text-white">
            Clicking &apos;Connect to Financial Edge&apos; will pop up a login
            window. Log in with your Financial Edge credentials. Select which
            environment you wish to connect to and click &apos;Authorize&apos;
            and you will be returned to this screen.
          </p>
        </div>
        <RESetupForm
          user={{ id: user.id, name: user.name }}
          reAuthorizeURL={reAuthorizeURL}
          reData={data}
        />
      </div>
      <div className="flex w-full flex-col justify-center space-y-6 md:max-w-xl">
        <Image
          src="/images/dualScreenFE.png"
          alt="pictures of Financial Edge connect screens"
          width={1000}
          height={740}
        />
      </div>
    </div>
  )
}
