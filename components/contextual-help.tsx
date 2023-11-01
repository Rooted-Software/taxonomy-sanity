'use client'

import { Icons } from '@/components/icons'
import { AvatarProps } from '@radix-ui/react-avatar'
import { notFound } from 'next/navigation'
import { useState } from 'react'

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
        className="absolute top-10 left-10 h-[100] w-[100] rounded-full bg-cyan p-3 text-2xl text-accent-1"
        onClick={() => setShowHelp(true)}
      >
        <Icons.help className="h-9 w-9 text-lg text-dark" />
      </div>
      {showHelp ? (
        <div className="border-width-1 absolute top-[100px] left-[50px] z-[1000] m-4 h-[60%] w-[580px] overflow-auto rounded-md border border-solid border-white bg-dark p-4">
          <div onClick={() => setShowHelp(false)} className="float-right">
            <Icons.close />
          </div>
          <iframe src={'/help/' + slug} className="h-[90%] w-full" />
        </div>
      ) : null}
    </>
  )
}
