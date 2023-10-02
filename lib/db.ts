import { PrismaClient } from '@prisma/client'
import { applySoftDeleteMiddleware } from './prisma-middlewares/soft-delete'

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient()
  }
  prisma = global.cachedPrisma
}
// use the middlewares
applySoftDeleteMiddleware(prisma)

export const db = prisma
