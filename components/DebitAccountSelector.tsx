'use client'

import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

import '@/styles/globals.css'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import Combobox from './ui/combobox'

export const giftTypes = [
  'Check',
  'Credit',
  'Cryptocoin',
  'Electronic Funds Transfer',
  'Non-cash',
  'Reversing Transaction',
  'Stock',
  'Qualified Charitable Distribution',
  'Other',
]

export function DebitAccountSelector({
  title,
  redirect,
  align = 'center',
  initialValue,
  initialMapping,
  initialData,
}: {
  title: String
  redirect?: string
  align?: 'left' | 'center'
  initialValue?: string
  initialMapping?: Record<string, number>
  initialData?: Array<any>
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [isSaving, setIsSaving] = React.useState<boolean>(false)
  const [returnedData, setReturnedData] = React.useState(initialData ?? [])
  const [map, setMap] = React.useState(initialMapping ?? {})
  const [enableMapping, setEnableMapping] = React.useState(
    initialMapping && Object.keys(initialMapping).length > 0
  )
  const [selectValue, setSelectValue] = React.useState<string>(
    initialValue ?? ''
  )
  const route = process.env.NEXT_PUBLIC_APP_URL + '/api/feAccounts'
  const fields = ['account_id', 'account_number', 'description', 'class']

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
          const firstAccountId = data[0][fields[0]]?.toString()
          if (!initialValue) {
            setSelectValue(firstAccountId)
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
        selectValue: selectValue,
        map: enableMapping ? map : undefined,
        subType: 'debit',
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

    if (redirect) {
      router.push(redirect)
    }
  }

  const options = returnedData?.map((item: any) => ({
    value: item[fields[0]].toString(),
    label: fields
      .slice(1)
      .map((f) => item[f])
      .join(' '),
  }))

  return (
    <div
      className={`flex flex-col space-y-5 py-5 pt-2 ${
        align === 'center' ? 'items-center' : 'items-start'
      }`}
    >
      <Combobox
        value={selectValue}
        onChange={setSelectValue}
        isLoading={isLoading}
        disabled={isLoading || isSaving}
        options={options}
      />
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="gift-type-mapping"
          checked={enableMapping}
          onChange={() => setEnableMapping(!enableMapping)}
        />
        <label
          htmlFor="gift-type-mapping"
          className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Use a different default debit account for each Virtuous gift type
        </label>
      </div>
      {enableMapping && (
        <div
          className={`flex flex-col gap-3 lg:grid  lg:grid-cols-2 ${
            align === 'center' ? 'items-center' : 'items-start'
          }`}
        >
          {giftTypes.map((giftType) => (
            <div
              className={`flex flex-col ${
                align === 'center' ? 'items-center' : 'items-start'
              }`}
            >
              <p className="mb-1 font-bold">{giftType}</p>
              <Combobox
                value={map[giftType]?.toString()}
                onChange={(val) =>
                  setMap({
                    ...map,
                    [giftType]: parseInt(val),
                  })
                }
                isLoading={isLoading}
                disabled={isLoading || isSaving}
                options={options}
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={saveSelectedData}
        className={cn(
          'font-large relative inline-flex h-9 items-center rounded-full border border-transparent bg-whiteSmoke py-1 px-5 text-lg text-dark hover:bg-cyan focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isLoading || isSaving,
          }
        )}
        disabled={isLoading || isSaving}
      >
        {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        {title}
      </button>
    </div>
  )
}
