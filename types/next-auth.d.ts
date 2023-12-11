import { User } from 'next-auth'

import 'next-auth/jwt'

type UserId = string

declare module 'next-auth/jwt' {
  interface JWT {
    id: UserId
    user: {
      id: string
      name: string
      email: string
      picture: string
      setupStep: string
      // eslint-disable-next-line no-undef
      team: Team
      teamId: string
    }
  }
}

declare module 'next-auth' {
  interface Session {
    user: User & {
      id: UserId
      // eslint-disable-next-line no-undef
      team: Team
      teamId: string
      role: 'admin' | 'user'
    }
  }
}
