"use client"

import { Icons } from '@/components/icons'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { virtuousAuthSchema } from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { getCsrfToken, signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'


interface UserVirtuousAuthFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  csrfToken?: string
}

type FormData = z.infer<typeof virtuousAuthSchema>

export function UserVirtuousAuthForm({
  csrfToken,
  className,
  ...props
}: UserVirtuousAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(virtuousAuthSchema),
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const searchParams = useSearchParams()

  const [error, setError] = useState(null)

  async function onSubmit(data: FormData) {
    setIsLoading(true)

    const signInResult = await signIn('virtuous', {
      email: data.email.toLowerCase(),
      redirect: false,
      password: data.password,
      callbackUrl: searchParams?.get('from') || '/step1',
    })
    console.log(signInResult)
    setIsLoading(false)

    if (!signInResult?.ok) {
      return toast({
        title: 'Something went wrong.',
        description: 'Your sign in request failed. Please try again.',
        type: 'error',
      })
    }
    console.log(signInResult); 
    window.location.href = signInResult.url || '/dashboard'
    return toast({
      title: 'Success!',
      description: 'You have successfully signed in.',
      variant: 'default',
    })
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="center-items xs:grid-cols-2  grid w-full gap-5 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1"> &nbsp;</div>
          <div className="col-span-2 grid md:col-span-1 ">
            <label className="my-2 text-xs" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              placeholder="name@example.com"
              className="my-0 mb-2 block h-9 w-full rounded-full border border-slate-300 py-2 px-3 text-sm text-black placeholder:text-slate-400 hover:border-slate-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register('email')}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="col-span-2 grid gap-1 md:col-span-1 ">
            <label className="my-2 text-xs" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              placeholder="xyazb1Cfna"
              className="my-0 mb-2 block h-9 w-full rounded-full border border-slate-300 py-2 px-3 text-sm text-slate-500 placeholder:text-slate-500 hover:border-slate-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              {...register('password')}
            />
            {errors?.password && (
              <p className="px-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="w-100 grid md:mt-8 md:pt-4"></div>
          <div className="grid "></div>

          <button
            className="col-span-2 mx-auto inline-flex items-center justify-center justify-self-center rounded-full bg-accent-1 px-5 py-2.5 text-center text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-4 focus:ring-[#24292F]/50 disabled:opacity-50 dark:hover:bg-[#050708]/30 dark:focus:ring-slate-500 md:mt-1 "
            disabled={isLoading}
          >
            {isLoading ?
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            : <Icons.key className="mr-2 h-4 w-4 " />}
            Sign In with Virtuous
          </button>
        </div>
      </form>
    </div>
  )
}

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  }
}
