import * as React from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-center gap-4 py-3 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Image width={24} height={24} src="/icon.png" alt="" />
          <p className="text-center text-sm leading-loose md:text-left">
            Built by{' '}
            <a
              href="http://rooted.software"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Rooted Software
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
