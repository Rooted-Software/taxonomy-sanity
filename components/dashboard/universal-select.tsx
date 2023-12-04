'use client'

import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

import '@/styles/globals.css'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronsUpDown } from 'lucide-react'

import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

interface UniversalButtonProps {
  title: String
  route: RequestInfo
  fields: string[]
  redirect: string
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
  const [open, setOpen] = React.useState(false)

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

  const selectLabel = React.useMemo(() => {
    if (isLoading) {
      return 'Loading...'
    }

    const item = selectValue
      ? returnedData?.find(
          (item) => item[fields[0]].toString() === selectValue.toString()
        )
      : undefined

    return item
      ? fields
          .map((f) => item[f])
          .slice(1)
          .join(' ')
      : 'Not Set'
  }, [selectValue, returnedData, fields, isLoading])

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

    router.push(redirect)
  }

  return (
    <div
      className={`min-w-xl flex flex-col space-y-5 py-5 pt-2 ${
        align === 'center' ? 'items-center' : 'items-start'
      }`}
    >
      <Popover open={open && !!returnedData?.length} onOpenChange={setOpen}>
        <PopoverTrigger>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isLoading || isSaving}
            className="text-md h-10 w-full rounded-full border border-accent-1 bg-accent-1 py-2 px-5 text-left text-dark focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          >
            {selectLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command className="h-full">
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No results</CommandEmpty>
            <CommandGroup className="popover-list">
              {returnedData?.map((item: any) => (
                <CommandItem
                  key={item[fields[0]]}
                  value={item[fields[0]]}
                  onSelect={() => {
                    setSelectValue(item[fields[0]])
                    setOpen(false)
                  }}
                >
                  {fields
                    .slice(1)
                    .map((f) => item[f])
                    .join(' ')}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

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
