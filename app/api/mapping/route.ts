import { Prisma } from '@prisma/client'
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
  feCreditAccountID: z.string().optional(),
  feDebitAccountID: z.string().optional(),
  feDebitAccountForGiftType: z.record(z.string(), z.number()).optional(),
})

async function upsertMapping(
  teamId: string,
  mapping: Prisma.ProjectAccountMappingCreateInput
) {
  await db.projectAccountMapping.upsert({
    where: {
      virProjectId_teamId: {
        virProjectId: mapping.virProjectId,
        teamId: teamId,
      },
    },
    update: mapping,
    create: mapping,
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
    if (body.feCreditAccountID) {
      await upsertFeAccountFromId(body.feCreditAccountID, user.team.id)
    }
    if (body.feDebitAccountID) {
      await upsertFeAccountFromId(body.feDebitAccountID, user.team.id)
    }
    if (body.feDebitAccountForGiftType) {
      await Promise.all(
        Object.values(body.feDebitAccountForGiftType).map((id) =>
          upsertFeAccountFromId(id, user.team.id)
        )
      )
    }

    if (body?.virProjects?.length == 0) {
      return new Response(null, { status: 200 })
    } else {
      await Promise.all(
        body?.virProjects?.map(({ id, name }) =>
          upsertMapping(user.team.id, {
            team: {
              connect: {
                id: user.team.id,
              },
            },
            virProjectId: id,
            virProjectName: name,
            feAccount: body.feCreditAccountID
              ? {
                  connect: {
                    account_id_teamId: {
                      account_id: parseInt(body.feCreditAccountID),
                      teamId: user.team.id,
                    },
                  },
                }
              : undefined,
            feDebitAccount: body.feDebitAccountID
              ? {
                  connect: {
                    account_id_teamId: {
                      account_id: parseInt(body.feDebitAccountID),
                      teamId: user.team.id,
                    },
                  },
                }
              : undefined,
            feDebitAccountForGiftType: body.feDebitAccountForGiftType,
          })
        )
      )
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
