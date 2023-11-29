import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import AuthFormSelector from '@/components/auth-form-selector'
import { MainNav } from '@/components/main-nav'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
     <div className="m-auto flex w-full flex-col justify-center space-y-6 ">
          <div className="flex flex-col space-y-2 text-center  ">
            <Image
              width={50}
              height={50}
              src="/icon.png"
              alt=""
              className="mx-auto"
            />
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          <AuthFormSelector />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/signUp"
              className="underline underline-offset-4 hover:text-accent-1"
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
    </div>
  )
}
