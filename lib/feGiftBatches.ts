import { FeAccount, ProjectAccountMapping, Team } from '@prisma/client'
import { JsonValue } from '@prisma/client/runtime/library'
import { formatISO } from 'date-fns'
import { z } from 'zod'

import { db } from '@/lib/db'
import { getFeAccounts } from '@/lib/feAccounts'
import { reFetch } from '@/lib/reFetch'
import { getVirtuousBatch, insertGifts } from '@/lib/virGifts'
import { getProjectAccountMappings } from '@/lib/virProjects'

const util = require('util')

export type DesignationType = {
  projectId: string
  amountDesignated: number
}

const giftBatchSchema = z.object({
  batchId: z.string(),
  batchName: z.string(),
})

async function updateGiftBatch(batchName, reBatchNo, teamId) {
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

async function createSyncHistory(batchId, status, duration, teamId) {
  await db.syncHistory.create({
    data: {
      teamId: teamId,
      giftBatchId: batchId,
      syncType: 'automatic',
      syncMessage: status,
      syncStatus: status,
      syncDuration: duration,
      syncDate: new Date(),
    },
  })
}

export type JournalEntry = {
  type_code: 'Credit' | 'Debit'
  account_number?: string
  post_date: string
  encumbrance: string
  journal?: string
  reference: string
  amount: number
  notes: string
  class?: string | null
  distributions: {
    transaction_code_values?: JsonValue
    percent: number
    amount: number
  }[]
}

export async function createJournalEntries(
  gifts: any[],
  feAccounts: Partial<FeAccount>[],
  mappings: Partial<ProjectAccountMapping>[],
  team: Team
) {
  function lookupAccountNumber(accountId) {
    const account = feAccounts.find((a) => a.account_id === accountId)
    if (!account) {
      console.error(`Could not find FE account for ID: ${accountId}`)
    }
    return account?.account_number
  }

  function lookupAccountClass(accountId) {
    const account = feAccounts.find((a) => a.account_id === accountId)
    return account?.class
  }

  function lookupAccountClassByAcctNo(accountNo) {
    const account = feAccounts.find((a) => a.account_number === accountNo)
    return account?.class
  }

  function lookupAccountTransactionCodes(accountId) {
    const account = feAccounts.find((a) => a.account_id === accountId)
    return account?.default_transaction_codes
  }

  const journalEntries = [] as JournalEntry[]

  if (
    team === null ||
    team.defaultJournal === null ||
    team.defaultCreditAccount === null ||
    team.defaultDebitAccount === null
  ) {
    throw new Error('Team missing required fields')
  }

  const defaultJournal = await db.feJournal.findUnique({
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

  const defaultCreditAccount = parseInt(team.defaultCreditAccount)
  const defaultDebitAccount = parseInt(team.defaultDebitAccount)

  const debitByAccount = {}
  const addDebitToAccount = (accountId: number, amount: number) => {
    debitByAccount[accountId] = (debitByAccount[accountId] ?? 0) + amount
  }

  gifts.forEach((gift) => {
    var totalDesignations: number = 0.0
    let totalDesignationDebits = 0

    // Create default distribution for gift
    var overflowDistributions = [] as Array<any>
    overflowDistributions.push({
      transaction_code_values:
        lookupAccountTransactionCodes(defaultCreditAccount), //lookup default transaction codes
      percent: 100.0,
      amount: gift?.amount || 0,
    })
    console.log('overflow distributions')
    console.log(gift.giftDesignations)
    console.log(typeof gift.giftDesignations)
    if (
      Array.isArray(gift?.giftDesignations) &&
      gift.giftDesignations.length > 0
    ) {
      gift?.giftDesignations?.forEach((designation: any): void => {
        if (
          designation &&
          typeof designation === 'object' &&
          designation.hasOwnProperty('projectId') &&
          designation.hasOwnProperty('amountDesignated')
        ) {
          var subDistributions = [] as Array<any>

          const mapping = designation?.projectId
            ? mappings.find((m) => m.virProjectId === designation.projectId)
            : null
          console.log(mapping)
          const creditAccountId = mapping?.feAccountId ?? defaultCreditAccount
          const accno = lookupAccountNumber(creditAccountId)
          const transaction_code_values =
            lookupAccountTransactionCodes(creditAccountId)

          subDistributions.push({
            transaction_code_values,
            percent: 100.0,
            amount:
              designation && designation.amountDesignated
                ? designation.amountDesignated
                : 0,
          })

          totalDesignations += designation?.amountDesignated || 0

          // Handle credits
          journalEntries.push({
            type_code: 'Credit',
            account_number: accno, //lookup account
            post_date: gift.giftDate,
            encumbrance: 'Regular',
            journal: defaultJournal?.journal, //lookup default journal
            reference: 'DonorSync',
            amount:
              designation && designation.amountDesignated
                ? designation.amountDesignated
                : 0,
            notes: 'From DonorSync',
            class: lookupAccountClassByAcctNo(accno),
            distributions: subDistributions,
          })

          // Handle debits from mapping
          if (designation && designation.amountDesignated) {
            if (mapping?.feDebitAccountForGiftType?.[gift.giftType]) {
              totalDesignationDebits += designation.amountDesignated
              addDebitToAccount(
                mapping.feDebitAccountForGiftType[gift.giftType],
                designation.amountDesignated
              )
            } else if (mapping?.feDebitAccountId) {
              totalDesignationDebits += designation.amountDesignated
              addDebitToAccount(
                mapping.feDebitAccountId,
                designation.amountDesignated
              )
            }
          }
        }
      })

      // if we don't have enough designations to cover the gift, create a default entry for the remainder
      if (gift?.amount && totalDesignations < gift.amount) {
        journalEntries.push({
          type_code: 'Credit',
          account_number: lookupAccountNumber(defaultCreditAccount), //lookup account
          class: lookupAccountClass(defaultCreditAccount),
          post_date: gift.giftDate,
          encumbrance: 'Regular',
          journal: defaultJournal?.journal, //lookup default journal
          reference: 'DonorSync',
          amount: gift?.amount - totalDesignations,
          notes: 'From DonorSync',
          distributions: overflowDistributions,
        })
      }
    } else {
      // just push one entry if there are no designations
      journalEntries.push({
        type_code: 'Credit',
        account_number: lookupAccountNumber(defaultCreditAccount), //lookup account
        class: lookupAccountClass(defaultCreditAccount),
        post_date: gift.giftDate,
        encumbrance: 'Regular',
        journal: defaultJournal?.journal, //lookup default journal
        reference: 'DonorSync',
        amount: gift?.amount || 0,
        notes: 'From DonorSync',
        distributions: overflowDistributions,
      })
    }

    // Handle debits by gift type that weren't handled by mapping
    if (team.defaultDebitAccountForGiftType?.[gift.giftType]) {
      addDebitToAccount(
        team.defaultDebitAccountForGiftType[gift.giftType],
        gift.amount - totalDesignationDebits
      )
    } else {
      addDebitToAccount(
        defaultDebitAccount,
        gift.amount - totalDesignationDebits
      )
    }
  })

  // Create one debit per account
  Object.keys(debitByAccount).forEach((accountIdStr) => {
    const accountId = parseInt(accountIdStr)
    const account = feAccounts.find((a) => a.account_id === accountId)
    if (account) {
      journalEntries.push({
        type_code: 'Debit',
        account_number: account?.account_number,
        class: account.class,
        post_date: formatISO(new Date()),
        encumbrance: 'Regular',
        journal: defaultJournal?.journal,
        reference: 'DonorSync',
        amount: debitByAccount[accountId],
        notes: 'From DonorSync',
        distributions: [
          {
            transaction_code_values: account.default_transaction_codes,
            percent: 100.0,
            amount: debitByAccount[accountId],
          },
        ],
      })
    } else {
      console.error(`Couldn't find FE account for ID ${accountId}`)
    }
  })

  return journalEntries
}

export async function syncBatchGifts(teamId: string, batchId: string) {
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

  const [feAccounts, mappings] = await Promise.all([
    getFeAccounts(teamId),
    getProjectAccountMappings(teamId),
  ])

  // get batch number
  const batch = await getVirtuousBatch(teamId, batchId)
  if (batch) {
    const gifts = batch.gifts
    console.log(gifts)

    const journalEntries = await createJournalEntries(
      gifts,
      feAccounts,
      mappings,
      team
    )

    const bodyJson = {
      description: batch.batch_name,
      batch_status: 'Open',
      create_interfund_sets: true,
      create_bank_account_adjustments: true,
      journal_entries: journalEntries,
    }
    console.log(util.inspect(bodyJson, false, null, true /* enable colors */))
    console.log('journal entries')
    console.log(journalEntries)
    const res2 = await reFetch(
      'https://api.sky.blackbaud.com/generalledger/v1/journalentrybatches',
      'POST',
      team.id,
      bodyJson
    )
    var status = 'failed'
    console.log('back from call')
    console.log(res2)
    const data = await res2.json()
    console.log('this is the data')
    console.log(data)
    if (res2.status === 200) {
      // update batch status and add synced gifts to DB
      await Promise.all([
        updateGiftBatch(batch.batch_name, data.record_id, team.id),
        insertGifts(gifts, team.id, batch.batch_name),
      ])

      status = 'success'
    }
    const end = performance.now()
    const total = end - start
    console.log(Math.trunc(total / 1000))
    createSyncHistory(batchId, status, Math.trunc(total / 1000), team.id)
    return { status, message: 'sync complete', record_id: data?.record_id }
  }
  return { status: 'failed', message: 'batch does not exist' }
}
