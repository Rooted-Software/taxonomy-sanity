import IndexPage from '@/components/blog/IndexPage'
import { MainNav } from '@/components/main-nav'
import { SiteFooter } from '@/components/site-footer'
import { marketingConfig } from '@/config/marketing'
import { getAllPosts, getSettings } from 'lib/sanity.client'
import { getSanityDraft } from 'lib/sanity-draft'
import Link from 'next/link'

export default async function IndexRoute() {
  const draft = await getSanityDraft()
  // Fetch queries in parallel
  const [settings, posts] = await Promise.all([getSettings(draft.token), getAllPosts(draft.token)])



  return (
    <div className="flex min-h-screen flex-col">
      <header className="container sticky top-0 z-40 bg-white">
        <div className="flex h-16 items-center justify-between border-b border-b-slate-200 py-4">
          <MainNav items={marketingConfig.mainNav} />
          <nav>
            <Link
              href="/login"
              className="relative inline-flex h-8 items-center rounded-md border border-transparent bg-brand-500 px-6 py-1 text-sm font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <IndexPage preview={draft.isEnabled} posts={posts} settings={settings} />
      </main>
      <SiteFooter />
    </div>
  )
}

// FIXME: remove the `revalidate` export below once you've followed the instructions in `/pages/api/revalidate.ts`
  // this revalidate function is not working
export const revalidate = 180
