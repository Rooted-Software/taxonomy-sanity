import { DebitAccountSelector } from '@/components/DebitAccountSelector'

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}

export default async function ConnectFEDebitAccount() {
  return (
    <div className="my-auto space-y-2 p-8 text-center">
      <p className="text-lg text-white">
        <span className="font-bold text-accent-1">STEP 4:</span> Select your
        default DEBIT account.
      </p>
      <DebitAccountSelector title="Save and Continue" redirect="/step4b" />
    </div>
  )
}
