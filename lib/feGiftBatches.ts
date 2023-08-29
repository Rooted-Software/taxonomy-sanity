import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { reFetch } from '@/lib/reFetch' 
import { getBatches} from '@/lib/virGifts'
import { any, number } from 'prop-types'

import { upsertFeAccount } from '@/lib/feAccounts'
import { getVirtuousProjects } from '@/lib/virProjects'
import { getFeAccounts } from '@/lib/feAccounts'
import { getProjectAccountMappings } from '@/lib/virProjects'
import { getVirtuousBatches} from '@/lib/virGifts'
import { Decimal } from '@prisma/client/runtime'
const util = require('util')      

export type DesignationType = {
    projectId: string;
    amountDesignated: number;
    
  };
  
  const giftBatchSchema = z.object({
    batchId: z.string(),
    batchName: z.string(),
  })

async function updateGiftBatch(batchName, reBatchNo, teamId) {
    return await db.giftBatch.update({
      where: {
        teamId_batch_name: { 
        batch_name: batchName,
        teamId: teamId
        }
      },
      data: {
        reBatchNo: reBatchNo,
        synced: true,
        syncedAt: new Date(),
      },
      select: {
        id: true,
      }
     
    })
  }
  
  async function createSyncHistory(batchId, status, duration ,teamId) {
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
  
  export async function getBatchGifts(teamId, batchName) {
    const gifts = await db.gift.findMany({
      select: {
        id: true,
        transactionId: true,
        giftType: true,
        giftDate: true,
        amount: true,
        batch: true,
        giftDesignations: true, 
        batch_name: true,
        synced: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        teamId: teamId,
        batch: batchName,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    return gifts
  }
     
export async function syncBatchGifts(teamId, batchId, userId?) {
  
    if (!teamId) {
      const user = await db.user.findUnique({
        where: { id: userId },
      })
      teamId = user?.teamId }
    if (!teamId) throw new Error('Team ID is required')

     console.log('POST RE Journal Entry Batches (test) API Route')
      const start = performance.now();

      const team = await db.team.findUnique({
        where: { id: teamId },
      })

      if (team === null || team.defaultJournal  === null || team.defaultCreditAccount  === null || team.defaultDebitAccount=== null) { 
        return {status: 'failure', message: 'not all required fields are set'}
      }
      const feAccountsData = getFeAccounts(teamId)
      const projectsData = getVirtuousProjects(teamId)
      const mappingData = getProjectAccountMappings(teamId)
      const batchData = getVirtuousBatches(teamId)
      const [projects, feAccounts, mappings, batches] = await Promise.all([projectsData, feAccountsData, mappingData, batchData])
      const defaultCreditAccount = parseInt(team.defaultCreditAccount)
      const defaultDebitAccount = parseInt(team.defaultDebitAccount)
      console.log('default credit account')
      console.log(defaultCreditAccount)

      function lookupProject(projectId) { 
        const project = projects.find(p => p.project_id === projectId)
        return project?.name
      }

      function lookupProjectId(projectId) { 
        const project = projects.find(p => p.id === projectId)

        return project?.name
      }

      function lookupAccount(accountId) { 
        const account = feAccounts.find(a => a.account_id === accountId)
        return account?.description
      }

      function lookupAccountNumber(accountId) { 
        const account = feAccounts.find(a => a.account_id === accountId)
        return account?.account_number
      }

      function lookupAccountTransactionCodes(accountId) { 
        const account = feAccounts.find(a => a.account_id === accountId)
        return account?.default_transaction_codes
      }

      function lookupMapping(projectId) { 
        const mapping = mappings.find(m => m.virProjectId === projectId)
        console.log(mapping)
        if (!mapping) { lookupAccount(defaultCreditAccount)} 
        return lookupAccountNumber(mapping?.feAccountId)
      }

      function lookupMappingTransCode(projectId) { 
        const mapping = mappings.find(m => m.virProjectId === projectId)
        console.log(mapping)
        if (!mapping || mapping===null) { lookupAccount(defaultCreditAccount)} 
        return lookupAccountTransactionCodes(mapping?.feAccountId)
      }

      // get batch number 
      const batch = await db.giftBatch.findUnique({
        where: { id: batchId },
      })
      console.log('should have batch no')
      if (batch && batch?.batch_name !==null) { 
      const gifts = await getBatchGifts(team.id, batch.batch_name)
      console.log(gifts)
      var journalEntries = [] as Array<any>
      console.log(team.defaultJournal);
      const defaultJournal = await db.feJournal.findUnique({where: {
          teamId_id: { 
          id: parseInt(team.defaultJournal),
          teamId: team.id
          }, 
          
        },
        select: { 
          id: true,
          code: true,
          journal: true
        }
      })
      console.log(defaultJournal);
      var batchTotal: number = 0.00;
      
      gifts.forEach((gift) => {
        
        var totalDesignations: number =0.00;  
        batchTotal = gift.amount !==null ? batchTotal + gift.amount.toNumber() : batchTotal;
        //create default distribution for gift
     
        console.log('initial distributions')
        console.log(distributions)
        var overflowDistributions = [] as Array<any>
        overflowDistributions.push(
          {

           
            "transaction_code_values": lookupAccountTransactionCodes(defaultCreditAccount), //lookup default transaction codes
            "percent": 100.0,
            "amount": gift && gift.amount ? gift.amount.toNumber() : 0,
        })
        console.log('overflow distributions')
        console.log(gift.giftDesignations)
        console.log(typeof(gift.giftDesignations))
        if (gift && gift.giftDesignations && gift.giftDesignations !== null && gift.giftDesignations !== undefined && typeof(gift.giftDesignations)==="object" && gift.giftDesignations.length && gift.giftDesignations.length > 0 && Array.isArray(gift.giftDesignations)) { 
          gift?.giftDesignations?.forEach((designation: DesignationType): void => {

          if (designation && typeof designation === "object" && designation.hasOwnProperty('projectId') && designation.hasOwnProperty('amountDesignated')) {
          var subDistributions = [] as Array<any>
       
          subDistributions.push(
            {

             
              "transaction_code_values": designation && designation?.projectId !==undefined  && designation?.projectId !==null ? lookupMappingTransCode(designation?.projectId) : {}, //lookup default transaction codes
              "percent": 100.0,
              "amount": gift.amount?.toNumber(),
          })
        
          totalDesignations= totalDesignations + (designation?.amountDesignated || 0);
          journalEntries.push(
            {
              type_code: "Credit",
              account_number: lookupMapping(designation?.projectId), //lookup account
              post_date: "2018-07-02T00:00:00Z",
              encumbrance: "Regular",
              journal: defaultJournal?.journal, //lookup default journal
              reference: "Re-Sync",
              amount: designation && designation.amountDesignated ? designation.amountDesignated : 0,
              notes: "From Re-Sync",
              distributions: subDistributions
            }
            )}
          })
          // if we don't have enough designations to cover the gift, create a default entry for the remainder
          if (gift.amount && (totalDesignations < (gift?.amount.toNumber() || 0))) { 
            journalEntries.push(
              {
                type_code: "Credit",
                account_number: lookupAccountNumber(defaultCreditAccount), //lookup account
                post_date: "2018-07-02T00:00:00Z",
                encumbrance: "Regular",
                journal: defaultJournal?.journal, //lookup default journal
                reference: "Re-Sync",
                amount: gift?.amount.toNumber()  - totalDesignations,
                notes: "From Re-Sync",
                distributions: overflowDistributions
              }
              )
          }
        } else { 
            // just push one entry if there are no designations
            journalEntries.push(
              {
                type_code: "Credit",
                account_number: lookupAccountNumber(defaultCreditAccount), //lookup account
                post_date: "2018-07-02T00:00:00Z",
                encumbrance: "Regular",
                journal: defaultJournal?.journal, //lookup default journal
                reference: "Re-Sync",
                amount:  gift?.amount?.toNumber() || 0,
                notes: "From Re-Sync",
                distributions: overflowDistributions
              }
              )
          }
      })
      var distributions = [] as Array<any>
      distributions.push(
        {
      
          "transaction_code_values": lookupAccountTransactionCodes(defaultDebitAccount), //lookup default transaction codes
          "percent": 100.0,
          "amount":batchTotal,
      })
          journalEntries.push(
            {
              type_code: "Debit",
              account_number: lookupAccountNumber(defaultDebitAccount), //lookup account
              post_date: "2018-07-02T00:00:00Z",
              encumbrance: "Regular",
              journal: defaultJournal?.journal, //lookup default journal
              reference: "Re-Sync",
              amount: batchTotal,
              notes: "From Re-Sync",
              distributions: distributions
            }
            )
        const bodyJson = 
          {
            description: batch.batch_name,
            batch_status: "Open",
            create_interfund_sets: true,
            create_bank_account_adjustments: true,
            journal_entries: journalEntries
          }
        console.log(util.inspect(bodyJson, false, null, true /* enable colors */));
        console.log('journal entries')
        console.log(journalEntries)
        const res2 = await reFetch('https://api.sky.blackbaud.com/generalledger/v1/journalentrybatches','POST', team.id, bodyJson)
        var synced= false;
        var status= 'failed'
        console.log("back from call")
        console.log(res2)
        const data = await res2.json();
        console.log('this is the data')
        console.log(data) 
        var info =<any> null;
        if (res2.status === 200) {
          // update batch status
          
          info  = await  updateGiftBatch(batch.batch_name, data.record_id , team.id)

          synced = true;
          status = 'success'
      }
      const end = performance.now();
      const total = end-start;
      console.log (Math.trunc(total /1000))
      console.log(info)
      createSyncHistory(info.id,  status, Math.trunc(total /1000), team.id)
    }
    return {status: 'success', message: 'sync complete'}
    }