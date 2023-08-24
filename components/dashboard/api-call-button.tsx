'use client'

import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface ButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string
  responseCallback?: Function
  apiKey?: string
}

export function ApiCallButton({ className, apiKey, responseCallback, ...props }: ButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [organizationName, setOrganizationName] = React.useState<string>('')
  const [success, setSuccess] = React.useState<boolean>(false)
  async function onClick() {
    console.log('onClick:' + apiKey)
    setIsLoading(true)
    setOrganizationName('Loading...')
    const response = await fetch(`/api/virSettings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: apiKey,
       
      }),
    })

    setIsLoading(false)

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
    if (data?.organizationName) {
      setOrganizationName(data.organizationName)
      if (typeof(responseCallback) === 'function') {responseCallback(data.organizationName)}
      setSuccess(true)
    }

    // This forces a cache invalidation.
    router.refresh()
  }

  async function ContinueOnClick() {
    setIsLoading(true)
    router.push('/step2')
  }


  return (
    <div className='mx-auto'>
      {!success  ? <><div className='pb-4'>Test your Api Key to verify the organization and continue.</div><button
        onClick={onClick}
        className={cn(
          'hover:bg- relative inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isLoading,
          })}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.test className="mr-2 h-4 w-4" />
        )}
        Test Virtuous API Call
      </button></> : <><div className='pb-4'>Organization name: {organizationName}</div><button
        onClick={ContinueOnClick}
        className={cn(
          'hover:bg- relative  inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isLoading,
          })}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.chevronRight className="mr-2 h-4 w-4" />
        )}
        Success:  Click to Continue
      </button></>
      }
      
    </div>
  )
}
