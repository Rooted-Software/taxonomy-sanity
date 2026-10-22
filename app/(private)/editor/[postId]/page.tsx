import { Editor } from '@/components/dashboard/editor'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { Post, User } from '@prisma/client'
import { notFound, redirect } from 'next/navigation'

async function getPostForUser(postId: Post['id'], userId: User['id']) {
  return await db.post.findFirst({
    where: {
      id: postId,
      authorId: userId,
    },
  })
}

interface EditorPageProps {
  params: Promise<{ postId: string }>
}

export default async function EditorPage(props: EditorPageProps) {
  const params = await props.params;
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions.pages.signIn)
  }

  const post = await getPostForUser(params.postId, user.id)

  if (!post) {
    notFound()
  }

  return (
    <Editor
      post={{
        id: post.id,
        title: post.title,
        content: post.content,
        published: post.published,
      }}
    />
  )
}
