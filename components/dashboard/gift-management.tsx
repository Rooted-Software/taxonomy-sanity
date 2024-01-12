import { redirect } from 'next/navigation'

import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import {
  getDefaultJournal,
  getVirtuousGiftsWithSyncCheck,
} from '@/lib/feGiftBatches'
import { getCurrentUser } from '@/lib/session'
import { getVirtuousBatch, upsertGiftBatch } from '@/lib/virGifts'
import { getProjectAccountMappings } from '@/lib/virProjects'

import GiftManagementClientComponent from './gift-management-client'

// TODO: show sync date and view in FE in gift panel
// TODO: add note that any changes since sync date are not carried over

const getFeEnvironment = async (teamId) => {
  return await db.feSetting.findFirst({
    select: {
      id: true,
      environment_id: true,
    },
    where: {
      teamId: teamId,
    },
  })
}

export const metadata = {
  title: 'Review your data',
  description: 'Double Check Your Mapping Before Syncing.',
}

// get FE journal name based on user's default journal
const getFeJournalName = async (journalId, teamId) => {
  return await db.feJournal.findFirst({
    select: {
      journal: true,
      id: true,
    },
    where: {
      teamId: teamId,
      id: parseInt(journalId),
    },
  })
}

// Get Batches from Latest Gifts for Samples

export default async function GiftManagement({ searchParams }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const startDate =
    searchParams?.startDate ??
    twoWeeksAgo.toLocaleString('en-us', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  const endDate =
    searchParams?.endDate ??
    new Date().toLocaleString('en-us', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  const onlyUnsynced = searchParams?.onlyUnsynced !== 'false'

  const [
    feAccounts,
    mappings,
    gifts,
    feEnvironment,
    journalName,
    selectedBatch,
    defaultJournal,
  ] = await Promise.all([
    getFeAccountsFromBlackbaud(user.team.id),
    getProjectAccountMappings(user.team.id),
    getVirtuousGiftsWithSyncCheck(
      user.team.id,
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
    ),
    getFeEnvironment(user.team.id),
    getFeJournalName(user?.team.defaultJournal, user.team.id),
    searchParams?.batch
      ? getVirtuousBatch(user.team.id, searchParams.batch)
      : Promise.resolve(),
    getDefaultJournal(user.team),
  ])

  if (!feEnvironment) {
    redirect('/step2')
  }
  if (!journalName) {
    redirect('/step3')
  }

  const uniqueBatches = gifts.reduce(
    (acc, item) => (item.batch ? { [item.batch]: item.giftDate, ...acc } : acc),
    {}
  )
  const batches = await Promise.all(
    Object.entries(uniqueBatches).map(([gift, latestGift]) =>
      upsertGiftBatch(gift, user.teamId, latestGift)
    )
  )

  return (
    <GiftManagementClientComponent
      gifts={selectedBatch?.gifts ?? gifts}
      feAccounts={feAccounts}
      batches={batches}
      defaultCreditAccount={user?.team.defaultCreditAccount}
      defaultDebitAccount={user?.team.defaultDebitAccount}
      feEnvironment={feEnvironment.environment_id}
      journalName={journalName.journal}
      selectedBatch={selectedBatch}
      mappings={mappings}
      defaultJournal={defaultJournal}
      team={user.team}
      startDate={startDate}
      endDate={endDate}
      onlyUnsynced={onlyUnsynced}
    />
  )
}
