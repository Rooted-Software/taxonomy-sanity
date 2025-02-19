import styles from '@/components/blog/PostBody.module.css'
import {
  LinkableH1Header,
  LinkableH2Header,
  LinkableH3Header,
  LinkableH4Header,
} from '@/components/docs/customComponents'
import { DocsPageHeader } from '@/components/docs/page-header'
import { DocsPager } from '@/components/docs/pager'
import { parseOutline } from '@/lib/sanity-toc'
import { getAllDocsSlugs, getDocBySlug } from '@/lib/sanity.client'
import '@/styles/mdx.css'
import { PortableText, PortableTextComponents } from '@portabletext/react'
import { notFound } from 'next/navigation'

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
        <a href={'#' + heading.slug}>{getChildrenText(heading)}</a>
        {heading.subheadings && heading.subheadings?.length > 0 && (
          <TableOfContents outline={heading.subheadings} />
        )}
      </li>
    ))}
  </ol>
)

export async function generateStaticParams() {
  return await getAllDocsSlugs()
}

export default async function DocPage({ params }: DocPageProps) {
  const slug = params?.slug || ''
  /* load docs from slug */
  const doc = await getDocBySlug(slug)
  const outline = parseOutline(doc.content)
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
          <TableOfContents outline={outline} />
        </div>
      </div>
    </main>
  )
}
