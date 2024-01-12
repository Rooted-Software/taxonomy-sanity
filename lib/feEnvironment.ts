import { db } from '@/lib/db'

export const getFeEnvironment = async (teamId) => {
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

export const getFeJournalName = async (journalId, teamId) => {
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
