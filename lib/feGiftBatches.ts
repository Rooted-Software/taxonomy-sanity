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

  const feAccountsData = getFeAccounts(teamId)
  const mappingData = getProjectAccountMappings(teamId)
  const [feAccounts, mappings] = await Promise.all([
    feAccountsData,
    mappingData,
  ])
  const defaultCreditAccount = parseInt(team.defaultCreditAccount)
  const defaultDebitAccount = parseInt(team.defaultDebitAccount)
  console.log('default credit account')
  console.log(defaultCreditAccount)

  function lookupAccount(accountId) {
    const account = feAccounts.find((a) => a.account_id === accountId)
    return account?.description
  }

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

  function lookupMapping(projectId) {
    const mapping = mappings.find((m) => m.virProjectId === projectId)
    console.log(mapping)
    if (!mapping) {
      console.log('mapping not found -- looking up default credit account')
      return lookupAccountNumber(defaultCreditAccount)
    }
    return lookupAccountNumber(mapping.feAccountId)
  }

  function lookupMappingTransCode(projectId) {
    const mapping = mappings.find((m) => m.virProjectId === projectId)
    console.log(mapping)
    if (!mapping) {
      console.log(defaultCreditAccount)
      return lookupAccountTransactionCodes(defaultCreditAccount)
    }
    return lookupAccountTransactionCodes(mapping.feAccountId)
  }

  // get batch number
  const batch = await getVirtuousBatch(teamId, batchId)
  console.log('should have batch no')
  if (batch) {
    const gifts = batch.gifts
    console.log(gifts)
    var journalEntries = [] as Array<any>
    console.log(team.defaultJournal)
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
    console.log(defaultJournal)
    var batchTotal: number = 0.0

    gifts.forEach((gift) => {
      var totalDesignations: number = 0.0
      batchTotal += gift?.amount || 0

      // Create default distribution for gift
      console.log('initial distributions')
      console.log(distributions)
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

            subDistributions.push({
              transaction_code_values:
                designation &&
                designation?.projectId !== undefined &&
                designation?.projectId !== null
                  ? lookupMappingTransCode(designation?.projectId)
                  : {}, //lookup default transaction codes
              percent: 100.0,

              amount:
                designation && designation.amountDesignated
                  ? designation.amountDesignated
                  : 0,
            })

            totalDesignations += designation?.amountDesignated || 0
            const accno = lookupMapping(designation?.projectId)

            journalEntries.push({
              type_code: 'Credit',
              account_number: accno, //lookup account
              post_date: '2018-07-02T00:00:00Z',
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
          }
        })
        // if we don't have enough designations to cover the gift, create a default entry for the remainder
        if (gift?.amount && totalDesignations < gift.amount) {
          journalEntries.push({
            type_code: 'Credit',
            account_number: lookupAccountNumber(defaultCreditAccount), //lookup account
            class: lookupAccountClass(defaultCreditAccount),
            post_date: '2018-07-02T00:00:00Z',
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
          post_date: '2018-07-02T00:00:00Z',
          encumbrance: 'Regular',
          journal: defaultJournal?.journal, //lookup default journal
          reference: 'DonorSync',
          amount: gift?.amount || 0,
          notes: 'From DonorSync',
          distributions: overflowDistributions,
        })
      }
    })
    var distributions = [] as Array<any>
    distributions.push({
      transaction_code_values:
        lookupAccountTransactionCodes(defaultDebitAccount), //lookup default transaction codes
      percent: 100.0,
      amount: batchTotal,
    })
    journalEntries.push({
      type_code: 'Debit',
      account_number: lookupAccountNumber(defaultDebitAccount), //lookup account
      class: lookupAccountClass(defaultDebitAccount),
      post_date: '2018-07-02T00:00:00Z',
      encumbrance: 'Regular',
      journal: defaultJournal?.journal, //lookup default journal
      reference: 'DonorSync',
      amount: batchTotal,
      notes: 'From DonorSync',
      distributions: distributions,
    })
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
