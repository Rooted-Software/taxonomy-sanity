import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { teamUserSchema } from '@/lib/validations/teamUser'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

export async function POST(
    req: Request
) {
    try {

        // Ensure user is authenticated
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return new Response(null, { status: 403 })
        }

        // Get the request body and validate it.
        const body = await req.json()
        const payload = teamUserSchema.parse(body)

        // Insert the user.

        await db.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                teamId: session.user.teamId
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