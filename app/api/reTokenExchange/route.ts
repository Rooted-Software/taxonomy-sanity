import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth/next'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import * as z from 'zod'

export async function POST(req: Request) {
  const body = await req.json()
  const session = await getServerSession(authOptions)
  if (!session?.user || !session?.user.email) {
    return new Response(null, { status: 403 })
  }

  const { user } = session
  console.log('api FE Token Exchange ')
  console.log(user)

  const authStuff = `Basic ${Buffer.from(
    process.env.AUTH_CLIENT_ID + ':' + process.env.AUTH_CLIENT_SECRET
  ).toString('base64')}`
  const bodyStuff = `grant_type=authorization_code&redirect_uri=${encodeURI(
    process.env.AUTH_REDIRECT_URI || ''
  )}&code=${body?.code}`
  console.log(authStuff)
  console.log(bodyStuff)
  const res2 = await fetch('https://oauth2.sky.blackbaud.com/token', {
    method: 'POST',
    headers: {
      Authorization: authStuff,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: bodyStuff,
  })
  console.log('after auth')
  console.log(res2.status)
  console.log(res2)
  if (res2.status !== 200) {
    console.log('returning status')
    return new Response(null, { status: 405 })
  }
  const data = await res2.json()
  console.log(data)
  if (user) {
    // save some data
    const reSettings = await db.feSetting.findFirst({
      where: {
        teamId: user.team.id,
      },
    })
    let reSettingsData = {
      teamId: user.team.id,
      token_type: data.token_type,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token,
      access_token: data.access_token,
      environment_id: data.environment_id,
      environment_name: data.environment_name,
      legal_entity_id: data.legal_entity_id,
      legal_entity_name: data.legal_entity_name,
      user_id: data.user_id,
      email: data.email,
      family_name: data.family_name,
      given_name: data.given_name,
      refresh_token_expires_in: data.refresh_token_expires_in,
      mode: data.mode,
      scope: data.scope,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (!reSettings) {
      console.log('no reSettings found')
      // create new reSettings

      console.log('')
      const newAccount = await db.feSetting.create({
        data: reSettingsData,
        select: {
          id: true,
        },
      })
    } else {
      console.log('updating reSettings')
      // update account (with tokens)
      console.log(reSettings.id)
      const updatedAccount = await db.feSetting.update({
        where: {
          id: reSettings.id,
        },
        data: reSettingsData,
      })
    }
  } else {
    //no user found
    return new Response(null, { status: 403 })
  }

  return new Response(null, { status: 200 })
}
