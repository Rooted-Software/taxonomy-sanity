import { getAllFeatures } from '@/lib/sanity.client'
import { urlForImage } from 'lib/sanity.image'
import Image from 'next/image'
import Link from 'next/link'

export default async function FeaturePage() {
  // Fetch queries in parallel
  const features = await getAllFeatures()
  console.log(
    'features: ',
    features,
    features[0].description[0],
    features[0].description[0].children[0].text
  )

  return (
    <section className="container flex flex-col items-center gap-6 py-8 md:max-w-[64rem] md:py-12 lg:py-24">
      <div className="mx-auto grid w-full grid-cols-1 gap-4 rounded-lg border border-slate-200 p-10 md:grid-cols-3">
        <div className="col-span-2 flex flex-col justify-center text-center md:text-left">
          <h2 className="text-3xl font-bold leading-[1.1] tracking-tighter md:text-5xl">
            Join during the beta to use all features for free!
          </h2>
          <p className="text-1xl my-2 md:text-2xl">
            including batch gift syncing, project mapping, and more
          </p>
        </div>
        <div className="col-span-1 flex flex-col items-center">
          <h3 className="text-xl font-bold sm:text-2xl">Get started now</h3>
          <div className="text-center">
            <h4 className="text-7xl font-bold">$0</h4>
            <p className="text-sm font-medium text-slate-600">Billed Monthly</p>
          </div>
          <Link
            href="/signUp"
            className="relative mt-4 inline-flex h-12 w-52 max-w-xs items-center justify-center rounded-md border border-transparent bg-brand-500 py-6 text-center font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Get Started
          </Link>
        </div>
      </div>

      <h3 className="text-xl font-bold sm:text-2xl">
        Features included with DonorSync
      </h3>

      <div className="grid w-full grid-cols-1 gap-20 md:grid-cols-2">
        {features.map((e) => {
          let description = ''
          if (e.description) {
            description = e.description[0].children[0].text
          }

          return (
            <div key={e._id} className="w-full">
              {e.coverImage && (
                <Image
                  src={urlForImage(e.coverImage).height(1000).width(2000).url()}
                  alt={e.title || ''}
                  width={804}
                  height={452}
                  className="rounded-md border border-slate-200 bg-slate-200"
                  priority={false}
                />
              )}
              <h2 className="mt-3 text-2xl font-bold">{e.title}</h2>
              {description && <p className="text-slate-600">{description}</p>}
            </div>
          )
        })}
      </div>

      <div className="mx-auto flex flex-col gap-4 text-center md:max-w-[52rem]">
        <p className="leading-normal text-slate-700 sm:leading-7">
          DonorSync is a beta app.{' '}
          <strong>You can get started for free with all the features and won&apos;t be charged.</strong>
        </p>
      </div>
    </section>
  )
}

// FIXME: remove the `revalidate` export below once you've followed the instructions in `/pages/api/revalidate.ts`
// export const revalidate = 1
