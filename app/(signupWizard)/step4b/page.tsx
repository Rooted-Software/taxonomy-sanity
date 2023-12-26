import { getCurrentUser } from '@/lib/session'
import { UniversalSelect } from '@/components/dashboard/universal-select'

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}

export default async function ConnectFECreditAccount() {
  const user = await getCurrentUser()
  console.log(user)
  return (
    <div className="flex flex-col px-8 text-center">
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
        selected={user?.team?.defaultCreditAccount}
        redirect="/step5"
      />
    </div>
  )
}
