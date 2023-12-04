import { headers } from 'next/headers'
import Stripe from 'stripe'

import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error) {
    console.error(error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    await db.team.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
      },
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await db.team.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripeSubscriptionId: null,
        stripePriceId: null,
      },
    })
  }

  return new Response(null, { status: 200 })
}
