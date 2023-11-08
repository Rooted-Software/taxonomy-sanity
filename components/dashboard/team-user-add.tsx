'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { cn } from '@/lib/utils'
import { teamUserSchema } from '@/lib/validations/teamUser'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

interface TeamUserAddProps extends React.HTMLAttributes<HTMLFormElement> {}

type FormData = z.infer<typeof teamUserSchema>

export function TeamUserAdd({ className, ...props }: TeamUserAddProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(teamUserSchema),
  })
  const [isSaving, setIsSaving] = React.useState<boolean>(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)

    const response = await fetch(`/api/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
      }),
    })

    setOpen(false)
    setIsSaving(false)

    if (!response?.ok) {
      let errorMessage =
        (await response.text()) || 'New user was not added.  Please try again'
      return toast({
        title: 'Something went wrong.',
        description: errorMessage,
        variant: 'destructive',
      })
    }
    toast({
      description: `${data.name} has been added to your team.`,
    })
    reset()
    router.refresh()
  }

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button onClick={() => setOpen(true)}>New User</Button>

        <DialogContent>
          <DialogTitle>New User</DialogTitle>
          <DialogDescription>
            Enter the name and email address of the user you want to add to your
            team. New users will be sent an email to activate their account.
          </DialogDescription>

          <form
            className={cn(className)}
            onSubmit={handleSubmit(onSubmit)}
            {...props}
          >
            <Card>
              <CardHeader>
                <CardTitle>Name</CardTitle>
                <CardDescription>
                  Please enter the full name or a display name for this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="email">
                    Name
                  </Label>
                  <Input
                    id="name"
                    className="w-[400px]"
                    size={32}
                    {...register('name')}
                  />
                  {errors?.name && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Email</CardTitle>
                <CardDescription>
                  Please enter an email address for this user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor="email">
                    Email
                  </Label>
                  <Input
                    id="email"
                    className="w-[400px]"
                    size={32}
                    {...register('email')}
                  />
                  {errors?.email && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <button
              type="submit"
              className={cn(buttonVariants(), className)}
              disabled={isSaving}
            >
              {isSaving && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>Save</span>
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
