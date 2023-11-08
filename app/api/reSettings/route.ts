import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    const reSettings = await db.feSetting.findFirst({
      select: {
        id: true,
        environment_name: true,
        legal_entity_id: true,
        email: true,
        expires_in: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        teamId: user.team.id,
      },
    })
    console.log(reSettings)
    if (!reSettings) {
      return {}
    }

    return new Response(JSON.stringify(reSettings))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    return new Response(null, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  console.log('API Route Handler reSettings API - DELETE')
  const session = await getServerSession(authOptions)
  if (!session?.user || !session?.user.email) {
    return new Response(null, { status: 403 })
  }
  const { user } = session
  try {
    // Validate the route params.

    // Delete the post.
    const reSettings = await db.feSetting.delete({
      where: {
        teamId: user.team.id,
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
