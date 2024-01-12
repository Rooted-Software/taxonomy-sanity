import { redirect } from 'next/navigation'

export default function IndexRoute() {
  redirect('/dashboard')
}

// FIXME: remove the `revalidate` export below once you've followed the instructions in `/pages/api/revalidate.ts`
// this revalidate function is not working
export const revalidate = 180
