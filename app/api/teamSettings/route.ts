import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'

const allowedKeys = ['automation']

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response(null, { status: 403 })
  }

  const { user } = session
  const data = await req.json()

  if (Object.keys(data).every((key) => allowedKeys.includes(key))) {
    await db.team.update({
      where: {
        id: user.team.id,
      },
      data,
      select: {
        id: true,
      },
    })
    return new Response(null, { status: 200 })
  }

  return new Response(null, { status: 400 })
}
