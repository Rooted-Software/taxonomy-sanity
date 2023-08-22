import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { RequiresProPlanError } from '@/lib/exceptions'
import { virApiFetch } from '@/lib/virApiFetch'
import { getServerSession } from 'next-auth/next'
import * as z from 'zod'

const giftBatchSchema = z.object({
    batch_name: z.string(),
  })

async function upsertGift(gift, tempTeamId) {
    await db.gift.upsert({
      where: {
        teamId_id: { 
          teamId: tempTeamId,
          id: gift.id || 'none',
        }
      },
      update: {
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
        synced: false,
      },
      create: {
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
        synced: false,
        teamId: tempTeamId
      },
    })
  }

export async function POST(req: Request) {
  try {
    console.log('API Route Handler - POST Sync Virtuous Gifts')
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response('Unauthorized', { status: 403 })
    }
    const { user } = session
    const json = await req.json()
    const body = giftBatchSchema.parse(json)
    const bodyJSON = {
        groups: [
          {
            conditions: [
              {
                parameter: 'Batch',
                operator: 'Is',
                value: body.batch_name,
              },
            ],
          },
        ],
        sortBy: 'Last Modified Date',
        descending: 'true',
      }
    const res = await virApiFetch('https://api.virtuoussoftware.com/api/Gift/Query/FullGift?skip=0&take=1000', 'POST', user.team.id, bodyJSON)

    const data = await res.json()

    console.log(data)

    data.list?.forEach((gift) => {
      upsertGift(gift, session.user.team.id)
    })


    return new Response(JSON.stringify(data))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    if (error instanceof RequiresProPlanError) {
      return new Response('Requires Pro Plan', { status: 402 })
    }

    return new Response(null, { status: 500 })
  }
}
