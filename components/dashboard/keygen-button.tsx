'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'

interface PostCreateButtonProps
  extends React.HTMLAttributes<HTMLButtonElement> {}

export function KeygenButton({ className, ...props }: PostCreateButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [keygen, setKeygen] = React.useState('')

  async function onClick() {
    setIsLoading(true)
    setKeygen(null)
    const rawText = 'great job man!'
    const jwk = {
      kty: 'RSA',
      n: 'xdZ9KwnkOrwIRSU3I6mqlUKmC4vXhBl4Sssmp1LVtoFmuwLXoU03ADBmhLarbUp55ACCYJw18mNXYMThV8-AfxqW7OXvYkMqg26WUCpllGRnJh5kbV0a1dURY4W0fLfojL07Hy6wjAMbnCr_BtQ9hnQJ79TaxITlREA6Lg7MJ7hwoITMcA9TDTV4Kd8rzocIhSq5PVolOmVOlM6jz6S3oiNmj2UXxNvM7z40V7ZFJriwAQ_ONDxG7s3xtU40Z3mjbdg_wFCDDy54qmgHejq60o7dgSTiLdpiqzxJpS9-kYJPkwwFOSgJ4rvwvIEpAp5MmnMqiM88vS8fceACP3vCyyFJdYAXzZfQq2cyPycWYJHXmbPtYIQnRlQuZ1Cnh4LQFRP1exHeM5VMqsOqWUjyF9hThU2uh6P6cKf6GdWIREg7QjeGlAjpAL8ywSezCjQfveYmAYG_P1Qph4TuznBGNlwdyV5qSSCV6n9nFkLRzGSDuqDr0oFY_ztbRl3Hyp3p80EXU7PURDQ0ZqPt4_TppKqzh8Oqe9iDLV2UJbyjwhJGEUdZWWGN8QJaSPtKESMKH-_PPbe9NNgPBKGyLTZG4sxQWRMN65lbQbL3ICB_XM4ujrOctU4bAp_IYKZaJGgD3PwIH5BRUln-KXEcogQQGmxVSnMP12J5MZd39wptfOk',
      e: 'AQAB',
    }
    let enc = new TextEncoder()
    const ckey = await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    )
    const encoded = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      ckey,
      enc.encode(rawText)
    )
    console.log(Buffer.from(encoded).toString('base64'))
    setKeygen(Buffer.from(encoded).toString('base64'))
    setIsLoading(false)
  }

  return (
    <div>
      <button
        onClick={onClick}
        className={cn(
          'relative inline-flex h-9 items-center rounded-md border border-transparent bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          {
            'cursor-not-allowed opacity-60': isLoading,
          },
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.add className="mr-2 h-4 w-4" />
        )}
        Keygen
      </button>
      {keygen && <div className="mt-2 text-sm text-gray-500">{keygen}</div>}
    </div>
  )
}
