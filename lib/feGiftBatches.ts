import { revalidatePath } from 'next/cache'
import { Prisma, Team } from '@prisma/client'

import { db } from '@/lib/db'
import { getFeAccounts } from '@/lib/feAccounts'
import { reFetch } from '@/lib/reFetch'
import { getVirtuousGifts, insertGifts } from '@/lib/virGifts'
import { getProjectAccountMappings } from '@/lib/virProjects'

import { createJournalEntries } from './feJournalEntries'

export type DesignationType = {
  projectId: string
  amountDesignated: number
}

export function getDefaultJournal(team: Pick<Team, 'defaultJournal' | 'id'>) {
  return team.defaultJournal
    ? db.feJournal.findUnique({
        where: {
          teamId_id: {
            id: parseInt(team.defaultJournal),
            teamId: team.id,
          },
        },
        select: {
          id: true,
          code: true,
          journal: true,
        },
      })
    : null
}

async function syncGiftsInternal(
  teamId: string,
  gifts: any[],
  description: string,
  batchId?: string
) {
  console.log('POST RE Journal Entry Batches (test) API Route')
  const start = performance.now()

  const team = await db.team.findUnique({
    where: { id: teamId },
  })

  if (
    team === null ||
    team.defaultJournal === null ||
    team.defaultCreditAccount === null ||
    team.defaultDebitAccount === null
  ) {
    return { status: 'failure', message: 'not all required fields are set' }
  }

  const [feAccounts, mappings, defaultJournal] = await Promise.all([
    getFeAccounts(teamId),
    getProjectAccountMappings(teamId),
    getDefaultJournal(team),
  ])

  const journalEntries = await createJournalEntries(
    gifts,
    feAccounts,
    mappings,
    defaultJournal,
    team
  )

  const bodyJson = {
    description,
    batch_status: 'Open',
    create_interfund_sets: true,
    create_bank_account_adjustments: true,
    journal_entries: journalEntries,
  }
  //console.log(util.inspect(bodyJson, false, null, true /* enable colors */))

  const res2 = await reFetch(
    'https://api.sky.blackbaud.com/generalledger/v1/journalentrybatches',
    'POST',
    team.id,
    bodyJson
  )
  const status = res2.status === 200 ? 'success' : 'failed'

  const end = performance.now()
  const total = end - start

  const syncHistory = await db.syncHistory.create({
    data: {
      teamId: teamId,
      giftBatchId: batchId,
      syncType: 'manual',
      syncMessage: description,
      syncStatus: status,
      syncDuration: Math.trunc(total / 1000),
      syncDate: new Date(),
    },
  })

  let record_id = null
  if (status === 'success') {
    await insertGifts(gifts, team.id, syncHistory.id)
    revalidatePath('/dashboard/gifts')
    record_id = (await res2.json()).record_id
  }

  return { status, message: 'sync complete', record_id: record_id }
}

export async function getVirtuousGiftsWithSyncCheck(
  teamId: string,
  conditions: Record<string, unknown>[],
  where: Prisma.GiftWhereInput,
  onlyUnsynced = false
) {
  const [virtuousGifts, syncedGifts] = await Promise.all([
    getVirtuousGifts(teamId, conditions),
    db.gift.findMany({
      where,
      select: {
        id: true,
      },
    }),
  ])
  const syncedGiftIds = new Set()
  syncedGifts.forEach((g) => syncedGiftIds.add(g.id))
  return onlyUnsynced
    ? virtuousGifts.filter((g) => !syncedGiftIds.has(g.id))
    : virtuousGifts.map((g) => ({ ...g, synced: syncedGiftIds.has(g.id) }))
}

export async function syncBatchGifts(
  teamId: string,
  batchName: string,
  onlyUnsynced = false
) {
  const gifts = await getVirtuousGiftsWithSyncCheck(
    teamId,
    [
      {
        parameter: 'Batch',
        operator: 'Is',
        value: batchName,
      },
    ],
    {
      batch_name: batchName,
    },
    onlyUnsynced
  )

  const result = await syncGiftsInternal(teamId, gifts, batchName)
  if (result.status === 'success') {
    await db.giftBatch.update({
      where: {
        teamId_batch_name: {
          teamId,
          batch_name: batchName,
        },
      },
      data: {
        reBatchNo: result.record_id,
        synced: true,
        syncedAt: new Date(),
      },
      select: {
        id: true,
      },
    })
  }
  return result
}

export async function syncGiftsInDateRange(
  teamId: string,
  startDate: string,
  endDate: string,
  onlyUnsynced = false
) {
  const gifts = await getVirtuousGiftsWithSyncCheck(
    teamId,
    [
      {
        parameter: 'Gift Date',
        operator: 'Between',
        value: startDate,
        secondaryValue: endDate,
      },
    ],
    {
      giftDate: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    onlyUnsynced
  )

  return await syncGiftsInternal(
    teamId,
    gifts,
    `All gifts from ${startDate} to ${endDate}`
  )
}

export async function syncSelectedGifts(
  teamId: string,
  giftIds: string[],
  description: string,
  onlyUnsynced = false
) {
  const gifts = await getVirtuousGiftsWithSyncCheck(
    teamId,
    giftIds.map((id) => ({
      parameter: 'Gift ID',
      operator: 'Is',
      value: id,
    })),
    {
      id: {
        in: giftIds.map((id) => parseInt(id)),
      },
    },
    onlyUnsynced
  )

  return await syncGiftsInternal(teamId, gifts, description)
}
