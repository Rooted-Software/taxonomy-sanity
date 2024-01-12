// This isn't used
import { User } from '@prisma/client'
import Mailgun, { MailgunMessageData } from 'mailgun.js'

import { siteConfig } from '@/config/site'

export async function sendUserInvite(user: User) {
  const templateId = process.env.MAILGUN_INVITE_USER_TEMPLATE
  if (!templateId) {
    throw new Error('Missing template id')
  }
  if (!user || !user.email) {
    throw new Error('Missing user email')
  }

  const mailgun = new Mailgun(FormData)
  const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere',
  })

  const mailgunData: MailgunMessageData = {
    from: process.env.INFO_EMAIL_ADDRESS,
    to: user.email,
    template: templateId,
    'h:X-Mailgun-Variables': JSON.stringify({
      //   action_url: url,
      product_name: siteConfig.name,
    }),
  }
  const result = await mg.messages.create('donorsync.org', mailgunData)
  return result
}
