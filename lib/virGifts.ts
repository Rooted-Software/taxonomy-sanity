import { db } from '@/lib/db'

import { virDateOptions } from './utils'
import { virApiFetch } from './virApiFetch'
import { getVirtuousProjects } from './virProjects'

export const getBatches = async (teamId, dateFilter) => {
  return await db.giftBatch.findMany({
    select: {
      id: true,
      batch_name: true,
      synced: true,
      syncedAt: true,
      reBatchNo: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      teamId: teamId,
      latestGiftAt: {
        gte: dateFilter,
      },
    },
    orderBy: {
      latestGiftAt: 'desc',
    },
  })
}

// Get batches from local DB and check Virtuous for any new ones
export const getVirtuousBatches = async (teamId, dateFilter = 30) => {
  const filterDate = new Date()
  filterDate.setDate(filterDate.getDate() - dateFilter - 1)
  let batches = await getBatches(teamId, filterDate.toISOString())

  let hasMoreData = true
  // Always fetch at least one group in case there are newer batches available
  do {
    console.log(`Currently have ${batches.length} batches, fetching more`)
    const body = {
      groups: [
        {
          conditions: [
            {
              parameter: 'Batch',
              operator: 'IsSet',
            },
            {
              parameter: 'Gift Date',
              operator: 'OnOrAfter',
              value: virDateOptions[dateFilter],
            },
            // Trial and error determined it could handle 139, but not 140 of these filters
            // Any item past 139 will be handled by upsert
            ...batches.slice(0, 139).map((batch) => ({
              parameter: 'Batch',
              operator: 'IsNot',
              value: batch.batch_name,
            })),
          ],
        },
      ],
      sortBy: 'Last Modified Date',
      descending: 'true',
    }

    const res = await virApiFetch(
      'https://api.virtuoussoftware.com/api/Gift/Query?skip=0&take=1000',
      'POST',
      teamId,
      body
    )

    if (res.status !== 200) {
      console.log(await res.text())
      throw new Error('the request to Virtuous Gift Endpoint failed')
    }

    const data = await res.json()

    if (data && data.total > 0) {
      const uniqueBatches = data?.list?.reduce(
        (acc, item) => ({ [item.batch]: item.giftDate, ...acc }),
        {}
      )
      console.log('New batches:', uniqueBatches)

      await Promise.all(
        Object.entries(uniqueBatches).map(([gift, latestGift]) =>
          upsertGiftBatch(gift, teamId, latestGift)
        )
      )

      batches = await getBatches(teamId, filterDate)

      if (data.total < 1000) {
        hasMoreData = false
      }
    } else {
      console.log(`No more data from virtuous for past ${dateFilter} days`)
      hasMoreData = false
    }
  } while (hasMoreData)

  return batches
}

export async function upsertGiftBatch(gift: string, teamId, latestGift) {
  await db.giftBatch.upsert({
    where: {
      teamId_batch_name: {
        teamId: teamId,
        batch_name: gift || 'none',
      },
    },
    update: {
      batch_name: gift || 'none',
      latestGiftAt: new Date(latestGift),
    },
    create: {
      teamId: teamId,
      batch_name: gift || 'none',
      latestGiftAt: new Date(latestGift),
      synced: false,
    },
  })
}

export const getVirtuousBatch = async (teamId, batchId: string) => {
  const batch = await db.giftBatch.findUnique({
    where: {
      teamId: teamId,
      id: batchId,
    },
  })

  if (batch) {
    const res = await virApiFetch(
      'https://api.virtuoussoftware.com/api/Gift/Query/FullGift?skip=0&take=1000',
      'POST',
      teamId,
      {
        groups: [
          {
            conditions: [
              {
                parameter: 'Batch',
                operator: 'Is',
                value: batch.batch_name,
              },
            ],
          },
        ],
        sortBy: 'Last Modified Date',
        descending: 'true',
      }
    )

    if (res.status !== 200) {
      console.log(await res.text())
      throw new Error('the request to Virtuous Gift Endpoint failed')
    }

    // TODO: if already synced, run diff and return diff report if anything has changed
    const giftsFromVirtuous = (await res.json()).list
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

export async function insertGifts(gifts, teamId, batch_name) {
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
    })),
    skipDuplicates: true,
  })
}

export function getRelatedProjects(
  batch: Awaited<ReturnType<typeof getVirtuousBatch>>
) {
  const projectIds = new Set<string>()
  batch.gifts
    .flatMap((gift) => gift.giftDesignations)
    .forEach(({ projectId }) => projectIds.add(projectId))
  return getVirtuousProjects(batch.teamId, Array.from(projectIds))
}
