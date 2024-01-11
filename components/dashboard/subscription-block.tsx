'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

import { Button } from '@/components/ui/button'

export default function SubscriptionBlock({
  needsPaymentMethod = false,
}: {
  needsPaymentMethod?: boolean
}) {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center space-y-5">
      <div>
        <p className="text-3xl font-bold">Your subscription was canceled</p>
        <p className="w-full text-center">
          A subscription is required to use DonorSync
        </p>
      </div>
      {loading ? (
        <Image
          className="mx-auto animate-spin"
          src={'/icon.png'}
          alt="loading"
          width={64}
          height={64}
        />
      ) : (
        <>
          {needsPaymentMethod ? (
            <>
              <p>
                Before you can restart your subscription, you will need to add a
                payment method in Stripe
              </p>
              <Link
                href="/update-payment-method"
                onClick={() => setLoading(true)}
              >
                <Button>Add Payment Method & Restart Subscription</Button>
              </Link>
            </>
          ) : (
            <Link href="/restart-subscription" onClick={() => setLoading(true)}>
              <Button>Restart Subscription</Button>
            </Link>
          )}
          <Button
            disabled={loading}
            onClick={(event) => {
              event.preventDefault()
              signOut({
                callbackUrl: `${window.location.origin}/login?from=${pathname}`,
              })
            }}
          >
            Log Out
          </Button>
        </>
      )}
    </div>
  )
}
