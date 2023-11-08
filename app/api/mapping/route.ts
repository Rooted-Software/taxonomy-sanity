import { getServerSession } from 'next-auth'
import * as z from 'zod'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { upsertFeAccountFromId } from '@/lib/feAccounts'

const userUpdateSchema = z.object({
  selectValue: z.string().optional(),
})

async function verifyCurrentUserHasAccessToMapping(mappingId: string, teamId) {
  const session = await getServerSession(authOptions)
  const count = await db.projectAccountMapping.count({
    where: {
      id: mappingId,
      teamId: teamId,
    },
  })
  return count > 0
}

const mappingSchema = z.object({
  id: z.string(),
})

const mappingCreateSchema = z.object({
  virProjects: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .array(),
  feAccountID: z.string().optional(),
})

async function upsertMapping(
  virProjectId: number,
  feAccountID,
  teamId,
  virProjectName: string
) {
  await db.projectAccountMapping.upsert({
    where: {
      virProjectId_teamId: {
        virProjectId,
        teamId,
      },
    },
    update: {
      feAccountId: parseInt(feAccountID),
    },
    create: {
      virProjectId,
      virProjectName,
      feAccountId: parseInt(feAccountID),
      teamId,
    },
  })
}

export async function GET(req: Request) {
  try {
    // Validate the route params.
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response(null, { status: 403 })
    }
    const { user } = session

    const mappings = await db.projectAccountMapping.findMany({
      select: {
        id: true,
        virProjectId: true,
        feAccountId: true,
      },
      where: {
        teamId: user.team.id,
      },
    })
    return new Response(JSON.stringify(mappings))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

export async function POST(req: Request) {
  console.log('mapping - post')
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response(null, { status: 403 })
    }

    const { user } = session

    const json = await req.json()
    const body = mappingCreateSchema.parse(json)
    console.log(user)
    console.log(body)

    // Cache FE Account so that we can always get to it during processing
    if (body.feAccountID) {
      upsertFeAccountFromId(body.feAccountID, user.team.id)
    }

    if (body?.virProjects?.length == 0) {
      // update default account if nothing is set....this is defunct
      const userSettings = await db.team.update({
        where: {
          id: user.team.id,
        },
        data: {
          defaultDebitAccount: body.feAccountID,
        },
        select: {
          id: true,
        },
      })

      return new Response(null, { status: 200 })
    } else {
      body?.virProjects?.forEach(({ id, name }) => {
        console.log(id, name)
        const map = upsertMapping(id, body.feAccountID, user.team.id, name)
      })
    }

    return new Response(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
