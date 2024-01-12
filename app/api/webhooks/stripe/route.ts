import { headers } from 'next/headers'
import Stripe from 'stripe'

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

  return new Response(null, { status: 200 })
}
