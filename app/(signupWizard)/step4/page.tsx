import { getCurrentUser } from '@/lib/session'
import { UniversalSelect } from '@/components/dashboard/universal-select'

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}

export default async function ConnectFEDebitAccount() {
  const user = await getCurrentUser()
  console.log(user)
  return (
    <>
      <div className="space-y-2 p-8 text-center">
        <p className="justify-left text-lg text-white">
          <span className="font-bold text-accent-1">STEP 4:</span> Select your
          default DEBIT account.
        </p>
        <UniversalSelect
          title="Save and Continue"
          route={process.env.NEXT_PUBLIC_APP_URL + '/api/feAccounts'}
          subType="debit"
          fields={['account_id', 'account_number', 'description', 'class']}
          selected={user?.team?.defaultDebitAccount}
          redirect="/step4b"
        />
      </div>
    </>
  )
}
