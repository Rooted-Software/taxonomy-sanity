'use client'

import React, { MouseEventHandler } from 'react'

import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { Icons } from './icons'

type DialogProps = {
  isOpen: boolean
  text: string
  confirmMethod: Function
  cancelMethod: MouseEventHandler<HTMLButtonElement>
  noBtnText: string
  yesBtnText: string
}

export function DialogConfirm({ ...props }: DialogProps) {
  const { isOpen, text, noBtnText, yesBtnText, confirmMethod, cancelMethod } =
    props
  const [isSaving, setIsSaving] = React.useState<boolean>(false)

  async function handleConfirm() {
    setIsSaving(true)
    await confirmMethod()
    setIsSaving(false)
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent style={{ maxWidth: 450 }}>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>{text}</AlertDialogDescription>

        <div>
          <Button
            onClick={cancelMethod}
            className={'mr-4 h-10'}
            variant={'secondary'}
            disabled={isSaving}
          >
            {noBtnText}
          </Button>

          <Button
            onClick={handleConfirm}
            variant={'destructive'}
            className={cn({ 'cursor-not-allowed opacity-60': isSaving })}
            disabled={isSaving}
          >
            {isSaving ? (
              <Icons.spinner className="mr-2 h-3 w-4 animate-spin" />
            ) : null}
            {yesBtnText}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
