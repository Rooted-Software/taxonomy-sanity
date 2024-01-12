import { db } from '@/lib/db'

export async function virFetch(url, method, id, body) {
  //get reSettings from server
  const account = await db.account.findFirst({
    select: {
      id: true,
      userId: true,
      access_token: true,
      refresh_token: true,
      expires_at: true,
    },
    where: {
      userId: id,
    },
  })

  if (!account) {
    return { json: () => null, status: 429 }
  }
  try {
    const params = body
      ? {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${account.access_token}`,
          },
          body: JSON.stringify(body),
        }
      : {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${account.access_token}`,
          },
        }

    const res2 = await fetch(url, params)
    if (res2.status !== 200) {
      console.log(
        'Initial response failed - this could indicate a failed refresh token'
      )
      if (res2.status === 401) {
        // try to refresh token
        const res2 = await fetch('https://api.virtuoussoftware.com/Token', {
          method: 'POST',
          body:
            'grant_type=refresh_token&refresh_token=' + account.refresh_token,
          mode: 'no-cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'form-data',
          },
        })
        console.log('after virtuous refresh token')
        console.log(res2.status)
        if (res2.status !== 200) {
          console.log('returning status - refreshing token failed')
          return new Response(null, { status: 429 })
        }
        console.log('refresh token succeeded...updating db')
        const data = await res2.json()
        console.log(data)
        const updatedAccount = await db.account.updateMany({
          where: {
            userId: account.userId,
            type: 'oauth',
            provider: 'virtuous',
          },
          data: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: data.expires_in,
            token_type: 'bearer',
          },
        })

        //retry original query
        console.log('retrying original query')
        const params2 = body
          ? {
              method: method,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.access_token}`,
              },
              body: JSON.stringify(body),
            }
          : {
              method: method,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${data.access_token}`,
              },
            }
        const res4 = await fetch(url, params2)
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
