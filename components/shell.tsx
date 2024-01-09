import * as React from 'react'

import { cn } from '@/lib/utils'

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div
      className={cn('flex h-full w-full flex-col gap-8', className)}
      {...props}
    >
      {children}
    </div>
  )
}
