import { RESetupForm } from '@/components/dashboard/re-setup'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import Image from 'next/image'
import { ContextualHelp } from '@/components/contextual-help'
const { AuthorizationCode } = require('simple-oauth2')

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
  var crypto
  crypto = require('crypto')
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
    <div className="container grid w-screen grid-cols-1 flex-col items-center bg-dark lg:max-w-none lg:grid-cols-2 lg:px-0">

      <div className="h-screen content-center bg-dark text-white lg:p-8 ">
        <div className="flex h-screen w-full flex-col content-center justify-center space-y-6 pl-[20%]">
          <div className="flex flex-col space-y-2 text-left ">
          <ContextualHelp articleId="setting-up-financial-edge" />
            <p className="justify-left text-lg text-white">
              <span className='text-accent-1'>STEP 2:</span>  Now it&apos;s time to connect Financial Edge. Please be sure you if you have a pop up blocker it is disabled.
            </p>
            <p className="justify-left mt-8 pt-8 text-white">
              Clicking &apos;Connect to Financial Edge&apos; will pop up a login window.  Log in with your Financial Edge credentials.  Select which environment you wish to connect to and click &apos;Authorize&apos; and you will be returned to this screen.

            </p>
          </div>
          <RESetupForm
          user={{ id: user.id, name: user.name }}
          reAuthorizeURL={reAuthorizeURL}
          reData={data}
        />
          
        </div>
   
      </div>
      <div className="grid bg-dark text-white lg:p-8">
        <div className="ml-[-100px] flex w-full flex-col justify-center space-y-6 ">
    
          <Image src='/images/dualScreenFE.png' alt='pictures of Financial Edge connect screens' width={1000} height={740} />
  
        </div>
   
      </div>

    </div>
  )
}
