'use client'

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
import { UserAuthForm } from './user-auth-form'
import { UserVirtuousAuthForm } from './user-virtuous-auth-form'

export default function AuthFormSelector() {
  
    const [selectedMethod, setSelectedMethod] = React.useState<string>('')

  return (
   <div className="mx-auto  items-center">
   {selectedMethod === '' ? <>
   <button className={cn(buttonVariants(), 'mx-4 rounded-full' )} onClick={() => setSelectedMethod('Virtuous')} >
            
              <Icons.virtuous className="mr-2 h-4 w-4" />
        
            Virtuous
          </button>
          <button className={cn(buttonVariants(), 'mx-4 rounded-full' )} onClick={()=>setSelectedMethod('Email')} >
            
            <Icons.email className="mr-2 h-4 w-4" />
      
          Email
        </button>
        </> : <>
        {selectedMethod === 'Virtuous' ? 
          <>
          <UserVirtuousAuthForm csrfToken={''}/>
          <p onClick={()=>setSelectedMethod('Email')} className="mt-4 cursor-default px-8 text-center text-sm text-muted-foreground">sign in with Email instead</p>
          </> : 
        <>
          <UserAuthForm />
          <p onClick={() => setSelectedMethod('Virtuous')} className="mt-4 cursor-default px-8 text-center text-sm text-muted-foreground">sign in with Virtuous instead</p>
          
          </>
            }</>}
   </div>
  )
}
