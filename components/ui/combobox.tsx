import React from 'react'
import { ChevronsUpDown } from 'lucide-react'

import { Button } from './button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export default function Combobox({
  options,
  value,
  onChange,
  isLoading,
  disabled,
}: {
  options?: { label: string; value: string }[]
  value?: string
  onChange: (val: string) => void
  isLoading?: boolean
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const selectLabel = React.useMemo(() => {
    if (isLoading) {
      return 'Loading...'
    }

    const item = value
      ? options?.find((item) => item.value === value)
      : undefined

    return item ? item.label : 'Not Set'
  }, [value, options, isLoading])

  return (
    <Popover open={open && !!options?.length} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="text-md h-10 max-w-[300px] whitespace-nowrap rounded-full border border-accent-1 bg-accent-1 py-2 px-5 text-left text-dark focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:max-w-[450px] md:max-w-full"
        >
          <div className="truncate">{selectLabel}</div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command className="h-full">
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup className="popover-list text-ellipsis">
            {options?.map(({ label, value }) => (
              <CommandItem
                key={value}
                value={label}
                onSelect={() => {
                  onChange(value)
                  setOpen(false)
                }}
              >
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
