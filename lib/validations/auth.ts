import * as z from 'zod'

export const userAuthSchema = z.object({
  email: z.string().email(),
})

export const virtuousAuthSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  twoFactor: z.string().optional(),
})
