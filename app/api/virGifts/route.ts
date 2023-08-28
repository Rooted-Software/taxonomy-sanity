import { authOptions } from '@/lib/auth'
import { absoluteUrl } from '@/lib/utils'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { virApiFetch  } from '@/lib/virApiFetch'
import { upsertGiftBatch } from '@/lib/virGifts'


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('Virtuous Gifts - API Route')
    try {
        const body = {
            groups: [
              {
                conditions: [],
              },
            ],
            sortBy: 'Last Modified Date',
            descending: 'true',
          }
        const res = await virApiFetch('https://api.virtuoussoftware.com/api/Gift/Query/FullGift?skip=0&take=1000', 'POST', user.team.id, body)

          console.log('after virApiFetch')
          console.log(res.status)
          if (res.status !== 200) {
            console.log('returning status')
            return new Response(null, { status: 429 })
          }
          console.log('returning data')
          const data = await res.json()
          console.log(data)
          const unique = [
            ...new Set(data?.list?.map((item) => item.batch || 'none')),
          ] // [ 'A', 'B']
          console.log(unique)
    
          unique.forEach((gift: string) => {
            upsertGiftBatch(gift, session.user.team.id)
          })
    
      return new Response(JSON.stringify(data));
    } catch (error) {
        return new Response(JSON.stringify(error.issues), { status: 422 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    return new Response(null, { status: 500 })
  }
}
