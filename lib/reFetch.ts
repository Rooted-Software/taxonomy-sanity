import { Prisma } from '@prisma/client'

import { db } from '@/lib/db'

export async function reFetch(url, method, id, body = {}) {
  //get reSettings from server
  console.log(url, method, id, body)
  console.log('In reFetch method')
  const reSettings = await db.feSetting.findFirst({
    select: {
      id: true,
      access_token: true,
      refresh_token: true,
      expires_in: true,
    },
    where: {
      teamId: id,
    },
  })
  console.log(reSettings)
  if (!reSettings) {
    return { json: () => null, status: 429 }
  }
  var res2
  try {
    if (method === 'POST') {
      res2 = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${reSettings.access_token}`,
          'Bb-Api-Subscription-Key': process.env.AUTH_SUBSCRIPTION_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    } else {
      res2 = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${reSettings.access_token}`,
          'Bb-Api-Subscription-Key': process.env.AUTH_SUBSCRIPTION_KEY || '',
        },
      })
    }
    if (res2.status !== 200) {
      console.log('Initial response')
      console.log(res2)
      if (res2.status === 401) {
        console.log('401 - need to refresh')
        const authStuff = `Basic ${Buffer.from(
          process.env.AUTH_CLIENT_ID + ':' + process.env.AUTH_CLIENT_SECRET
        ).toString('base64')}`
        const bodyStuff = `grant_type=refresh_token&refresh_token=${reSettings.refresh_token}`
        console.log(authStuff)
        const res3 = await fetch('https://oauth2.sky.blackbaud.com/token', {
          method: 'POST',
          headers: {
            Authorization: authStuff,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: bodyStuff,
        })
        const data = await res3.json()
        console.log(data)
        let reSettingsData: Prisma.FeSettingUncheckedCreateInput = {
          teamId: id,
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
        console.log('upsert time')
        const updateSettings = await db.feSetting.upsert({
          where: {
            teamId: id,
          },
          update: reSettingsData,
          create: reSettingsData,
          select: {
            id: true,
          },
        })
        console.log(updateSettings)
        //retry original query
        console.log('retrying original query')
        var res4
        if (method === 'POST') {
          res4 = await fetch(url, {
            method: method,
            headers: {
              Authorization: `Bearer ${reSettingsData.access_token}`,
              'Bb-Api-Subscription-Key':
                process.env.AUTH_SUBSCRIPTION_KEY || '',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          })
        } else {
          res4 = await fetch(url, {
            method: method,
            headers: {
              Authorization: `Bearer ${reSettingsData.access_token}`,
              'Bb-Api-Subscription-Key':
                process.env.AUTH_SUBSCRIPTION_KEY || '',
            },
          })
        }
        if (res4.status !== 200) {
          console.log('returning status')
          console.log(res4)
          return { json: () => null, status: res4.status }
        } else {
          return res4
        }
      }
      return { json: () => null, status: res2.status }
    }

    return res2
  } catch (err) {
    console.log(err)
    console.log('Bigger issues than the refresh token')
    return { json: () => null, status: 409 }
  }
}
