import type { FC } from 'react'
import Link from 'next/link'

interface CardProps {
  title: string
  subText: string
  iconUrl: string
  count: string
  slug: string
}

const Card: FC<CardProps> = ({ title, subText, iconUrl, count, slug }) => (
  <Link href={slug + '?title=' + title}>
    <div className="flex justify-center p-3">
      <div className="block min-w-full rounded-lg bg-white p-3 shadow-lg">
        <img
          className="mb-1"
          src={iconUrl}
          style={{ height: '25px', width: '25px' }}
        />
        <p className="mb-2 text-base font-medium leading-tight text-gray-900">
          {title}
        </p>
        <p
          className="mb-2 text-sm text-gray-700"
          style={{ fontStyle: 'italic' }}
        >
          {count} {subText}
        </p>
      </div>
    </div>
  </Link>
)

export default Card
