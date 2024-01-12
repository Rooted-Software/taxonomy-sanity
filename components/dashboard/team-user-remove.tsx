'use client'

import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { DialogConfirm } from '../dialog-confirm'

interface UserRemoveButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  user: User,
  onClose: Function
}

export function TeamUserRemove({
  className,
  onClose,
  user,
  ...props
}: UserRemoveButtonProps) {
  const [isOpen, setOpen] = React.useState<boolean>(false)
  const router = useRouter();
  function cancel() {
    onClose();
    setOpen(false)
  }

  async function confirmRemove() {
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response?.ok) {
      return toast({
        title: 'Something went wrong.',
        description: 'User was not removed. Please try again.',
        variant: 'destructive',
      })
    }
    toast({
      description: `${user.email} removed.`,
    })
    router.refresh();
    onClose();
    setOpen(false)
  }

  return (
    <div>
      <DialogConfirm
        isOpen={isOpen}
        noBtnText="Cancel"
        confirmMethod={confirmRemove}
        cancelMethod={cancel}
        yesBtnText="Confirm"
        text={`${user.email} will no longer have access to DonorSync`}
      />
      <button
        onClick={() => {
          setOpen(true)
        }}
        className={cn(
          'font-sm relative inline-flex h-7 w-full items-center rounded-md border border-transparent bg-brand-500 p-4 text-sm text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          className
        )}
        {...props}
      >
        Remove
      </button>
    </div>
  )
}
