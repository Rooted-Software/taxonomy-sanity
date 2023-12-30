import {
  FeAccount,
  FeJournal,
  ProjectAccountMapping,
  Team,
} from '@prisma/client'
import { JsonValue } from '@prisma/client/runtime/library'

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
  gift_id?: string
  designation_project?: string
  gift_synced?: boolean
}

export function createJournalEntries(
  gifts: any[],
  feAccounts: Partial<FeAccount>[],
  mappings: Partial<ProjectAccountMapping>[],
  defaultJournal: Pick<FeJournal, 'id' | 'code' | 'journal'> | null,
  team: Team,
  includeVirtuousFields = false
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
            ...(includeVirtuousFields
              ? {
                  gift_id: gift.id,
                  gift_synced: gift.synced,
                  designation_project: designation.project,
                }
              : {}),
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
          ...(includeVirtuousFields
            ? {
                gift_id: gift.id,
                gift_synced: gift.synced,
              }
            : {}),
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
        ...(includeVirtuousFields
          ? {
              gift_id: gift.id,
              gift_synced: gift.synced,
            }
          : {}),
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
        post_date: new Date().toISOString(),
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
