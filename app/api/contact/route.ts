import { authOptions } from '@/lib/auth'
import Mailgun from 'mailgun.js'
import { getServerSession } from 'next-auth/next'

const FormData = require('form-data')

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response(null, { status: 403 })
  }

  const data = await req.json()

  const mailgun = new Mailgun(FormData)
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere',
  })

  const mailgunData = {
    from: process.env.SUPPORT_EMAIL_ADDRESS,
    to: data.email,
    cc: process.env.SUPPORT_EMAIL_ADDRESS,
    template: 'support',
    'h:X-Mailgun-Variables': JSON.stringify({
      issue_from: data.email,
      issue_type: data.issueType,
      issue_description: data.message,
    }),
  }

  await mg.messages.create('donorsync.org', mailgunData)

  return new Response(null, { status: 200 })
}
