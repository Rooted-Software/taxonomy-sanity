import * as React from 'react'

import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@/components/analytics'
import ErrorHandling from '@/components/ErrorHandling'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { ThemeProvider } from '@/components/theme-provider'

import '@/styles/globals.css'

import { Inter as FontSans } from 'next/font/google'
import localFont from 'next/font/local'

import { getCurrentUser } from '@/lib/session'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

// Font files can be colocated inside of `pages`
const fontHeading = localFont({
  src: '../assets/fonts/CalSans-SemiBold.woff2',
  variable: '--font-heading',
})

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['Virtuous', 'Financial Edge', 'Integration'],
  authors: [
    {
      name: 'Rooted Software',
      url: 'https://rooted.software',
    },
  ],
  creator: 'Rooted Software',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: 'white' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: '@rootedsoftware',
  },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const user = await getCurrentUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          '--font-sans min-h-screen bg-background font-sans antialiased',

          fontHeading.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ErrorHandling user={user} />
          {children}
          <Analytics />
          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  )
}
