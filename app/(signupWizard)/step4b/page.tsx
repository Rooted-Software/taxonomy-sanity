import { cache } from 'react'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import { getCurrentUser } from '@/lib/session'
import { UniversalSelect } from '@/components/dashboard/universal-select'

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

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}

export default async function ConnectFECreditAccount() {
  const user = await getCurrentUser()

  if (!user || user === undefined) {
    redirect(authOptions?.pages?.signIn || '/login')
  }
  const feSettings = await feSettingsForUser(user.team.id)
  let feAccounts: any = []
  if (!feSettings) {
    feAccounts = []
  } else {
    feAccounts = await getFeAccountsFromBlackbaud(user.team.id)
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-2 p-8 text-center">
      <p className="justify-left text-lg text-white">
        <span className="font-bold text-accent-1">STEP 4b:</span> Select your
        default Credit account. This is where all unmapped transactions will be
        posted.
      </p>
      <UniversalSelect
        title="Save and Continue"
        route={process.env.NEXT_PUBLIC_APP_URL + '/api/feAccounts'}
        fields={['account_id', 'account_number', 'description', 'class']}
        subType="credit"
        initialData={feAccounts}
        selected={user?.team?.defaultCreditAccount}
        redirect="/step5"
      />
    </div>
  )
}
