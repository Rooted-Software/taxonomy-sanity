import { getDocBySlug } from '@/lib/sanity.client'
import styles from '@/components/blog/PostBody.module.css'
import { DocsPageHeader } from '@/components/docs/page-header'

import '@/styles/mdx.css'

import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'

var getSlug = require('speakingurl')

interface DocPageProps {
  params: {
    slug: string
  }
}

const getChildrenText = (props) =>
  props.children
    .map((node) => (typeof node === 'string' ? node : node.text || ''))
    .join('')

const TableOfContents = (props) => (
  <ol>
    {props.outline.map((heading) => (
      <li key={heading.slug}>
        <a href={'#' + heading._key}>{getChildrenText(heading)}</a>
        {heading.subheadings.length > 0 && (
          <TableOfContents outline={heading.subheadings} />
        )}
      </li>
    ))}
  </ol>
)

export default async function DocPage({ params }: DocPageProps) {
  const slug = process.env.DEFAULT_DOC_SLUG || 'article-1'
  /* load docs from slug */
  const doc = await getDocBySlug(slug)
  // const outline = parseOutline(doc.content)
  if (!doc) {
    notFound()
  }

  // const toc = await getTableOfContents(doc.body.raw)

  return (
    <main className="relative py-6 lg:gap-10 lg:py-10 xl:grid xl:grid-cols-[1fr_300px]">
      <div className={`mx-auto w-full min-w-0 ${styles.portabletext} `}>
        <DocsPageHeader heading={doc.title} text={''} />
        <PortableText value={doc.content} />
        <hr className="my-4 border-slate-200 md:my-6" />
        {/* <DocsPager doc={doc} /> */}
      </div>
      <div className="hidden text-sm xl:block">
        <div className="sticky top-16 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
          {/* <DashboardTableOfContents toc={toc} /> */}
        </div>
      </div>
    </main>
  )
}
export const revalidate = 0
