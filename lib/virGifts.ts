import { db } from '@/lib/db'

import { virDateOptions } from './utils'
import { virApiFetch } from './virApiFetch'

export const getVirtuousBatches = async (teamId, dateFilter = 30) => {
  const filterDate = new Date()
  filterDate.setDate(filterDate.getDate() - dateFilter - 1)

  const allGifts = await getVirtuousGifts(teamId, [
    {
      parameter: 'Batch',
      operator: 'IsSet',
    },
    {
      parameter: 'Gift Date',
      operator: 'OnOrAfter',
      value: virDateOptions[dateFilter],
    },
  ])
  const uniqueBatches = allGifts.reduce(
    (acc, item) => (item.batch ? { [item.batch]: item.giftDate, ...acc } : acc),
    {}
  )
  console.log('New batches:', uniqueBatches)

  return await Promise.all(
    Object.entries(uniqueBatches).map(([gift, latestGift]) =>
      upsertGiftBatch(gift, teamId, latestGift)
    )
  )
}

export async function upsertGiftBatch(batchName: string, teamId, latestGift) {
  return await db.giftBatch.upsert({
    where: {
      teamId_batch_name: {
        teamId: teamId,
        batch_name: batchName || 'none',
      },
    },
    update: {
      batch_name: batchName || 'none',
      latestGiftAt: new Date(latestGift),
    },
    create: {
      teamId: teamId,
      batch_name: batchName || 'none',
      latestGiftAt: new Date(latestGift),
      synced: false,
    },
  })
}

export const getVirtuousBatch = async (teamId, batchName: string) => {
  const batch = await db.giftBatch.findFirst({
    where: {
      teamId: teamId,
      batch_name: batchName,
    },
  })

  if (batch) {
    // TODO: if already synced, run diff and return diff report if anything has changed
    const giftsFromVirtuous = await getVirtuousGifts(teamId, [
      {
        parameter: 'Batch',
        operator: 'Is',
        value: batchName,
      },
    ])
    const giftsLocal = batch.synced
      ? (
          await db.gift.findMany({
            where: {
              teamId: teamId,
              batch_name: batch.batch_name,
            },
          })
        ).map((gift) => ({ ...gift, amount: gift.amount?.toNumber() }))
      : undefined

    return {
      ...batch,
      gifts: giftsLocal ?? giftsFromVirtuous,
    }
  }

  throw new Error('Batch not found')
}

export const getVirtuousGifts = async (
  teamId: string,
  conditions: Record<string, unknown>[]
) => {
  const gifts = [] as any[]
  let skip = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await virApiFetch(
      `https://api.virtuoussoftware.com/api/Gift/Query/FullGift?skip=${skip}&take=1000`,
      'POST',
      teamId,
      {
        groups: [
          {
            conditions,
          },
        ],
        sortBy: 'Last Modified Date',
        descending: 'true',
      }
    )

    if (res.status !== 200) {
      console.log(await res.text(), conditions)
      throw new Error('the request to Virtuous Gift Endpoint failed')
    }

    const newGifts = (await res.json()).list
    gifts.push(...newGifts)
    if (newGifts.length < 1000) {
      return gifts
    } else {
      skip += 1000
    }
  }
}

export async function updateGiftBatch(batchName, reBatchNo, teamId) {
  return await db.giftBatch.update({
    where: {
      teamId_batch_name: {
        batch_name: batchName,
        teamId: teamId,
      },
    },
    data: {
      reBatchNo: reBatchNo,
      synced: true,
      syncedAt: new Date(),
    },
    select: {
      id: true,
    },
  })
}

export async function insertGifts(
  gifts,
  teamId: string,
  syncHistoryId: string
) {
  return await db.gift.createMany({
    data: gifts.map((gift) => ({
      id: gift.id,
      transactionSource: gift.transactionSource,
      transactionId: gift.transactionId,
      contactId: gift.contactId,
      contactName: gift.contactName,
      contactUrl: gift.contactUrl,
      giftType: gift.giftType,
      giftTypeFormatted: gift.giftTypeFormatted,
      giftDate: new Date(gift.giftDate),
      giftDateFormatted: gift.giftDateFormatted,
      amount: gift.amount,
      amountFormatted: gift.amountFormatted,
      currencyCode: gift.currencyCode,
      exchangeRate: gift.exchangeRate,
      baseCurrencyCode: gift.baseCurrencyCode,
      batch: gift.batch,
      createDateTimeUtc: new Date(gift.createDateTimeUtc),
      createdByUser: gift.createdByUser,
      modifiedDateTimeUtc: new Date(gift.modifiedDateTimeUtc),
      modifiedByUser: gift.modifiedByUser,
      segmentId: gift.segmentId,
      segment: gift.segment,
      segmentCode: gift.segmentCode,
      segmentUrl: gift.segmentUrl,
      mediaOutletId: gift.mediaOutletId,
      mediaOutlet: gift.mediaOutlet,
      grantId: gift.grantId,
      grant: gift.grant,
      grantUrl: gift.grantUrl,
      notes: gift.notes,
      tribute: gift.tribute,
      tributeId: gift.tributeId,
      tributeType: gift.tributeType,
      acknowledgeIndividualId: gift.acknowledgeIndividualId,
      receiptDate: new Date(gift.receiptDate),
      receiptDateFormatted: gift.receiptDateFormatted,
      contactPassthroughId: gift.contactPassthroughId,
      contactPassthroughUrl: gift.contactPassthroughUrl,
      contactIndividualId: gift.contactIndividual,
      cashAccountingCode: gift.cashAccountingCode,
      giftAskId: gift.giftAskId,
      contactMembershipId: gift.contactMembershipId,
      giftUrl: gift.giftUrl,
      isTaxDeductible: gift.isTaxDeductible,
      giftDesignations: gift.giftDesignations,
      giftPremiums: gift.giftPremiums,
      recurringGiftPayments: gift.recurringGiftPayments,
      pledgePayments: gift.pledgePayments,
      customFields: gift.customFields,
      batch_name: gift.batch || 'none',
      synced: true,
      teamId,
      syncHistoryId,
      createdAt: new Date(),
    })),
    skipDuplicates: true,
  })
}
