import Link from 'next/link'
import { differenceInDays } from 'date-fns'
import Stripe from 'stripe'

export default function TrialBanner({
  subscription,
  paymentMethods,
}: {
  subscription: Stripe.Subscription
  paymentMethods: Stripe.PaymentMethod[]
}) {
  if (subscription.trial_end) {
    const diff = differenceInDays(
      new Date(subscription.trial_end * 1000),
      new Date()
    )
    if (diff > 0) {
      return (
        <div className="flex items-center justify-center bg-amber-500 p-3">
          <p className="text-black">
            You have {diff} days left in your free trial.{' '}
            {paymentMethods.length ? (
              <span>
                You have added a payment method, so you can keep using DonorSync
                after your trial ends.
              </span>
            ) : (
              <span>
                <Link
                  href="/dashboard/billing"
                  className="text-teal-700 hover:underline"
                >
                  Add a payment method
                </Link>{' '}
                before the trial ends to continue using DonorSync.
              </span>
            )}
          </p>
        </div>
      )
    }
  }

  return null
}
