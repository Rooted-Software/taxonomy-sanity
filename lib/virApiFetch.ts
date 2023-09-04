import { db } from '@/lib/db'

async function retryFetch(url, params, retries = 3) {
  try {
    return  await fetch(
        url,
        params,
        )
  } catch (err) {
    if (retries === 0) {
        console.log('No more retries')

    return {json: ()=>null, status: 401}
    }
    return retryFetch(url, params, retries - 1)
  }
}

export async function virApiFetch(url, method, teamId, body?) { 
    //get reSettings from server
    const account = await db.apiSetting.findFirst({
        select: {
          id: true,
          virtuousAPI: true,
        
        },
        where: {
          teamId: teamId,
        },
      })

    if (!account) {
      console.warn('No account for team', teamId)
      return new Response(null, { status: 400 });
    }
    try { 
        const params = body ? {
          method: method,
          headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${account.virtuousAPI}`,
          },
          body: JSON.stringify(body),
      } : {
        method: method,
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${account.virtuousAPI}`,
        },
        }
        const res2 = await fetch(
            url,
            params,
            )
        
        
      if (res2.status !== 200) {
        console.log('Initial response failed - this could indicate a malformed request')
        console.log(res2.status, Array.from(res2.headers.entries()))
        setTimeout(function() {
            return retryFetch(url, params)
          }, 1000)
       

        
        return new Response(null, { status: res2.status});
      
    
    }


      return res2
      } catch (err) { 
        console.log(err) 
        console.log('Bigger issues than the refresh token')
        return new Response(null, { status: 409 });
      }
    }