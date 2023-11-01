'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { FeSetting, User } from '@prisma/client'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Icons } from '@/components/icons'

interface REFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, 'id' | 'name'>
  reAuthorizeURL: string
  reData: Pick<
    FeSetting,
    'id' | 'environment_name' | 'legal_entity_id' | 'email' | 'expires_in'
  >
}

export function RESettingsForm({
  user,
  reAuthorizeURL,
  reData,
  className,
  ...props
}: REFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  console.log('in RE FORm')
  console.log(reData)
  const [reDataFromProps, setReDataFromProps] = React.useState(reData)

  React.useEffect(() => {
    setReDataFromProps(reData)
  }, [reData])

  async function onSubmit() {
    setIsSaving(true)

    if (!reData?.id) {
      const popup = window.open(
        reAuthorizeURL,
        'login',
        'height=450,width=600, top=10, left=100'
      )
      if (window.focus) {
        popup.focus()
      }
      /*
      const response = await fetch(`/api/reSettings/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: data.apiKey,
        }),
      })
      */
      setIsSaving(false)
      router.refresh()
    } else {
      const response = await fetch(`/api/reSettings`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: 'delete',
        }),
      })
      console.log('response status: ', response.status)
      console.log(response)
      if (response.ok) {
        setIsSaving(false)
        setReDataFromProps(null)
        router.refresh()
      } else {
        setIsSaving(false)
        router.refresh()
      }
    }
  }

  return (
    <form className={cn(className)} onSubmit={() => onSubmit()} {...props}>
      <Card className="m-0 p-0">
        <CardHeader className="m-0 p-0">
          <CardTitle className="text-md font-normal text-accent-1">
            FE Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="m-0 px-0 pt-0">
          <div className="m-0 grid gap-1 p-0">
            <label className="sr-only" htmlFor="name">
              FE Environment
            </label>
          </div>
          <div className="text-md">{reData?.environment_name}</div>
        </CardContent>
        <CardFooter className="px-0">
          {!reData?.id ? (
            <button
              type="submit"
              className={cn(
                'relative inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                {
                  'cursor-not-allowed opacity-60': isSaving,
                },
                className
              )}
              disabled={isSaving}
            >
              {isSaving && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>Configure</span>
            </button>
          ) : (
            <button
              type="submit"
              className={cn(
                'relative inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                {
                  'cursor-not-allowed opacity-60': isSaving,
                },
                className
              )}
              disabled={isSaving}
            >
              {isSaving && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              <span>Disconnect</span>
            </button>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
