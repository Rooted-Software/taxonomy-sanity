'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

interface PostCreateButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

export function ReTestPostButton({
  className,
  ...props
}: PostCreateButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [projects, setProjects] = React.useState([])
  async function onClick() {
    setIsLoading(true)
    setProjects(null)
    const response = await fetch('/api/reJournalEntryBatches', {
      method: 'POST',
    })

    setIsLoading(false)
    console.log(response)
    if (!(response?.status === 200)) {
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
    return toast({
      title: 'Record Entered.',
      description: `Your Record Was Created:  ${data.record_id}`,
      variant: 'destructive',
    })
    // This forces a cache invalidation.
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
        Test RE API Post
      </button>
    </div>
  )
}
