import { cache } from 'react'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import { getCurrentUser } from '@/lib/session'
import { DebitAccountSelector } from '@/components/DebitAccountSelector'

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}

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

export default async function ConnectFEDebitAccount() {
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
    <>
      <div class="px-8">
        <p className="text-center text-lg text-white">
          <span className="font-bold text-accent-1">STEP 4:</span> Select your
          default DEBIT account.
        </p>
        <DebitAccountSelector
          title="Save and Continue"
          redirect="/step4b"
          initialValue={user?.team?.defaultDebitAccount}
          initialMapping={user?.team?.defaultDebitAccountForGiftType}
          initialData={feAccounts}
        />
      </div>
    </>
  )
}
