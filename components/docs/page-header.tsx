import * as React from 'react'

import { cn } from '@/lib/utils'

interface DocsPageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  heading: string
  text?: string
}

export function DocsPageHeader({
  heading,
  text,
  className,
  ...props
}: DocsPageHeaderProps) {
  return (
    <>
      <div className={cn('space-y-4', className)} {...props}>
        <h1 className="inline-block text-4xl font-black tracking-tight text-accent-1 lg:text-5xl">
          {heading}
        </h1>
        {text && <p className="text-xl text-slate-200">{text}</p>}
      </div>
      <hr className="my-4 border-slate-200" />
    </>
  )
}
