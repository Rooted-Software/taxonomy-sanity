'use client'

import { Icons } from './icons'
import { Icon } from '@sanity/icons'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface PaginationButtonsProps {
  paramName: string
  hasMore?: boolean
}

const PaginationButtons = (props: PaginationButtonsProps) => {
  const { paramName, hasMore = true } = props
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const paramValue = searchParams?.get(paramName)
  const currentPage = paramValue ? parseInt(paramValue) : 0
  const hasPrevious = currentPage > 0

  const createHref = (newPage: number) => {
    const params = new URLSearchParams(
      searchParams ? Array.from(searchParams.entries()) : undefined
    )
    params.set(paramName, newPage.toString())
    return `${pathname}?${params.toString()}`
  }

  const linkStyle = 'flex no-wrap gap-1'
  const disabledStyle = 'pointer-events-none opacity-50'
  const activeStyle = 'hover:opacity-80'

  return (
    <div className="flex items-center justify-end gap-6">
      <Link
        href={createHref(currentPage - 1)}
        className={`${linkStyle} ${hasPrevious ? activeStyle : disabledStyle}`}
        scroll={false}
      >
        <Icons.arrowLeft />
        Previous
      </Link>
      <Link
        href={createHref(currentPage + 1)}
        className={`${linkStyle} ${hasMore ? activeStyle : disabledStyle}`}
        scroll={false}
      >
        Next
        <Icons.arrowRight />
      </Link>
    </div>
  )
}

export { PaginationButtons }
