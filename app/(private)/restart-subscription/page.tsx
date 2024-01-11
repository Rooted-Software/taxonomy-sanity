import { notFound, redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/session'
import { createSubscriptionIfNeeded } from '@/lib/stripe'

export default async function RestartSubscription() {
  const user = await getCurrentUser()
  if (!user) {
    return notFound()
  }

  await createSubscriptionIfNeeded(user, user.team, false)
  redirect('/dashboard')
}
