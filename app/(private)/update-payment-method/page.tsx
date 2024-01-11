import { redirect } from 'next/navigation'
import Stripe from 'stripe'

import { authOptions } from '@/lib/auth'
import { getCurrentUser } from '@/lib/session'
import { stripe } from '@/lib/stripe'

export default async function UpdatePaymentMethodPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || '/login')
  }

  const configurationParams: Stripe.BillingPortal.ConfigurationCreateParams = {
    business_profile: {
      headline: 'DonorSync partners with Stripe for simplified billing',
    },
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ['address', 'email', 'name', 'phone'],
      },
      invoice_history: {
        enabled: false,
      },
      payment_method_update: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: false,
      },
      subscription_pause: {
        enabled: false,
      },
    },
    metadata: {
      type: 'payment-method',
    },
  }

  let configuration: Stripe.BillingPortal.Configuration | undefined = undefined
  configuration = (await stripe.billingPortal.configurations.list()).data.find(
    (c) =>
      c.metadata?.type &&
      c.metadata?.type === configurationParams.metadata?.type
  )
  if (configuration) {
    await stripe.billingPortal.configurations.update(
      configuration.id,
      configurationParams
    )
  } else {
    configuration = await stripe.billingPortal.configurations.create({
      ...configurationParams,
    })
  }

  if (!user.team.stripeCustomerId) {
    // This should never happen
    throw new Error('Missing customer ID')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.team.stripeCustomerId,
    configuration: configuration.id,
    return_url: `${process.env.VERCEL_URL}/restart-subscription`,
  })

  redirect(session.url)
}
