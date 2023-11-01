'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FeSetting } from '@prisma/client'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'

interface REFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: any
  reAuthorizeURL: string
  reData?: Pick<
    FeSetting,
    'id' | 'environment_name' | 'legal_entity_id' | 'email' | 'expires_in'
  > | null
}

export function RESetupForm({
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

  async function onSubmit(e) {
    setIsSaving(true)

    if (!reDataFromProps?.id) {
      const popup = window.open(
        reAuthorizeURL,
        'login',
        'top=200, left=100, height=750,width=625,'
      )
      //chaged from window.focus
      if (document.hasFocus()) {
        popup?.focus()
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
      e.preventDefault()
      console.log('**** deleting ***')
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
      setReDataFromProps(null)
      reData = null
      setIsSaving(false)
    }
  }

  return (
    <form className={cn(className)} onSubmit={(e) => onSubmit(e)} {...props}>
      {!reDataFromProps?.id ? (
        <button
          type="submit"
          className={cn(
            'relative inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
            {
              'cursor-not-allowed opacity-60': isSaving,
            },
            className
          )}
          disabled={isSaving}
        >
          {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          <span>
            {' '}
            {reDataFromProps?.id
              ? `Re-configure Financial Edge`
              : `Connect to Financial Edge`}
          </span>
        </button>
      ) : (
        <>
          <button
            type="submit"
            className={cn(
              'hover:bg- relative inline-flex h-9 items-center rounded-full border border-transparent bg-whiteSmoke px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
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
            <span>Disconnect/Reconfigure FE</span>
          </button>
          <Link href="/step3">
            <button
              type="submit"
              className={cn(
                'hover:bg- relative ml-6 inline-flex h-9 items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
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
              <span>Continue</span>
            </button>
          </Link>
        </>
      )}
    </form>
  )
}
