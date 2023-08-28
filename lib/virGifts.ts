import { db } from '@/lib/db'
import { virApiFetch } from './virApiFetch'


export const getBatches = async (user) => {
    return await db.giftBatch.findMany({
      select: {
        id: true,
        batch_name: true,
        synced: true,
        syncedAt: true,
        reBatchNo: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        teamId: user.team.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }



// attempt to get batches, but if there are none, request them from Virtuous
export const getVirtuousBatches = async (user) => {
    let batches = await getBatches(user)
      var today = new Date();
      today.setDate(today.getDate() - 1);
      if (batches.length < 1000 || (new Date (batches[0].updatedAt) <  today )) {
        console.log('no initial batches or stale batches...querying virtuous')
        const body = {
            groups: [
              {
                conditions: [],
              },
            ],
            sortBy: 'Last Modified Date',
            descending: 'true',
          }
      
    const res = await virApiFetch('https://api.virtuoussoftware.com/api/Gift/Query/FullGift?skip=0&take=1000', 'POST', user.team.id, body)

    
    if (res.status !== 200) {
        console.log('the request to Virtuous Gift Endpoint failed')
       
    }
    const data = await res.json()
 
    const unique = [
      ...new Set(data?.list?.map((item) => item.batch || 'none')),
    ] // [ 'A', 'B']
    console.log(unique)

    unique.forEach((gift: string) => {
      upsertGiftBatch(gift, user.team.id)
    })
  }
  return await getBatches(user)
}

  export async function upsertGiftBatch(gift: string, teamId) {
    await db.giftBatch.upsert({
      where: {
        teamId_batch_name: { 
          teamId: teamId,
          batch_name: gift || 'none',
        }
      },
      update: {
        batch_name: gift || 'none',
      },
      create: {
        teamId: teamId,
        batch_name: gift || 'none',
        synced: false,
      },
    })
  }