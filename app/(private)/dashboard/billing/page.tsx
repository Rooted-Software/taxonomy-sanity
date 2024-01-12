import { redirect } from 'next/navigation'
import Stripe from 'stripe'

import { authOptions } from '@/lib/auth'
import { getCurrentUser } from '@/lib/session'
import { createSubscriptionIfNeeded, stripe } from '@/lib/stripe'

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || '/login')
  }

  await createSubscriptionIfNeeded(user, user.team)

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
        enabled: true,
      },
      payment_method_update: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: true,
      },
      subscription_pause: {
        enabled: true,
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price'],
        products: (await stripe.products.list()).data.flatMap((product) =>
          product.default_price
            ? [
                {
                  product: product.id,
                  prices: [
                    typeof product.default_price === 'string'
                      ? product.default_price
                      : product.default_price.id,
                  ],
                },
              ]
            : []
        ),
      },
    },
    metadata: {
      type: 'billing',
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
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  redirect(session.url)
}
