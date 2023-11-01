import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { reFetch } from '@/lib/reFetch'

async function upsertJournal(journal, teamId) {
  await db.feJournal.upsert({
    where: {
      teamId_id: {
        id: journal.journal_code_id,
        teamId: teamId,
      },
    },
    update: {
      code: journal.code,
      journal: journal.journal,
    },
    create: {
      id: journal.journal_code_id,
      code: journal.code,
      journal: journal.journal,
      teamId: teamId,
    },
  })
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('GET RE Journals API Route')
    const res2 = await reFetch(
      'https://api.sky.blackbaud.com/generalledger/v1/journalcodes',
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
    console.log(data)
    data?.forEach((journal) => {
      upsertJournal(journal, session.user.team.id)
    })
    return new Response(JSON.stringify(data))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    return new Response(null, { status: 500 })
  }
}

const userUpdateSchema = z.object({
  selectValue: z.string().optional(),
})

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

    const userSettings = await db.team.update({
      where: {
        id: user.team.id,
      },
      data: {
        defaultJournal: body.selectValue,
      },
      select: {
        id: true,
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
