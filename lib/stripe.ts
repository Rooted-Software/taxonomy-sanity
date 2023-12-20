import { Team } from '@prisma/client'
import Stripe from 'stripe'

import { db } from './db'
import { getCurrentUser } from './session'

export const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2022-11-15',
  typescript: true,
})

export async function createSubscriptionIfNeeded(
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
  trial = true
) {
  if (!user.email) {
    // This should never happen
    throw new Error('Missing user email')
  }

  let updates: Partial<Team> = {}

  // Create customer if needed
  if (!user.team.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { teamId: user.teamId, userId: user.id },
    })
    updates.stripeCustomerId = customer.id
  }

  // Create subscription if needed
  const customerId = user.team.stripeCustomerId ?? updates.stripeCustomerId
  if (!user.team.stripeSubscriptionId && customerId) {
    const price = (
      await stripe.prices.search({ query: `lookup_key:"monthly"` })
    ).data[0]
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      metadata: { teamId: user.teamId },
      items: [
        {
          price: price.id,
        },
      ],
      trial_period_days: trial ? 14 : undefined,
    })
    updates.stripeSubscriptionId = subscription.id
    updates.stripePriceId = price.id
  }

  if (Object.keys(updates).length > 0) {
    return await db.team.update({
      where: { id: user.teamId },
      data: updates,
    })
  }

  return user.team
}
