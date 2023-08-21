import { Icons } from '@/components/icons'
import { ModeToggle } from '@/components/mode-toggle'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import * as React from 'react'

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
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
