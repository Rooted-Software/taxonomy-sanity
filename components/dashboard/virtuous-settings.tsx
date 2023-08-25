'use client'

import { Icons } from '@/components/icons'
import { Card, CardHeader, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { apiKeySchema } from '@/lib/validations/apiKey'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ApiCallButton } from '@/components/dashboard/api-call-button'

interface VirtuousSettingsFormProps
  extends React.HTMLAttributes<HTMLFormElement> {
  teamName?: string
  apiKey?: string
}

type FormData = z.infer<typeof apiKeySchema>

export function VirtuousSettingsForm({
  apiKey,
  className,
  teamName,
  ...props
}: VirtuousSettingsFormProps) {
  const router = useRouter()
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: apiKey,
    },
  })
  const [tested, setTested] = React.useState<boolean>(false)
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  const [label, setLabel] = React.useState<string>('Save')
  const [updatedTeamName, setUpdatedTeamName] = React.useState(teamName || '')
  const [formApiKey, setFormApiKey] = React.useState(apiKey)
  const responseCallback = (teamN)=> {
    console.log('New team Name')
    console.log(teamN) 
    setUpdatedTeamName(teamN)
    setTested(true)
    setLabel('Success: Click to Continue')

  }
  async function onSubmit(data: FormData) {
    setIsSaving(true)
    console.log(data)
    const response = await fetch(`/api/virSettings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: formApiKey,
        teamName: updatedTeamName || teamName,
      }),
    })

    setIsSaving(false)

    if (!response?.ok) {
      console.log(response)
      return toast({
        title: 'Something went wrong.',
        description: 'Your APIKey was not updated. Please try again.',
        variant: 'destructive',
      })
    }

    toast({
      description: 'Your apiKey has been updated.',
      type: 'success',
    })

    router.push('/step2')
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Virtuous API Key</CardTitle>
          <CardDescription>
            Please enter your virtuous Api Key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1">
            <label className="sr-only" htmlFor="name">
              Virtuous API Key
            </label>
            <input
              id="apiKey"
              onChange={(e)=>setFormApiKey( e.target.value || '')}
              className="mx-auto my-0 mb-2 block h-9 w-[350px] rounded-full border border-slate-300 py-2 px-3 text-sm text-slate-600 placeholder:text-slate-400 hover:border-slate-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
              value={apiKey}
            />
            {errors?.apiKey && (
              <p className="px-1 text-xs text-red-600">
                {errors.apiKey.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className='w-100 grid-1 grid items-center text-center'>
          {tested ? <><div className='pb-4'>Organization name: {updatedTeamName}</div><button
            type="submit"
            
            className={cn(
              'hover:bg-relative mx-auto inline-flex h-9 w-1/2 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
              {
                'cursor-not-allowed opacity-60': isSaving,
              },
              className
            )}
            disabled={isSaving}
          >
            {isSaving ?  (
              <Icons.spinner className="display-inline float-lef mr-2 h-4 w-4 animate-spin" />
            ) : 
            <Icons.chevronRight className=" mr-2 h-4 w-4" /> }{label}
          </button><p onClick={() =>setTested(false) } className="mt-4 cursor-default px-8 text-center text-sm text-muted-foreground">re-test api key</p></> : <><ApiCallButton apiKey={formApiKey || ''} responseCallback={responseCallback} />
         </>
          }
        </CardFooter>
      </Card>
    </form>
  )
}
