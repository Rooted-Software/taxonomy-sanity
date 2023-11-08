'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

interface UniversalButtonProps {
  title: String
  route: RequestInfo
  method: String
  fields: string[]
  icon: string
  className: string
}

export function UniversalButton({
  title,
  route,
  method,
  fields,
  icon,
  className,
  ...props
}: UniversalButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [returnedData, setReturnedData] = React.useState(Array<{ any }>)
  async function onClick() {
    setIsLoading(true)
    setReturnedData([])
    const response = await fetch(route, {
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
    if (data?.length > 0) {
      setReturnedData(data)
    }
    // This forces a cache invalidation.
    router.refresh()
  }

  return (
    <div className="w-100">
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
          <Icons.spinner className="h-4 w-4 animate-spin" />
        ) : icon && icon === 'refresh' ? (
          <Icons.refresh className="h-4 w-4" />
        ) : (
          <Icons.add className="h-4 w-4" />
        )}
        {title ? <span className="ml-2"> {title} </span> : null}
      </button>
    </div>
  )
}
