import { db } from '@/lib/db'
import { reFetch } from '@/lib/reFetch'

const mapFeAccount = (account, teamId) => ({
  account_id: account.account_id,
  account_number: account.account_number,
  description: account.description,
  prevent_data_entry: account.prevent_data_entry,
  prevent_posting_data: account.prevent_posting,
  class: account.class,
  cashflow: account.cashflow,
  working_capital: account.working_capital,
  custom_fields: account.custom_fields,
  default_transaction_codes: account.default_transaction_codes,
  date_added: null,
  added_by: account.added_by,
  date_modified: new Date(account.date_modified),
  modified_by: account.modified_by,
  updatedAt: new Date(),
  teamId: teamId,
})

export const getFeAccountsFromBlackbaud = async (teamId) => {
  const res = await reFetch(
    'https://api.sky.blackbaud.com/generalledger/v1/accounts',
    'GET',
    teamId
  )
  if (res.status !== 200) {
    throw new Error(`Unable to fetch accounts, ${res.status}`)
  } else {
    const data = await res.json()
    //console.log('accounts', data)
    return data.value.map((account) => mapFeAccount(account, teamId))
  }
}

export const getFeAccounts = async (teamId) => {
  return await db.feAccount.findMany({
    select: {
      account_id: true,
      account_number: true,
      description: true,
      class: true,
      cashflow: true,
      working_capital: true,
      default_transaction_codes: true,
    },
    where: {
      teamId: teamId,
    },
    orderBy: {
      description: 'asc',
    },
  })
}

export const upsertFeAccountFromId = async (accountId, teamId) => {
  console.log('in upsertFeAccountFromId')
  const res = await reFetch(
    `https://api.sky.blackbaud.com/generalledger/v1/accounts/${accountId}`,
    'GET',
    teamId
  )
  if (res.status !== 200) {
    throw new Error('Unable to get account')
  } else {
    const data = await res.json()
    await upsertFeAccount(data, teamId)
  }
}

export async function upsertFeAccount(account, teamId) {
  const create = mapFeAccount(account, teamId)
  const update = mapFeAccount(account, teamId)
  delete update['account_id']

  await db.feAccount.upsert({
    where: {
      account_id_teamId: {
        account_id: account.account_id,
        teamId: teamId,
      },
    },
    update,
    create,
  })

  console.log('Done upsert account')
}
