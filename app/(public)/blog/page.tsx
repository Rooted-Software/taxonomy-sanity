
import IndexPage from '@/components/blog/IndexPage'
import { compareDesc } from "date-fns"
import { getSanityDraft } from 'lib/sanity-draft'
import { getAllPosts, getSettings } from 'lib/sanity.client'


export default async function BlogPage() {
  const draft = await getSanityDraft()
  // Fetch queries in parallel
  const [settings, posts] = await Promise.all([getSettings(draft.token), getAllPosts(draft.token)])

    // previeData() currently returns false



  return <IndexPage preview={draft.isEnabled} posts={posts} settings={settings} />
}

// FIXME: remove the `revalidate` export below once you've followed the instructions in `/pages/api/revalidate.ts`
// export const revalidate = 1