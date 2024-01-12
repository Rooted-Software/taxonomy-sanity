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
  triggerClassName = '',
}: {
  options?: { label: string; value: string }[]
  value?: string
  onChange: (val: string) => void
  isLoading?: boolean
  disabled?: boolean
  triggerClassName?: string
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
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          aria-controls="expanded"
          aria-expanded={open}
          disabled={disabled}
          className={`max-w-full whitespace-nowrap rounded-full ${triggerClassName}`}
        >
          <div className="truncate">{selectLabel}</div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent id="expanded" className="p-0" align="start">
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
