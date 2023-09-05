'use client'

import { UserAuthForm } from './user-auth-form'
import { UserVirtuousAuthForm } from './user-virtuous-auth-form'
import { Icons } from '@/components/icons'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { userAuthSchema } from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

export default function AuthFormSelector() {
  let authMethod = ''
  if (typeof window !== 'undefined') {
    localStorage.getItem('authMethod')
  }
  const [selectedMethod, setSelectedMethod] = React.useState<string | null>(authMethod)
  React.useEffect(() => {
    if (selectedMethod && typeof window !== 'undefined') {
      localStorage.setItem('authMethod', selectedMethod)
    }
  }, [selectedMethod])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setSelectedMethod(localStorage.getItem('authMethod'))
    }
  }, [])

  return (
    <div className="mx-auto  items-center">
      {!selectedMethod ? (
        <>
          <button
            className={cn(buttonVariants(), 'mx-4 rounded-full')}
            onClick={() => setSelectedMethod('Virtuous')}
          >
            <Icons.key className="mr-2 h-4 w-4" />
            Virtuous
          </button>
          <button
            className={cn(buttonVariants(), 'mx-4 rounded-full')}
            onClick={() => setSelectedMethod('Email')}
          >
            <Icons.email className="mr-2 h-4 w-4" />
            Email
          </button>
        </>
      ) : (
        <>
          {selectedMethod === 'Virtuous' ? (
            <>
              <UserVirtuousAuthForm csrfToken={''} />
              <p
                onClick={() => setSelectedMethod('Email')}
                className="mt-4 cursor-default px-8 text-center text-sm text-muted-foreground"
              >
                sign in with Email instead
              </p>
            </>
          ) : (
            <>
              <UserAuthForm />
              <p
                onClick={() => setSelectedMethod('Virtuous')}
                className="mt-4 cursor-default px-8 text-center text-sm text-muted-foreground"
              >
                sign in with Virtuous instead
              </p>
            </>
          )}
        </>
      )}
    </div>
  )
}
