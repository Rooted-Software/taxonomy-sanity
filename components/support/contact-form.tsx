'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { cn } from '@/lib/utils'
import { contactSchema, issueTypes } from '@/lib/validations/contact'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

import { buttonVariants } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Textarea } from '../ui/textarea'

type FormData = z.infer<typeof contactSchema>

export function ContactForm(props: React.HTMLAttributes<HTMLFormElement>) {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {},
  })

  const [isSaving, setIsSaving] = React.useState<boolean>(false)

  async function onSubmit(data: FormData) {
    setIsSaving(true)
    const response = await fetch(`/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    setIsSaving(false)

    if (!response?.ok) {
      console.log(response)
      return toast({
        title: 'Something went wrong.',
        description: 'Could not submit contact form. Please try again.',
        variant: 'destructive',
      })
    }

    toast({
      description: 'Your message has been sent',
      type: 'success',
    })

    reset()
  }

  const selectField = register('issueType')

  return (
    <form onSubmit={handleSubmit(onSubmit)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Your Email</Label>
            <Input
              id="email"
              className="bg-dark-300 text-slate-700"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              {...register('email')}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Issue Type</Label>
            <Select
              onValueChange={(value) =>
                selectField.onChange({
                  target: { name: selectField.name, value },
                })
              }
              {...selectField}
            >
              <SelectTrigger className="w-[180px] bg-white text-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((value) => (
                  <SelectItem value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.issueType && (
              <p className="px-1 text-xs text-red-600">
                {errors.issueType.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              className="bg-dark-300 text-slate-700"
              {...register('message')}
            />
            {errors?.message && (
              <p className="px-1 text-xs text-red-600">
                {errors.message.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="w-100 grid-1 grid items-center text-center">
          <button
            className={cn(buttonVariants(), 'default')}
            disabled={isSaving}
          >
            {isSaving && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </button>
        </CardFooter>
      </Card>
    </form>
  )
}
