
import { authOptions } from '@/lib/auth'
import { absoluteUrl } from '@/lib/utils'
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

async function createSyncHistory(batchId, status, duration ,teamId, userId) {
  await db.syncHistory.create({
    data: {
      teamId: teamId,
      giftBatchId: batchId,
      syncType: 'manual',
      syncMessage: status,
      syncStatus: status,
      syncDuration: duration,
      syncDate: new Date(),
      userId: userId,
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



export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
 


    const res2 = await reFetch('https://api.sky.blackbaud.com/generalledger/v1/projects','GET', user.team.id)
    console.log(res2.status)
    if (res2.status !== 200) {
        console.log('returning status')
        return res2;
        }
    console.log('returning something else')
    const data = await res2.json()

    return new Response(JSON.stringify(data));
    } catch (error) {
    if (error instanceof z.ZodError) {
        return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}




export async function POST(req: Request) {
    try {
      const session = await getServerSession(authOptions)
      if (!session) {
        return new Response('Unauthorized', { status: 403 })
      }
      const { user } = session
      console.log('POST RE Journal Entry Batches (test) API Route')
      const start = performance.now();
      const feAccountsData = getFeAccounts(user)
      const projectsData = getVirtuousProjects(user)
      const mappingData = getProjectAccountMappings(user)
      const batchData = getVirtuousBatches(user)
      const [projects, feAccounts, mappings, batches] = await Promise.all([projectsData, feAccountsData, mappingData, batchData])
      const defaultCreditAccount = parseInt(user?.team.defaultCreditAccount)
      const defaultDebitAccount = parseInt(user?.team.defaultDebitAccount)
      console.log('default credit account')
      console.log(defaultCreditAccount)
      console.log(defaultDebitAccount)

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

      function lookupAccountClass(accountId) { 
        const account = feAccounts.find(a => a.account_id === accountId)
        return account?.class
      }

      function lookupAccountClassByAcctNo(accountNo) { 
        const account = feAccounts.find(a => a.account_number === accountNo)
        return account?.class
      }

      function lookupAccountTransactionCodes(accountId) { 
        const account = feAccounts.find(a => a.account_id === accountId)
        return account?.default_transaction_codes
      }

      function lookupMapping(projectId) {
        console.log('project id: ' + projectId)
        console.log(typeof(projectId))
        const tempProj = projects.find(p => p.id === projectId)
        console.log(tempProj)
        const mapping = mappings.find(m => m.virProjectId === tempProj?.project_id)
        console.log('mapping found?')
        console.log(mapping)
        if (!mapping || mapping===undefined || mapping===null) { 
            console.log('mapping not found -- looking up default credit account')
            return lookupAccountNumber(defaultCreditAccount)
          } 
        return lookupAccountNumber(mapping?.feAccountId)
      }

      function lookupMappingTransCode(projectId) { 
        const tempProj = projects.find(p => p.id == projectId)
        console.log(tempProj)
        console.log(typeof(tempProj))
        const mapping = mappings.find(m => m.virProjectId == tempProj?.project_id)
        console.log(mapping)
        if (!mapping || mapping===null || mapping===undefined) { 
          console.log(defaultCreditAccount)
            return lookupAccountTransactionCodes(defaultCreditAccount)
          }
        return lookupAccountTransactionCodes(mapping?.feAccountId)
      }

      const json = await req.json()
      const body = giftBatchSchema.parse(json)
      console.log('should have batch no')
      console.log(body)
      const gifts = await getBatchGifts(user.team.id, body.batchName)
      console.log(gifts)
      var journalEntries = [] as Array<any>
      console.log(user.team.defaultJournal);
      const defaultJournal = await db.feJournal.findUnique({where: {
          teamId_id: { 
          id: parseInt(user.team.defaultJournal),
          teamId: user.team.id
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
      gifts.forEach((gift, index) => {
        var totalDesignations: number =0.00;  
        batchTotal = gift.amount !==null ? batchTotal + gift.amount.toNumber() : batchTotal;
        //create default distribution for gift
        console.log(`***********   Gift ${index}   ********** `)
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
          console.log('designation')
          console.log(designation)
          const accno = lookupMapping(designation?.projectId)
          
          journalEntries.push(
            {
              type_code: "Credit",
              account_number: accno, //lookup account
              post_date: "2018-07-02T00:00:00Z",
              encumbrance: "Regular",
              journal: defaultJournal?.journal, //lookup default journal
              reference: "DonorSync",
              amount: designation && designation.amountDesignated ? designation.amountDesignated : 0,
              notes: "From DonorSync",
              class: lookupAccountClassByAcctNo(accno), 
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
                class: lookupAccountClass(defaultCreditAccount),
                post_date: "2018-07-02T00:00:00Z",
                encumbrance: "Regular",
                journal: defaultJournal?.journal, //lookup default journal
                reference: "DonorSync",
                amount: gift?.amount.toNumber()  - totalDesignations,
                notes: "From DonorSync",
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
                class: lookupAccountClass(defaultCreditAccount),
                post_date: "2018-07-02T00:00:00Z",
                encumbrance: "Regular",
                journal: defaultJournal?.journal, //lookup default journal
                reference: "DonorSync",
                amount:  gift?.amount?.toNumber() || 0,
                notes: "From DonorSync",
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
              class: lookupAccountClass(defaultDebitAccount),
              post_date: "2018-07-02T00:00:00Z",
              encumbrance: "Regular",
              journal: defaultJournal?.journal, //lookup default journal
              reference: "DonorSync",
              amount: batchTotal,
              notes: "From DonorSync",
              distributions: distributions
            }
            )
        const bodyJson = 
          {
            description: body.batchName,
            batch_status: "Open",
            create_interfund_sets: true,
            create_bank_account_adjustments: true,
            journal_entries: journalEntries
          }
        console.log(util.inspect(bodyJson, false, null, true /* enable colors */));
        console.log('journal entries')
        console.log(journalEntries)
        const res2 = await reFetch('https://api.sky.blackbaud.com/generalledger/v1/journalentrybatches','POST', user.team.id, bodyJson)
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
          
          info  = await  updateGiftBatch(body.batchName, data.record_id , user.team.id)

          synced = true;
          status = 'success'
      }
      const end = performance.now();
      const total = end-start;
      console.log (Math.trunc(total /1000))
      console.log(info)
      createSyncHistory(info.id,  status, Math.trunc(total /1000), user.team.id, user.id)
        
      
      return new Response(JSON.stringify({synced: synced, record_id: data?.record_id}), {status: 200 })
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error);
        return new Response(JSON.stringify(error.issues), { status: 422 })
      }

      return new Response(null, { status: 500 })
    }
  }
