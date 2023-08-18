import AuthFormSelector from '@/components/auth-form-selector'
import { Icons } from '@/components/icons'
import { MainNav } from '@/components/main-nav'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
}

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="absolute left-4 top-4 md:left-8 md:top-8">
        <MainNav />
      </div>
      <div className="bg-dark text-white lg:p-8 ">
        <div className="m-auto flex w-full flex-col justify-center space-y-6 ">
          <div className="flex flex-col space-y-2 text-center  ">
            <Icons.logo className="mx-auto h-6 w-6" />
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
    </div>
  )
}
