'use server'

import {
  syncBatchGifts,
  syncGiftsInDateRange,
  syncSelectedGifts,
} from './feGiftBatches'
import { getCurrentUser } from './session'

export async function syncBatchGiftsPublic(
  batchName: string,
  onlyUnsynced = false
) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Invalid session')
  return syncBatchGifts(user.teamId, batchName, onlyUnsynced)
}

export async function syncGiftsInDateRangePublic(
  startDate: string,
  endDate: string,
  onlyUnsynced = false
) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Invalid session')
  return syncGiftsInDateRange(user.teamId, startDate, endDate, onlyUnsynced)
}

export async function syncSelectedGiftsPublic(
  giftIds: string[],
  description: string,
  onlyUnsynced = false
) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Invalid session')
  return syncSelectedGifts(user.teamId, giftIds, description, onlyUnsynced)
}
