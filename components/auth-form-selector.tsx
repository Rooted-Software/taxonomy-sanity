'use client'

import { UserAuthForm } from './user-auth-form'
import { UserVirtuousAuthForm } from './user-virtuous-auth-form'

export default function AuthFormSelector() {
  return (
    <div className="mx-auto items-center">
      <UserVirtuousAuthForm csrfToken={''} />
      <div className="my-7 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-gray-400" />
        <p className="text-gray-400">OR</p>
        <div className="h-[1px] flex-1 bg-gray-400" />
      </div>
      <UserAuthForm />
    </div>
  )
}
