import { AutosaveSwitch } from '@/components/autosave-switch'
import { RESettingsForm } from '@/components/dashboard/re-settings'
import { UniversalSelect } from '@/components/dashboard/universal-select'
import { DashboardHeader } from '@/components/header'
import { DashboardShell } from '@/components/shell'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'
import { cache } from 'react'

const { AuthorizationCode } = require('simple-oauth2')

const feSettingsForUser = cache(async (teamId) => {
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
const getApiKey = cache(async (teamId) => {
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
  title: 'Settings',
  description: 'Manage account and website settings.',
}

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user || user === undefined) {
    redirect(authOptions?.pages?.signIn || '/login')
  }
  const apiKey = await getApiKey(user.team.id)
  const feSettings = await feSettingsForUser(user.team.id)
  let feAccounts: any = []
  if (!feSettings) {
    feAccounts = []
  } else {
    feAccounts = await getFeAccountsFromBlackbaud(user.team.id)
  }
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="rounded-lg border bg-whiteSmoke p-6 text-dark shadow-sm">
        <div className="flex flex-col space-y-1.5">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            General Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Use the Setup Wizard to reconfigure defaults
          </p>
        </div>
        <div className="my-6">
          <AutosaveSwitch
            label="Automatic Sync"
            initialValue={user.team.automation}
            fieldName="automation"
            route="/api/teamSettings"
          />
        </div>

        <div className="mt-6">
          <a
            href="/step1"
            className="hover:bg-cyan-1/90 inline-flex h-10 items-center justify-center rounded-md bg-accent-1 px-4 py-2 text-sm font-medium text-dark ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Setup Wizard
          </a>
        </div>

        {feSettings ? (
          <div className="flex ">
            <div>
              <div className="mr-4 flex flex-col space-y-2 text-left ">
                <span className="text-accent-1">Default Journal</span> Select
                your default journal from Financial Edge.
                <div className="justify-left text-md mr-4 justify-center p-2 text-center text-white">
                  <UniversalSelect
                    title="Save"
                    route="/api/reJournals"
                    method="GET"
                    fields={['journal_code_id', 'code', 'journal']}
                    selected={user?.defaultJournal}
                    redirect="/dashboard/settings"
                  />
                </div>
              </div>

              <div className="mr-4 flex flex-col space-y-2 text-left ">
                <span className="text-accent-1">Default Debit Account</span>{' '}
                Select your default debit account from Financial Edge.
                <div className="justify-left  mr-4 flex flex-col justify-center space-y-2 p-2 text-center text-white">
                  <UniversalSelect
                    title="Save"
                    route="/api/feAccounts"
                    method="GET"
                    subType="debit"
                    fields={[
                      'account_id',
                      'account_number',
                      'description',
                      'class',
                    ]}
                    selected={user?.defaultDebitAccount}
                    redirect="/dashboard/settings"
                    initialData={feAccounts}
                  />
                </div>
              </div>
              <div className="mr-4 flex flex-col space-y-2 text-left ">
                <span className="text-accent-1">Default Credit Account</span>{' '}
                Select your default credit account from Financial Edge.
                <div className="justify-left  mr-4 justify-center p-2 text-center text-white ">
                  <UniversalSelect
                    title="Save"
                    route="/api/feAccounts"
                    method="GET"
                    fields={[
                      'account_id',
                      'account_number',
                      'description',
                      'class',
                    ]}
                    subType="credit"
                    selected={user?.defaultCreditAccount}
                    redirect="/dashboard/settings"
                    initialData={feAccounts}
                  />
                </div>
              </div>
            </div>
            <div></div>
          </div>
        ) : null}
        {/* 
      <div className="grid gap-10">
        <VirtuousSettingsForm
          user={{ id: user.id, name: user?.name }}
          apiKey={apiKey?.virtuousAPI}
        />
      </div> */}
        <div className="grid gap-10">
          {user?.name ? (
            <RESettingsForm
              user={{ id: user.id, name: user.name }}
              reAuthorizeURL={reAuthorizeURL}
              reData={feSettings}
            />
          ) : null}
        </div>
      </div>
    </DashboardShell>
  )
}
