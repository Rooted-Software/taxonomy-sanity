import BlogPostPage from '@/components/blog/BlogPostPage'
import {
  getAllPostsSlugs,
  getPostAndMoreStories,
  getSettings,
} from 'lib/sanity.client'
import { getSanityDraft } from 'lib/sanity-draft'

export async function generateStaticParams() {
  return await getAllPostsSlugs()
}

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function PostPage(props: PostPageProps) {
  const params = await props.params;
  const draft = await getSanityDraft()
  const settings = getSettings(draft.token)


  const data = getPostAndMoreStories(params.slug, draft.token)
  return <BlogPostPage preview={draft.isEnabled} data={await data} settings={await settings} />
}
// FIXME: remove the `revalidate` export below once you've followed the instructions in `/pages/api/revalidate.ts`
// export const revalidate = 1
