import { notFound, redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/session'
import { createSubscriptionIfNeeded } from '@/lib/stripe'

export default async function RestartSubscription() {
  const user = await getCurrentUser()
  if (!user) {
    return notFound()
  }

  try {
    await createSubscriptionIfNeeded(user, user.team, false)
  } catch (err) {
    // If it fails to create, we should print and then let them go back to subscription block
    console.error(err)
  }
  redirect('/dashboard')
}
