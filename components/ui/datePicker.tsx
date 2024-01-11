"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import * as React from "react"

interface SetDateProps {
  setDateFunction: Function
  initialDate?: string
}

export function DatePicker({ setDateFunction, initialDate }: SetDateProps) {
  const [date, setDate] = React.useState<Date>()

  React.useEffect(() => {
    if (date) {
      setDateFunction(
        date?.toLocaleString("en-us", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      )
    }
  }, [date])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "text-small overflow-none m-0 h-8 w-[140px] cursor-pointer justify-start rounded-md border-black  bg-white  p-1 text-left text-black",
            !date && "text-muted-foreground"
          )}
        >
          {date ? (
            format(date, "PPP")
          ) : (
            <span className={"text-black"}>
              {!initialDate
                ? `Pick a date`
                : new Date(initialDate).toLocaleString("en-us", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
