import { getCurrentUser } from '@/lib/session'
import { ContextualHelp } from '@/components/contextual-help'
import { UniversalSelect } from '@/components/dashboard/universal-select'

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}

export default async function ConnectVirtuousOrg() {
  const user = await getCurrentUser()
  console.log(user)
  return (
    <>
      <ContextualHelp articleId="creating-a-virtuous-permissions-groups" />
      <div className="m-auto flex h-screen w-full max-w-xl flex-col content-center justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center ">
          <p className="justify-left text-lg text-white">
            <span className="font-bold text-accent-1">STEP 1b:</span> Select
            your Virtuous Organization for this sync.
          </p>
          <UniversalSelect
            title="Save and Continue"
            route={process.env.NEXT_PUBLIC_APP_URL + '/api/virOrg'}
            method="GET"
            fields={[
              'organizationUserId',
              'organizationName',
              'organizationTimeZone',
            ]}
            selected=""
            redirect="/step2"
          />
        </div>
      </div>
    </>
  )
}
