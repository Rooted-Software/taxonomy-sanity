import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { userRoleSchema } from '@/lib/validations/userRole'

const routeContextSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
})

// @todo The component that calls this is not displayed anywhere
export async function PATCH(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    // Validate the route context.
    const { params } = routeContextSchema.parse(context)

    // Is this Necesary? retrieve the user from database because we dont trust the frontend
    const userToModify = await db.user.findUniqueOrThrow({
      select: {
        id: true,
        teamId: true,
      },
      where: {
        id: params.userId,
      },
    })
    // Ensure user is authenticated and is removing a user from the same team
    const session = await getServerSession(authOptions)
    if (!session?.user || session?.user.role != 'admin' || session?.user.teamId !== userToModify.teamId) {
      return new Response(null, { status: 403 })
    }


    // Get the request body and validate it.
    const body = await req.json()
    const payload = userRoleSchema.parse(body)

    // Update the user.
    await db.user.update({
      where: {
        id: userToModify.id,
      },
      data: {
        role: payload.role,
      },
    })

    return new Response(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    // Validate the route context.
    const { params } = routeContextSchema.parse(context)

    // Is this Necesary? retrieve the user from database because we dont trust the frontend
    const userToDelete = await db.user.findUniqueOrThrow({
      select: {
        id: true,
        teamId: true,
      },
      where: {
        id: params.userId,
      },
    })

    // Ensure user is authenticated and is removing a user from the same team
    const session = await getServerSession(authOptions)
    if (!session?.user || session?.user.teamId !== userToDelete.teamId) {
      return new Response(null, { status: 403 })
    }

    // Middleware will soft delete the user
    await db.user.delete({
      where: {
        id: userToDelete.id,
      },
    })

    return new Response(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
