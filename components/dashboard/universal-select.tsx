'use client'

import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

import '@/styles/globals.css'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import Combobox from '../ui/combobox'

interface UniversalButtonProps {
  title: String
  route: RequestInfo
  fields: string[]
  redirect?: string
  selected: any
  subType?: string
  initialData?: Array<any>
  align?: 'left' | 'center'
}

export function UniversalSelect({
  title,
  route,
  fields,
  selected,
  subType,
  redirect,
  initialData,
  align = 'center',
  ...props
}: UniversalButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  const [returnedData, setReturnedData] = React.useState(initialData)
  const [selectValue, setSelectValue] = React.useState(
    selected ?? initialData?.[0][fields[0]]?.toString()
  )

  React.useEffect(() => {
    ;(async () => {
      try {
        const response = await fetch(route, {
          method: 'GET',
        })

        if (!response?.ok) {
          if (response.status === 429) {
            const data = await response.json()
            return toast({
              title: 'API rate limit exceeded',
              description: data.message,
              variant: 'destructive',
            })
          }

          return toast({
            title: 'Something went wrong.',
            description: 'Could not fetch data. Please try again.',
            variant: 'destructive',
          })
        }

        const data = await response.json()
        if (data?.length > 0) {
          setReturnedData(data)

          if (selected === undefined || selected === null || selected === '') {
            setSelectValue(data[0][fields[0]]?.toString())
          }
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  async function saveSelectedData() {
    if (isSaving) {
      return
    }
    setIsSaving(true)

    const response = await fetch(route, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: route,
        selectValue: selectValue.toString(),
        subType: subType,
      }),
    })

    setIsSaving(false)

    if (!response?.ok) {
      if (response.status === 429) {
        const data = await response.json()
        return toast({
          title: 'API rate limit exceeded',
          description: data.message,
          variant: 'destructive',
        })
      }
      return toast({
        title: 'Something went wrong.',
        description: 'Your selection was not saved. Please try again.',
        variant: 'destructive',
      })
    }

    if (redirect) router.push(redirect)
  }

  return (
    <div
      className={`min-w-xl flex flex-col space-y-5 py-5 pt-2 ${
        align === 'center' ? 'items-center' : 'items-start'
      }`}
    >
      <Combobox
        value={selectValue}
        onChange={setSelectValue}
        isLoading={isLoading}
        disabled={isLoading || isSaving}
        options={returnedData?.map((item: any) => ({
          value: item[fields[0]].toString(),
          label: fields
            .slice(1)
            .map((f) => item[f])
            .join(' '),
        }))}
      />

      <button
        onClick={saveSelectedData}
        className={cn(
          'font-large relative inline-flex h-9 items-center rounded-full border border-transparent bg-whiteSmoke py-1 px-5 text-lg text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isLoading || isSaving,
          }
        )}
        disabled={isLoading || isSaving}
        {...props}
      >
        {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        {title}
      </button>
    </div>
  )
}
