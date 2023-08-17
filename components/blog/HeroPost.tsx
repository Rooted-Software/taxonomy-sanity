import Date from '@/components/blog/PostDate'
import AuthorAvatar from 'components/AuthorAvatar'
import CoverImage from 'components/CoverImage'
import type { Post } from 'lib/sanity.queries'
import Link from 'next/link'

export default function HeroPost(
  props: Pick<
    Post,
    'title' | 'coverImage' | 'date' | 'excerpt' | 'author' | 'slug'
  >
) {
  const { title, coverImage, date, excerpt, author, slug } = props
  return (
    <section>
      <div className="mb-8 md:mb-16">
        <CoverImage
          slug={slug}
          title={title || ''}
          image={coverImage}
          priority
        />
      </div>
      <div className="mb-20 md:mb-28 md:grid md:grid-cols-1 md:gap-x-16 lg:gap-x-8">
        <div>
          <h3 className="mb-4 text-4xl leading-tight text-accent-1 lg:text-2xl">
            <Link href={`/blog/${slug}`} className="hover:underline">
              {title || 'Untitled'}
            </Link>
          </h3> {/* 
          <div className="mb-4 text-lg md:mb-0">
            <Date dateString={date || ''} /> 
          </div>*/}
        </div>
        <div>
        </div>
        <div>{excerpt && <p className="display-block mb-4 text-lg leading-relaxed text-white">{excerpt} <Link href={`/blog/${slug}`} className="pl-3 text-accent-1 hover:underline">
              read more
            </Link></p>}
         {/*  {author && (
            <AuthorAvatar name={author.name} picture={author.picture} />
         )} */} </div>
      </div>
    </section>
  )
}
