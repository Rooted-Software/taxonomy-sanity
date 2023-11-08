import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { FriendlyError } from '@/lib/errors'
import { teamUserSchema } from '@/lib/validations/teamUser'

export async function POST(req: Request) {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response(null, { status: 403 })
    }

    // // Get the request body and validate it.
    const body = await req.json()
    const payload = teamUserSchema.parse(body)
    const foundUserWithThisEmail = await db.user.findFirst({
      where: { email: payload.email },
    })
    if (
      foundUserWithThisEmail &&
      foundUserWithThisEmail.teamId === session.user.teamId
    ) {
      throw new FriendlyError('User is already on your team!')
    }

    await db.user.upsert({
      where: {
        email: payload.email,
        deleted: true,
        team: null,
      },
      update: {
        deleted: false,
        teamId: session.user.teamId,
        name: payload.name,
      },
      create: {
        name: payload.name,
        email: payload.email,
        teamId: session.user.teamId,
      },
    })

    return new Response(null, { status: 200 })
  } catch (error) {
    let message: null | string = null
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      //https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
      if (error.code === 'P2002') {
        message =
          'This user already exists on a different team in DonorSync. Users cannot be a part of more than one team'
      }
    }
    if (error instanceof FriendlyError) {
      message = error.message
    }

    return new Response(message, { status: 500 })
  }
}
