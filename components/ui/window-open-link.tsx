'use client'

import { PropsWithChildren } from 'react'

export default function WindowOpenLink({
  children,
  url,
  target,
  features,
  className,
}: PropsWithChildren<{
  url: Parameters<typeof window.open>[0]
  target?: Parameters<typeof window.open>[1]
  features?: Parameters<typeof window.open>[2]
  className?: string
}>) {
  return (
    <a
      className={`cursor-pointer ${className}`}
      target=""
      onClick={() => window.open(url, target, features)}
    >
      {children}
    </a>
  )
}
