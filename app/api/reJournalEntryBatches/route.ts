import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { syncBatchGifts } from '@/lib/feGiftBatches'
import { reFetch } from '@/lib/reFetch'

export type DesignationType = {
  projectId: string
  amountDesignated: number
}

const giftBatchSchema = z.object({
  batchId: z.string(),
  batchName: z.string(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session

    const res2 = await reFetch(
      'https://api.sky.blackbaud.com/generalledger/v1/projects',
      'GET',
      user.team.id
    )
    console.log(res2.status)
    if (res2.status !== 200) {
      console.log('returning status')
      return res2
    }
    console.log('returning something else')
    const data = await res2.json()

    return new Response(JSON.stringify(data))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    return new Response(null, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 403 })
    }
    const { user } = session
    console.log('POST RE Journal Entry Batches (test) API Route')

    const json = await req.json()
    const body = giftBatchSchema.parse(json)
    console.log('should have batch no')
    console.log(body)

    const { status, message, record_id } = await syncBatchGifts(
      user.team.id,
      body.batchId
    )

    if (status === 'success') {
      return new Response(JSON.stringify({ synced: true, record_id }), {
        status: 200,
      })
    } else {
      return new Response(`${status} - ${message}`, { status: 500 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error)
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    console.error(error)
    return new Response(null, { status: 500 })
  }
}
