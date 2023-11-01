import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import * as z from 'zod'

const routeContextSchema = z.object({
  params: z.object({
    mappingId: z.string(),
  }),
})

export async function DELETE(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    // Validate the route params.
    const { params } = routeContextSchema.parse(context)
    console.log(params)
    // Check if the user has access to this post.
    if (!(await verifyCurrentUserHasAccessToMapping(params.mappingId))) {
      return new Response(null, { status: 403 })
    }
    console.log('cleared to delete')
    // Delete the post.
    await db.projectAccountMapping.delete({
      where: {
        id: params.mappingId as string,
      },
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

async function verifyCurrentUserHasAccessToMapping(mappingId: string) {
  const session = await getServerSession(authOptions)
  console.log(session?.user.team.id)
  console.log('verifying session has access to')
  console.log(mappingId)
  const count = await db.projectAccountMapping.count({
    where: {
      id: mappingId,
      teamId: session?.user.team.id,
    },
  })
  console.log(count)
  return count > 0
}

const mappingSchema = z.object({
  mappingId: z.string(),
})
