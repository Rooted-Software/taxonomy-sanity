import AuthFormSelector from '@/components/auth-form-selector'
import { Icons } from '@/components/icons'
import { buttonVariants } from '@/components/ui/button'
import { UserAuthForm } from '@/components/user-auth-form'
import { UserVirtuousAuthForm } from '@/components/user-virtuous-auth-form'
import { cn } from '@/lib/utils'
import { getCsrfToken } from 'next-auth/react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { useContext } from 'react'

export const metadata = {
  title: 'Create an account',
  description: 'Create an account to get started.',
}

export default function RegisterPage() {
  return (
    <>
      <div className="bg-dark text-white lg:p-8 ">
        <div className="m-auto flex w-full flex-col justify-center space-y-6 ">
          <div className="flex flex-col space-y-2 text-center  ">
            <h1 className="text-3xl font-semibold tracking-tight">
              Let&apos;s get started
            </h1>
            <p className="mb-8 pb-8 text-lg text-white">
              (Don&apos;t worry, if you run into any issues, we are here to
              help.)
            </p>
            <p className="justify-left text-lg text-white">
              <span className="text-accent-1">STEP 1:</span> Log in with your
              Virtuous account or email address to begin the process.
            </p>
          </div>

          <AuthFormSelector />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link
              href="/terms.html"
              className="underline underline-offset-4 hover:text-brand"
              target="_blank"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-brand"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  )
}
