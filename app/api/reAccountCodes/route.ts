
import { authOptions } from '@/lib/auth'
import { absoluteUrl } from '@/lib/utils'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { reFetch } from '@/lib/reFetch'

async function upsertAccount(account, userId) {
  await db.feAccountCode.upsert({
    where: {
      userId_account_code_id: { 
        account_code_id: account.account_code_id,
        userId: userId
      },
    },
    update: {
      value: account.value,
      category: account.category,
      class:  account.class,
      is_contra: account.is_contra,
      is_control: account.is_control, 
      description: account.description
     
    },
    create: {
      account_code_id: account.account_code_id,
      value: account.value,
      category: account.category,
      class:  account.class,
      is_contra: account.is_contra,
      is_control: account.is_control, 
      description: account.description,
      userId: userId
    },
  })
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('RE Accounts')
    try {
      const res2 = await reFetch('https://api.sky.blackbaud.com/generalledger/v1/accounts/codes','GET', user.team.id
      )
      console.log('after form')
      console.log(res2.status)
      if (res2.status !== 200) {
        console.log('returning status')
        return res2;
      }
      console.log('returning something else')
      const data = await res2.json()
      data?.value.forEach((account) => {
        upsertAccount(account, session.user.id)
      })
      return new Response(JSON.stringify(data.value));
    } catch (error) {
      return error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}








