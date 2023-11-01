'use client'

import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface ReGetAccountsButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

export function ReGetAccountsButton({
  className,
  ...props
}: ReGetAccountsButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [accounts, setAccounts] = React.useState([])
  async function onClick() {
    setIsLoading(true)
    setAccounts(null)
    const response = await fetch('/api/reAccounts', {
      method: 'GET',
    })

    setIsLoading(false)
    console.log(response)
    if (!response?.ok) {
      if (response.status === 429) {
        console.log(response)
        const data = await response.json()
        console.log(data)
        return toast({
          title: 'API rate limit exceeded',
          description: data.message,
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not created. Please try again.',
        variant: 'destructive',
      })
    }

    const data = await response.json()
    console.log(data)
    if (data?.value?.length > 0) {
      setAccounts(data.value)
    }
    // This forces a cache invalidation.
    router.refresh()
  }

  return (
    <div>
      <button
        onClick={onClick}
        className={cn(
          'relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isLoading,
          },
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.add className="mr-2 h-4 w-4" />
        )}
        Get RE Accounts
      </button>
      {accounts && accounts.length > 0 ? (
        <div>
          {accounts?.map((account: any, index) => (
            <div key={index} className="mt-2">
              {account.description} : {account.value}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
