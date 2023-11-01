'use client'

import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ReCallBackPage(params, searchParams) {
  console.log('params')
  console.log(params)
  console.log('searchParams')
  console.log(searchParams)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [reData, setReData] = useState({})

  const onClick = async () => {
    setIsLoading(true)
    const bodyJson = JSON.stringify({
      code: params?.searchParams.code,
      redirect_uri: process.env.AUTH_REDIRECT_URI,
      state: params?.searchParams.state,
    })
    console.log(bodyJson)
    const response = await fetch('/api/reTokenExchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyJson,
    })
    console.log(response.status)
    setIsLoading(false)

    if (!response?.ok) {
      if (response.status === 405) {
        console.log(response)

        return toast({
          title: 'Your code was Invalid',
          description: 'please close this window and try again',
          variant: 'destructive',
        })
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your post was not created. Please try again.',
        variant: 'destructive',
      })
    }
  }
  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      if (params?.searchParams?.code) {
        const response = await fetch('/api/reTokenExchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: params.searchParams.code,
            redirect_uri: process.env.AUTH_REDIRECT_URI,
            state: params.searchParams.state,
          }),
        })
        console.log('use-effect resonse')
        console.log(response)
        setIsLoading(false)

        if (!response?.ok) {
          if (response.status === 429) {
            console.log(response)
            const data = await response.json()
            console.log(data)
            return toast({
              title: 'API rate limit exceeded',
              description: data.message,
              variant: 'destructive',
            })
          }

          return toast({
            title: 'Something went wrong.',
            description: 'Your code was not created. Please try again.',
            variant: 'destructive',
          })
        }

        window.opener.location = '/step3'
        window.close()
      }
      // This forces a cache invalidation.
    })()
    return () => {
      // this now gets called when the component unmounts
    }
  }, [params.searchParams.code, params.searchParams.state])

  return (
    <div>
      <h1>
        {isLoading ? (
          `Loading...`
        ) : (
          <button onClick={onClick}>Click to Reload</button>
        )}
      </h1>
    </div>
  )
}
