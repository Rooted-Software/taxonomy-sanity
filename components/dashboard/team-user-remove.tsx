'use client'

/// this should become a button that is "use client" and can handle the pop up of a modal on click
import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface UserRemoveButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  user: User
}

export function TeamUserRemove({
  className,
  user,
  ...props
}: UserRemoveButtonProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  const [projects, setProjects] = React.useState([])
  async function onClick() {
    (true)
    console.log("clicked!!", user)
    setIsSaving(true)

    const response = await fetch(`/api/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    setIsSaving(false)

    if (!response?.ok) {
      return toast({
        title: 'Something went wrong.',
        description: 'User was not removed. Please try again.',
        variant: 'destructive',
      })
    }
    toast({
      description: `${user.email} removed.`,
      type: 'success',
    })
    router.refresh()
  }

  // const data = await response.json()
  // console.log(data)
  // if (data?.value?.length > 0) {
  //   setProjects(data.value)
  // }
  // This forces a cache invalidation.
  // router.refresh()


  return (
    <div>
      <button
        onClick={onClick}
        className={cn(
          'relative inline-flex h-7 items-center rounded-md border border-transparent bg-brand-500 p-4 text-sm font-sm text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isSaving,
          },
          className
        )}
        disabled={isSaving}
        {...props}
      >
        {isSaving ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Remove
      </button>

    </div>
  )
};
