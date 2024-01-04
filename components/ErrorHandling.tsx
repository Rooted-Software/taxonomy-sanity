import { useEffect } from 'react'

;('use client')

export default function ErrorHandling() {
  useEffect(() => {
    // only initialize when in the browser and in production
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      console.log('initiated')
      // LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID)
      // // plugins should also only be initialized when in the browser
      // setupLogRocketReact(LogRocket)
    }
  }, [])

  return <></>
}
