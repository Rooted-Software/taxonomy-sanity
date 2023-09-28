import * as z from 'zod'

export const teamUserSchema = z.object({
  name: z.string().min(3, { message: "Name must contain at least 3 characters" }).max(32),
  email: z.string().min(3, { message: "Email must contain at least 3 characters" })
    .email("This is not a valid email.")
})
