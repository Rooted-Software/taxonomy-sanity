'use client'

import { useEffect } from 'react'
import LogRocket from 'logrocket'
import setupLogRocketReact from 'logrocket-react'

export default function ErrorHandling({ user }) {
  useEffect(() => {
    // only initialize when in the browser and in production
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || '')
      // plugins should also only be initialized when in the browser
      setupLogRocketReact(LogRocket)
      if (user) {
        LogRocket.identify(user.id, {
          name: user.name,
          email: user.email,
          teamId: user.teamId,
        })
      }
    }
  }, [])

  return <></>
}
