import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function absoluteUrl(path: string) {
  return `${process.env.VERCEL_URL}${path}`
}

export const virDateOptions = {
  30: '30 Days Ago',
  60: '60 Days Ago',
  90: '90 Days Ago',
  180: '180 Days Ago',
  270: '270 Days Ago',
  365: 'One Year Ago',
  730: 'Two Years Ago',
}
export const dateFilterOptions = Object.keys(virDateOptions).map((key) =>
  parseInt(key)
)
