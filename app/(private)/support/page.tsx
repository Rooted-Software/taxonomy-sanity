import styles from '/styles/Shared.module.css'
import Card from '@/components/card'
import { ContactForm } from '@/components/support/contact-form'
import {
  getAllSupportCategories,
  getAllSupportCategorySlugs,
  getSettings,
} from 'lib/sanity.client'
import { urlForImage } from 'lib/sanity.image'
import React from 'react'

export async function generateStaticParams() {
  console.log('slugs')
  console.log(await getAllSupportCategories())
  return await getAllSupportCategorySlugs()
}

export default async function SupportCategoryPage({
  params,
  searchParams,
}: any) {
  // /blog/hello-world => { params: { slug: 'hello-world' } }
  // /blog/hello-world?id=123 => { searchParams: { id: '123' } }
  console.log('Support Page')
  console.log(params.slug)

  var categories: any = []
  try {
    categories = await getAllSupportCategories()
  } catch (error) {
    // log an error
  }
  return (
    <>
      <ContactForm />

      <div>
        {categories?.length > 0 ? (
          categories?.map((category: any, index: number) => (
            <div
              className="text-white"
              style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}
            >
              <Card
                key={index}
                title={category.title}
                iconUrl={
                  category?.icon
                    ? urlForImage(category.icon)
                        .width(1200)
                        .height(627)
                        .fit('crop')
                        .url()
                    : ''
                }
                subText={category.subText}
                count={category.count}
                slug={`/support/` + category.slug}
              />
            </div>
          ))
        ) : (
          <div>
            <h3>No categories found</h3>
          </div>
        )}
      </div>
    </>
  )
}

// FIXME: remove the `revalidate` export below once you've followed the instructions in `/pages/api/revalidate.ts`
export const revalidate = 1
