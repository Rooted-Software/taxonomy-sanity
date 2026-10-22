import PostPage from '@/components/blog/BlogPostPage'
import {
  getAllPostsSlugs,
  getPostAndMoreStories,
  getSettings,
} from 'lib/sanity.client'
import { getSanityDraft } from 'lib/sanity-draft'

export async function generateStaticParams() {
  return await getAllPostsSlugs()
}

export default async function SlugRoute(
  props: {
    params: Promise<{ slug: string }>
  }
) {
  const params = await props.params;
  const draft = await getSanityDraft()
  // Start fetching settings early, so it runs in parallel with the post query
  const settings = getSettings(draft.token)



  const data = getPostAndMoreStories(params.slug, draft.token)
  return <PostPage preview={draft.isEnabled} data={await data} settings={await settings} />
}

// FIXME: remove the `revalidate` export below once you've followed the instructions in `/pages/api/revalidate.ts`
export const revalidate = 1
