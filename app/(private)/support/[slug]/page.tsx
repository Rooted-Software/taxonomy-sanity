import { getAllSupportCategoryArticles } from 'lib/sanity.client'

import AccordionPortableTextContent from '@/components/accordionPortableTextContent'

export default async function SupportPage({ params, searchParams }: any) {
  console.log('Support Page')
  console.log(params.slug)
  var articles: any[] = []
  if (params.slug) {
    articles = await getAllSupportCategoryArticles(params.slug)
  }
  var ca: any[] = []
  articles?.forEach((article: any) => {
    ca.push({
      id: article.slug,
      title: article.title,
      slug: article.slug,
      content: article.content,
    })
  })
  console.log('Modified Articles')
  console.log(ca)
  return (
    <div className="container mt-4 grid grid-cols-1 gap-4 pt-4 lg:grid-cols-2">
      <div
        className="mt-4 p-4 lg:col-span-2"
        style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}
      >
        {ca?.length > 0 ? (
          <AccordionPortableTextContent
            items={ca}
            title={searchParams?.title}
          />
        ) : (
          <div>Sorry, articles are not available. Please refresh.</div>
        )}
      </div>
    </div>
  )
}

// FIXME: remove the `revalidate` export below once you've followed the instructions in `/pages/api/revalidate.ts`
export const revalidate = 1
