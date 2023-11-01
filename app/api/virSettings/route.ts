import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { apiKeySchema } from '@/lib/validations/apiKey'
import { getServerSession } from 'next-auth'
import * as z from 'zod'

export async function PATCH(req: Request) {
  console.log('APR Route Vir Settings')
  try {
    // Validate route params.

    const session = await getServerSession(authOptions)

    if (!session?.user || !session?.user.email || !session?.user?.team.id) {
      return new Response(null, { status: 403 })
    }
    const { user } = session

    // Get the request body and validate it.
    const json = await req.json()
    console.log('getting json')
    console.log(json)
    const body = apiKeySchema.parse(json)
    console.log(body)
    // Update the post.
    // TODO: Implement sanitization for content.
    const setting = await db.apiSetting.upsert({
      where: {
        teamId: user.team.id,
      },
      update: {
        virtuousAPI: body.apiKey,
      },
      create: {
        teamId: user.team.id,
        virtuousAPI: body.apiKey,
      },
    })

    const team = await db.team.update({
      where: {
        id: user.team.id,
      },
      data: {
        name: body.teamName,
      },
    })
    console.log(setting)
    return new Response(JSON.stringify(setting), { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error)
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

export async function POST(
  //this is used for testing an api key
  req: Request
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !session?.user.email || !session?.user?.team.id) {
    return new Response(null, { status: 403 })
  }
  const { user } = session

  // Get the request body and validate it.
  const json = await req.json()
  console.log('getting json')
  console.log(json)
  const body = apiKeySchema.parse(json)
  console.log(body)

  try {
    const params = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${body.apiKey}`,
      },
    }
    const res2 = await fetch(
      'https://api.virtuoussoftware.com/api/Organization/Current',
      params
    )

    if (res2.status !== 200) {
      console.log(
        'Initial response failed - this could indicate a malformed request'
      )
      console.log(res2)

      const data = await res2.json()
      console.log(data)

      return new Response(JSON.stringify(data))
    }
    const data = await res2.json()
    const resPermissions = await fetch(
      'https://api.virtuoussoftware.com/api/Permission',
      params
    )
    if (res2.status !== 200) {
      const permissionData = await resPermissions.json()
      console.log(permissionData)
      return new Response(JSON.stringify(permissionData))
    }

    const permissionData = await resPermissions.json()

    const hasGiftsRead = permissionData.find(
      (permission) =>
        permission.module === 'Gift' &&
        permission.action === 'Read' &&
        permission.allowed === true
    )
    const hasProjectsRead = permissionData.find(
      (permission) =>
        permission.module === 'Project' &&
        permission.action === 'Read' &&
        permission.allowed === true
    )
    data.permissions =
      hasGiftsRead !== undefined && hasProjectsRead !== undefined ? true : false
    return new Response(JSON.stringify(data))
  } catch (err) {
    console.log(err)
    console.log('Bigger issues than the refresh token')
    return { json: () => null, status: 409 }
  }
}
