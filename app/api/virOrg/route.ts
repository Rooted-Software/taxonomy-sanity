
import { authOptions } from '@/lib/auth'
import { absoluteUrl } from '@/lib/utils'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { virApiFetch } from '@/lib/virApiFetch'



export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('Virtuous Orgs - API Route')
    try {
        const res = await virApiFetch('https://api.virtuoussoftware.com/api/Organization/Current', 'GET', user.team.id)

          console.log('after virApiFetch')
          console.log(res.status)
          if (res.status !== 200) {
            console.log('returning status')
            return new Response(null, { status: 429 })
          }
          console.log('returning data')
          const data = await res.json()
          console.log(data)
          /*
          data?.list.forEach((project) => {
         
          })*/
      return new Response(JSON.stringify([data]));
    } catch (error) {
        return new Response(JSON.stringify(error.issues), { status: 422 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    return new Response(null, { status: 500 })
  }
}


const userUpdateSchema = z.object({
  selectValue: z.string().optional(),
})


export async function POST(
req: Request,
) {
try {
  const session = await getServerSession(authOptions)
  
  if (!session) {
      return new Response(null, { status: 403 })
  }

  const { user } = session


  // Get the request body and validate it.
  // TODO: Implement sanitization for content.
  
  const json = await req.json()
  console.log(json)
  
  const body = userUpdateSchema.parse(json)
  console.log(body)
  const org = {
    "organizationUserId": body.selectValue
  }
  const res2 = await virApiFetch('https://api.virtuoussoftware.com/api/Organization/Switch', 'PUT', user.team.id, org)
  const body2 = null
  const res3 = await virApiFetch('https://api.virtuoussoftware.com/api/Organization/Current', 'GET', user.team.id, body2)
  console.log('after virApiFetch of new org ')
  const data = await res3.json()
  console.log(data)
  const userSettings = await db.team.update({
    where: {
      id: user.team.id,
    },
    data: {
      virtuousOrg: data.organizationUserId.toString(),
      virtuousOrgName: data.organizationName,
      virtuousOrgTimeZone: data.organizationTimeZone,
    },
    select: {
      id: true
    }
  })
  
  return new Response(null, { status: 200 })
} catch (error) {
  if (error instanceof z.ZodError) {
    return new Response(JSON.stringify(error.issues), { status: 422 })
  }

  return new Response(null, { status: 500 })
}
}