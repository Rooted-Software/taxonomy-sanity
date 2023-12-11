import * as z from 'zod'

export const userRoleSchema = z.object({
  role: z.string().min(3).max(32),
})
