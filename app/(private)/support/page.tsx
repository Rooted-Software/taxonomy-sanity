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
    <div className="container mt-4 grid grid-cols-1 gap-4 pt-4 lg:grid-cols-1">
      <div className='p-4 text-lg font-semibold leading-none tracking-tight'>
        Support
        <p className='pt-4 font-normal'>
           We currently are offering self service support through our documentation or email support through the form below. 
           In addition, if you are one of our enterprise customers, you can reach out to your account manager for additional support. 
           <br/><br/>
          <a className='underline' href='/docs/overview'>View DonorSync Documentation</a>
        </p>
      </div>
    </div>
      <div className="container mt-4 grid grid-cols-1 gap-4 pt-4 lg:grid-cols-2">
     
      <ContactForm />

      
      <div>
        <div className='p-4 text-lg font-semibold leading-none tracking-tight'>Frequently Asked Questions</div>
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
    </div>
    </>
  )
}

// FIXME: remove the `revalidate` export below once you've followed the instructions in `/pages/api/revalidate.ts`
export const revalidate = 1
