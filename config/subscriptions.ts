import { SubscriptionPlan } from 'types'

export const freePlan: SubscriptionPlan = {
  name: 'Free/Beta',
  description:
    'The free plan is limited to manual syncs.  The free plan is only available during the beta period.',
  stripePriceId: '',
}

export const proPlan: SubscriptionPlan = {
  name: 'PRO',
  description:
    'The PRO plan will have advanced automation and syncing features.',
  stripePriceId: process.env.STRIPE_PRO_MONTHLY_PLAN_ID || '',
}
