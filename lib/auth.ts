import { siteConfig } from '@/config/site'
import { db } from '@/lib/db'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { Prisma } from '@prisma/client'
import Mailgun from 'mailgun.js'
import { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'

type Credentials = {
  email: string
  password: string
  twoFactor: string
}

const FormData = require('form-data')

const setDefaultNewTeam = async (user: any) => {
  const stripe = require('stripe')(process.env.STRIPE_API_KEY || '')
  console.log('Creating new default team')
  // create a team
  const newTeam = await db.team.create({
    data: {
      name: user.email,
      users: {
        connect: {
          id: user.id,
        },
      },
    },
    select: {
      id: true,
    },
  })
  const updatedUser = await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      role: 'admin',
    },
  })
  // return newTeam // this is here because strip secret key is failing on localhost
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { teamId: newTeam.id, userId: user.id },
  })
  // update team with stripe customer id
  const updatedTeam = await db.team.update({
    where: {
      id: newTeam.id,
    },
    data: {
      stripeCustomerId: customer.id,
    },
  })
  return updatedTeam
}
export const authOptions: NextAuthOptions = {
  // huh any! I know.
  // This is a temporary fix for prisma client.
  // @see https://github.com/prisma/prisma/issues/16117
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login?from=/dashboard',
  },
  providers: [
    EmailProvider({
      from: process.env.INFO_EMAIL_ADDRESS,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const user = await db.user.findUnique({
          where: {
            email: identifier,
          },
          select: {
            emailVerified: true,
            deleted: true,
          },
        })

        if (user?.deleted) {
          console.log('this is a deleted user...')
          return
        }

        const templateId = user?.emailVerified
          ? process.env.MAILGUN_SIGN_IN_TEMPLATE
          : process.env.MAILGUN_ACTIVATION_TEMPLATE
        if (!templateId) {
          throw new Error('Missing template id')
        }

        const mailgun = new Mailgun(FormData)
        const mg = mailgun.client({
          username: 'api',
          key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere',
        })

        const mailgunData = {
          from: process.env.INFO_EMAIL_ADDRESS,
          to: identifier,
          template: templateId,
          'h:X-Mailgun-Variables': JSON.stringify({
            action_url: url,
            product_name: siteConfig.name,
          }),
        }
        const result = await mg.messages.create('donorsync.org', mailgunData)
      },
    }),
    CredentialsProvider({
      id: 'virtuous',
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Virtuous CMS',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: {
          label: 'email',
          type: 'email',
          placeholder: 'jsmith@example.com',
        },
        password: { label: 'Password', type: 'password' },
        twoFactor: { label: '2FA', type: 'text' },
      },
      async authorize(credentials: Credentials, req) {
        const form = new FormData()
        form.append('email', credentials.email)
        form.append('password', credentials.password)
        form.append('twoFactor', credentials.twoFactor || '')

        const res = await fetch('https://api.virtuoussoftware.com/Token', {
          method: 'POST',
          body:
            credentials.twoFactor !== '' &&
            credentials.twoFactor !== undefined &&
            credentials.twoFactor !== 'undefined'
              ? 'grant_type=password&username=' +
                credentials.email +
                '&password=' +
                credentials.password +
                '&otp=' +
                credentials.twoFactor +
                ''
              : 'grant_type=password&username=' +
                credentials.email +
                '&password=' +
                credentials.password,
          mode: 'no-cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'form-data',
          },
        })

        const user = await res.json()
        const { error } = user
        if (error !== null && error !== undefined) {
          console.log(error)
          throw new Error(error)
          return error
        }
        // If no error and we have user data, return it
        if (res.ok && user) {
          // save some data
          var dbUser = await db.user.findFirst({
            where: {
              email: credentials.email,
            },
            include: {
              team: true,
            },
          })

          if (!dbUser) {
            console.log('no user found')
            // create new user and account (with tokens)

            const newUser = await db.user.create({
              data: {
                email: credentials.email,
                emailVerified: new Date(),
                name: user.userName,
              },
              select: {
                id: true,
                teamId: true,
                team: true,
              },
            })
            // check to see if there is a team?
            if (newUser && !newUser.teamId) {
              const newTeam = await setDefaultNewTeam(newUser)
            }
            dbUser = await db.user.findFirst({
              where: {
                email: credentials.email,
              },
              include: {
                team: true,
              },
            })
            if (!dbUser) {
              throw new Error('No user found')
              return null
            }
            let accountData: Prisma.AccountUncheckedCreateInput = {
              userId: newUser.id,
              type: 'oauth',
              provider: 'virtuous',
              providerAccountId: user.userName,
              refresh_token: user.refresh_token,
              access_token: user.access_token,
              expires_at: user.expires_in,
              token_type: 'bearer',
            }

            const newAccount = await db.account.create({
              data: accountData,
              select: {
                id: true,
              },
            })
          } else {
            // update account (with tokens)
            const updatedAccount = await db.account.updateMany({
              where: {
                userId: dbUser.id,
                type: 'oauth',
                provider: 'virtuous',
              },
              data: {
                access_token: user.access_token,
                refresh_token: user.refresh_token,
                expires_at: user.expires_in,
                token_type: 'bearer',
              },
            })
          }
          console.log('finishing login ')
          if (!dbUser.teamId) {
            const newTeam = await setDefaultNewTeam(dbUser)
            dbUser.teamId = newTeam.id
            dbUser = await db.user.findFirst({
              where: {
                email: credentials.email,
              },
              include: {
                team: true,
              },
            })
          }

          if (!dbUser || !dbUser?.teamId) {
            console.log('failed to find user or team')
            // failed to fund user or team, which should not happen at this stage
            return null
          }
          let loggedInUser: any = {
            id: dbUser.id,
            email: credentials.email,
            team: dbUser.team,
            teamId: dbUser.teamId,
          }
          return loggedInUser
        }
        // Return null if user data could not be retrieved
        return null
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, email }) {
      // this is for both new user registration and signing in
      // middleware will automatically take out deleted users
      const userExists = await db.user.findUnique({
        where: { email: user.email || account?.providerAccountId }, //the user object has an email property, which contains the email the user entered.
      })
      // const userExists: User[] = await db.$queryRaw`
      //     SELECT email, deleted
      //     FROM users
      //     WHERE email = ${user.email || account?.providerAccountId}
      //   `;
      if (userExists) {
        return true //if the email exists in the User collection, email them a magic login link
      } else {
        // Fix the sign up form so that new users are created when
        const newUser = await db.user.create({
          data: {
            email: credentials.email,
            emailVerified: new Date(),
            name: user.userName,
          },
          select: {
            id: true,
            teamId: true,
            team: true,
          },
        })
        // check to see if there is a team?
        if (newUser && !newUser.teamId) {
          const newTeam = await setDefaultNewTeam(newUser)
        }


      }
    },
    async session({ token, session }) {
      console.log('SESSION ', token, session)
      if (!token.teamId) {
        return session
      }
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.team = token.team
        session.user.teamId = token.teamId
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      console.log('JWT  ')
      let newTeam
      const dbUser = await db.user.findUniqueOrThrow({
        where: {
          email: token.email || account?.providerAccountId,
        },
        include: {
          team: true,
        },
      })
      if (user) {
        // This is the first time the JWT was created
        if (!dbUser || !account?.providerAccountId) {
          console.log('no db user ', user)
          throw 'missing db user'
        }
        if (!dbUser.team) {
          newTeam = await setDefaultNewTeam(dbUser)
          await db.user.update({
            where: {
              email: token.email || account?.providerAccountId,
            },
            data: {
              teamId: newTeam.id,
            },
          })
        }
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        setupStep: dbUser.team?.setupStep,
        team: dbUser.team || newTeam,
        teamId: dbUser.teamId || newTeam.id,
      }
    },
  },
}
