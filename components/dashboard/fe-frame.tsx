'use client'

import * as React from 'react'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'

import WindowOpenLink from '../ui/window-open-link'

interface ReviewProps extends React.HTMLAttributes<HTMLButtonElement> {
  feEnvironment?: string
}

export function FeFrame({ feEnvironment, className, ...props }: ReviewProps) {
  const router = useRouter()
  function advanceStep() {
    router.push('/step8')
  }
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [openWindow, setOpenWindow] = React.useState<boolean>(false)

  const searchParams = useSearchParams()
  const record_id = searchParams?.get('record_id')
  const envid = searchParams?.get('envid')

  useEffect(() => {
    if (openWindow === false && window) {
      setOpenWindow(true)
      console.log(record_id, ' : ', envid)
      const felink =
        'https://host.nxt.blackbaud.com/journalentry/' +
        record_id +
        '?envid=' +
        envid
      const popup = window?.open(
        felink,
        'newFE',
        'width=1750,height=500, top=25, left=150'
      )
      console.log(felink)
      //chaged from window.focus
      if (document.hasFocus()) {
        popup?.focus()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="align-self-bottom align-items-bottom m-auto flex h-screen w-full flex-col justify-center space-y-6 bg-dark pt-4 text-center">
        <h1 className="font-3xl my-0 py-0 text-3xl  text-white xl:my-4 xl:py-4">
          Review Results
        </h1>
        <div className="m-auto flex flex-col justify-center space-y-3 text-white">
          <WindowOpenLink
            className="pt-4 underline"
            url={`https://host.nxt.blackbaud.com/journalentry/${record_id}?envid=${feEnvironment}`}
            target="financialEdge"
            features="width=1750,height=500, top=25, left=150"
          >
            Click here to open the new Financial Edge batch in a new window.
          </WindowOpenLink>{' '}
          <br />
          After reviewing the results, close the window to return here.
          <button
            onClick={advanceStep}
            className={cn(
              `relative m-8 inline-flex h-9 max-w-md items-center rounded-full border border-transparent bg-accent-1 px-4 py-2 text-sm font-medium text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2`,
              {
                'cursor-not-allowed opacity-60': isLoading,
              }
            )}
            disabled={isLoading}
            {...props}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.arrowRight className="mr-2 h-4 w-4" />
            )}
            Continue
          </button>
        </div>
      </div>{' '}
    </>
  )
}
