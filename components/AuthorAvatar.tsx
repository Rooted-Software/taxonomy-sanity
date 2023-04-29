import { urlForImage } from 'lib/sanity.image'
import type { Author } from 'lib/sanity.queries'
import Image from 'next/image'

export default function AuthorAvatar(props: Author) {
  const { name, picture } = props
  return (
    <div className="flex items-center">
      <div className="relative mr-4 h-12 w-12">
        <Image
          src={
            picture?.asset?._ref
              ? urlForImage(picture).height(96).width(96).fit('crop').url()
              : 'https://source.unsplash.com/96x96/?face'
          }
          className="rounded-full"
          height={42}
          width={42}
          // @TODO add alternative text to avatar image schema
          alt={name || 'image name'}
        />
      </div>
      <div className="flex-1 text-left leading-tight">
        <p className="font-medium text-slate-900">{name}</p>
      </div>
    </div>
  )
}
