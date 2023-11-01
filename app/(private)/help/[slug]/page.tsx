import { getAllDocsSlugs, getDocBySlug } from '@/lib/sanity.client'
import { DocsPageHeader } from '@/components/docs/page-header'

import '@/styles/mdx.css'

import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getImageDimensions } from '@sanity/asset-utils'
import urlBuilder from '@sanity/image-url'
import { apiVersion, dataset, projectId, useCdn } from 'lib/sanity.api'
import { createClient } from 'next-sanity'

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

const SampleImageComponent = ({ value, isInline }) => {
  const { width, height } = getImageDimensions(value)
  const client = createClient({ projectId, dataset, apiVersion, useCdn })
  return (
    <img
      src={urlBuilder(client)
        .image(value)
        .width(isInline ? 100 : 800)
        .fit('max')
        .auto('format')
        .url()}
      alt={value.alt || ' '}
      loading="lazy"
      style={{
        // Display alongside text if image appears inside a block text span
        display: isInline ? 'inline-block' : 'block',

        // Avoid jumping around with aspect-ratio CSS property
        aspectRatio: width / height,
      }}
    />
  )
}

const components = {
  types: {
    image: SampleImageComponent,
    // Any other custom types you have in your content
    // Examples: mapLocation, contactForm, code, featuredProjects, latestNews, etc.
  },
}

export async function generateStaticParams() {
  return await getAllDocsSlugs()
}

export default async function DocPage({ params }: DocPageProps) {
  const slug = params?.slug || ''
  /* load docs from slug */
  const doc = await getDocBySlug(slug)
  // const outline = parseOutline(doc.content)
  if (!doc) {
    notFound()
  }

  // const toc = await getTableOfContents(doc.body.raw)

  return (
    <main className="relative py-6 lg:gap-10 lg:py-10 xl:grid xl:grid-cols-[1fr_300px]">
      <div className={`prose prose-invert mx-auto w-full min-w-0`}>
        <DocsPageHeader heading={doc.title} text={''} />
        <PortableText value={doc.content} components={components} />
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

export const revalidate = 1
