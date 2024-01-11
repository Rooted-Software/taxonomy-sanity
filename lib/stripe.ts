import { Team } from '@prisma/client'
import Stripe from 'stripe'

import { db } from './db'

export const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2022-11-15',
  typescript: true,
})

export async function createSubscriptionIfNeeded(
  user: { email?: string | null; id: string },
  team: Team,
  trial = true
) {
  console.log(
    'Creating stripe subscription if needed for user and team:',
    user,
    team
  )

  if (!user.email) {
    // This should never happen
    throw new Error('Missing user email')
  }

  let updates: Partial<
    Pick<Team, 'stripeCustomerId' | 'stripeSubscriptionId' | 'stripePriceId'>
  > = {}

  // Create customer if needed
  if (!team.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { teamId: team.id, userId: user.id },
    })
    updates.stripeCustomerId = customer.id
    console.log('Created customer:', customer.id)
  }

  // Create subscription if needed
  const customerId = team.stripeCustomerId ?? updates.stripeCustomerId
  if (!team.stripeSubscriptionId && customerId) {
    const price = (
      await stripe.prices.search({ query: `lookup_key:"monthly"` })
    ).data[0]
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      metadata: { teamId: team.id },
      items: [
        {
          price: price.id,
        },
      ],
      trial_period_days: trial ? 30 : undefined,
    })
    updates.stripeSubscriptionId = subscription.id
    updates.stripePriceId = price.id
    console.log('Created subscription:', subscription.id, price.id)
  }

  if (Object.keys(updates).length > 0) {
    console.log('Updating team:', updates)
    return await db.team.update({
      where: { id: team.id },
      data: updates,
    })
  }

  return team
}
