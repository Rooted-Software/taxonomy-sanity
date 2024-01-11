'use client'

import * as React from 'react'
import { CalendarIcon, CircleBackslashIcon } from '@radix-ui/react-icons'
import { addDays, format } from 'date-fns'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SetDateProps {
  setDateFunction: Function
  initialDate?: string
  endDate?: string
  className?: string
  allowUnset?: boolean
}

export function DatePickerWithRange({
  className,
  setDateFunction,
  initialDate,
  endDate,
  allowUnset,
}: SetDateProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialDate
      ? new Date(initialDate ?? addDays(new Date(), -30))
      : undefined,
    to: endDate ? new Date(endDate ?? '') : undefined,
  })

  React.useEffect(() => {
    if (date) {
      setDateFunction(
        date?.from !== undefined
          ? date.from?.toLocaleString('en-us', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : undefined,
        date?.to !== undefined
          ? date.to?.toLocaleString('en-us', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : undefined
      )
    } else {
      setDateFunction(undefined, undefined)
    }
  }, [date])

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded bg-white px-2 py-1',
        className
      )}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button
            id="date"
            className="flex flex-1 items-center justify-start text-sm text-black"
          >
            <CalendarIcon className="mr-2" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </button>
        </PopoverTrigger>
        {date && allowUnset ? (
          <div
            className="cursor-pointer text-xs text-black"
            onClick={() => setDate(undefined)}
          >
            <CircleBackslashIcon />
          </div>
        ) : null}
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
