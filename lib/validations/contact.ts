import * as z from 'zod'

  export const issueTypes = ['Login', 'Billing', 'Sync', 'Other'] as const;

export const contactSchema = z.object({
  email: z.string().email(),
  message: z.string().nonempty('Required'),
  issueType: z.enum(issueTypes)
})
