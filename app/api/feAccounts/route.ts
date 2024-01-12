import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  getFeAccountsFromBlackbaud,
  upsertFeAccountFromId,
} from '@/lib/feAccounts'

const userUpdateSchema = z.object({
  selectValue: z.string().optional(),
  subType: z.string().optional(),
  map: z.record(z.string(), z.number()).optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }

    const { user } = session
    const accounts = await getFeAccountsFromBlackbaud(user.team.id)
    return new Response(JSON.stringify(accounts))
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
      return new Response(null, { status: 403 })
    }

    const { user } = session

    // Get the request body and validate it.
    // TODO: Implement sanitization for content.

    const json = await req.json()
    console.log(json)

    const body = userUpdateSchema.parse(json)
    console.log('Test Subtype')
    console.log(body.subType)

    // Cache FE Account so that we can always get to it during processing
    if (body.selectValue) {
      upsertFeAccountFromId(body.selectValue, user.team.id)
    }
    if (body.map) {
      Object.values(body.map).forEach((value) =>
        upsertFeAccountFromId(value, user.team.id)
      )
    }

    if (body.subType === 'credit') {
      await db.team.update({
        where: {
          id: user.team.id,
        },
        data: {
          defaultCreditAccount: body.selectValue,
        },
        select: {
          id: true,
        },
      })
    } else {
      await db.team.update({
        where: {
          id: user.team.id,
        },
        data: {
          defaultDebitAccount: body.selectValue,
          defaultDebitAccountForGiftType: body.map ?? {},
        },
        select: {
          id: true,
        },
      })
    }

    return new Response(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    console.error(error)
    return new Response(null, { status: 500 })
  }
}
