'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import { AvatarProps } from '@radix-ui/react-avatar'

import { Icons } from '@/components/icons'

interface ContextualHelpProps extends AvatarProps {
  articleId: string
}

export function ContextualHelp({ articleId, ...props }: ContextualHelpProps) {
  const [showHelp, setShowHelp] = useState<boolean>(false)

  const slug = articleId || ''
  /* load docs from slug */
  if (!slug) {
    notFound()
  }

  return (
    <>
      <div
        className="absolute bottom-5 left-5 h-[100] w-[100] rounded-full bg-cyan p-3 text-2xl text-accent-1 md:left-10 md:top-10 md:bottom-auto"
        onClick={() => setShowHelp(true)}
      >
        <Icons.help className="h-9 w-9 text-lg text-dark" />
      </div>
      {showHelp ? (
        <div className="border-width-1 absolute left-[50px] top-[100px] z-[1000] m-4 h-[60%] w-[580px] overflow-auto rounded-md border border-solid border-white bg-dark p-4">
          <div onClick={() => setShowHelp(false)} className="float-right">
            <Icons.close />
          </div>
          <iframe src={'/help/' + slug} className="h-[90%] w-full" />
        </div>
      ) : null}
    </>
  )
}
