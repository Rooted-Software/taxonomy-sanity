import { getCurrentUser } from '@/lib/session'
import { UniversalSelect } from '@/components/dashboard/universal-select'

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}
  
export default async function ConnectVirtuousOrg() {
    const user = await getCurrentUser()
    console.log(user);
  return (
    <>
      <div className="bg-dark text-white">
        <div className="m-auto flex h-screen w-full max-w-xl flex-col content-center justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center ">
            <p className="justify-left text-lg text-white">
              <span className='text-accent-1'>STEP 1b:</span>  Select your Virtuous Organization for this sync.
            </p>
            <UniversalSelect title="Save and Continue" route="/api/virOrg" method="GET" fields={['organizationUserId', 'organizationName', 'organizationTimeZone']} selected='' redirect='/step2' />
          </div>
        </div>
   
      </div>
  
    </>
  )
}
