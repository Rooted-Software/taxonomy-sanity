import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { absoluteUrl } from '@/lib/utils'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('Virtuous API Refresh - API Route')
    try {
      const account = await db.account.findFirst({
        select: {
          id: true,
          userId: true,
          access_token: true,
          refresh_token: true,
          expires_at: true,
        },
        where: {
          userId: user.id,
        },
      })
      console.log(account)
      if (!account) {
        return
      }
      const res2 = await fetch('https://api.virtuoussoftware.com/Token', {
        method: 'POST',
        body: 'grant_type=refresh_token&refresh_token=' + account.refresh_token,
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'form-data',
        },
      })
      console.log('after form')
      console.log(res2.status)
      if (res2.status !== 200) {
        console.log('returning status')
        return new Response(null, { status: 429 })
      }
      console.log('returning something else')
      const data = await res2.json()
      console.log(data)
      const updatedAccount = await db.account.updateMany({
        where: {
          userId: account.userId,
          type: 'oauth',
          provider: 'virtuous',
        },
        data: {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_in,
          token_type: 'bearer',
        },
      })

      return new Response(JSON.stringify(data))
    } catch (error) {
      return error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
