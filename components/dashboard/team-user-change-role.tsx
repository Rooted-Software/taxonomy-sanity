'use client'

import { User } from '@prisma/client'
import * as React from 'react'

import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

import { useRouter } from 'next/navigation'
import { DialogConfirm } from '../dialog-confirm'

function roleToSwitchTo(currentRole) {
  if (currentRole == 'admin') {
    return 'user';
  }
  if (currentRole == 'user') {
    return 'admin'
  }
}

interface UserRemoveButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  user: User,
  onClose: Function
}

export function TeamUserChangeRole({
  onClose,
  className,
  user,
  ...props
}: UserRemoveButtonProps) {
  const [isOpen, setOpen] = React.useState<boolean>(false)
  const router = useRouter();
  function cancel() {
    onClose();
    setOpen(false);
  }

  async function confirmMakeAdmin() {
    const response = await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: roleToSwitchTo(user.role)
      }),
    })

    if (!response?.ok) {
      return toast({
        title: 'Something went wrong.',
        description: 'User was not updated. Please try again.',
        variant: 'destructive',
      })
    }
    toast({
      description: `${user.email}'s role successfully updated.`,
    })
    router.refresh();
    onClose();
    setOpen(false);
  }

  return (
    <div>
      <DialogConfirm
        isOpen={isOpen}
        noBtnText="Cancel"
        confirmMethod={confirmMakeAdmin}
        cancelMethod={cancel}
        yesBtnText="Confirm"
        text={`${user.email}'s role will be changed from ${user.role} to ${roleToSwitchTo(user.role)}. `}
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
        Make {roleToSwitchTo(user.role)}
      </button>
    </div>
  )
}
