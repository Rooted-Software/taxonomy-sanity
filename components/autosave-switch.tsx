"use client"

import { toast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Icons } from "./icons"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"

interface AutosaveSwitchProps {
  label: string
  initialValue?: boolean
  route: RequestInfo
  method?: string
  fieldName: string
}

const AutosaveSwitch = (props: AutosaveSwitchProps) => {
  const { initialValue, label, fieldName, method = "POST", route } = props
  const [value, setValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaved, setIsSaved] = useState<boolean>(false)

  async function onChange(newValue: boolean) {
    setValue(newValue)

    if (isLoading) {
      return
    }
    setIsLoading(true)

    const response = await fetch(route, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ [fieldName]: newValue }),
    })

    setIsLoading(false)

    if (!response?.ok) {
      return toast({
        title: "Something went wrong.",
        description: "Setting could not be saved. Please try again.",
        variant: "destructive",
      })
    } else {
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }
  }

  return (
    <div className="flex items-center gap-10">
      <Label>{label}</Label>
      <div className="relative flex items-center gap-4">
        <Switch
          checked={value}
          onCheckedChange={onChange}
          disabled={isLoading}
        />
        <div
          className={`absolute left-[60px] flex gap-1 text-sm ${
            isSaved ? "opacity-100" : "opacity-0"
          } transition-opacity duration-500`}
        >
          <Icons.check /> Saved
        </div>
      </div>
    </div>
  )
}

export { AutosaveSwitch }
