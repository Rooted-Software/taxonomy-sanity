import { PrismaClient } from '@prisma/client'

// Define the soft delete middleware function
export function applySoftDeleteMiddleware(prisma: PrismaClient) {
    prisma.$use(async (params, next) => {
        if (params.model == 'User') {
            if (params.action === 'findUnique' || params.action === 'findFirst') {
                // Change to findFirst - you cannot filter
                // by anything except ID / unique with findUnique
                params.action = 'findFirst'
                // Add 'deleted' filter
                // ID filter maintained
                params.args.where['deleted'] = false
            }
            if (params.action === 'findMany') {
                // Find many queries
                if (params.args.where) {
                    if (params.args.where.deleted == undefined) {
                        // Exclude deleted records if they have not been explicitly requested
                        params.args.where['deleted'] = false
                    }
                } else {
                    params.args['where'] = { deleted: false }
                }
            }
        }
        // When returning a team with users only include records that aren't deleted
        if (params.model == 'Team' && ['findUnique', 'findUniqueOrThrow', 'findMany', 'findFirst'].includes(params.action)) {
            if (params.args.include?.users === true) {
                params.args.include = { users: { where: { ['deleted']: false } } }
            }
        }
        return next(params)
    })

    prisma.$use(async (params, next) => {
        if (params.model == 'User') {
            if (params.action == 'update') {
                // Change to updateMany - you cannot filter
                // by anything except ID / unique with findUnique
                params.action = 'updateMany'
                // Add 'deleted' filter
                // ID filter maintained
                params.args.where['deleted'] = false
            }
            if (params.action == 'updateMany') {
                if (params.args.where != undefined) {
                    params.args.where['deleted'] = false
                } else {
                    params.args['where'] = { deleted: false }
                }
            }
        }
        return next(params)
    })

    prisma.$use(async (params, next) => {
        // Check incoming query type
        if (params.model == 'User') {
            if (params.action == 'delete') {
                // Delete queries
                // Change action to an update
                params.action = 'update'
                params.args['data'] = { deleted: true }
            }
            if (params.action == 'deleteMany') {
                // Delete many queries
                params.action = 'updateMany'
                if (params.args.data != undefined) {
                    params.args.data['deleted'] = true
                } else {
                    params.args['data'] = { deleted: true }
                }
            }
        }
        return next(params)
    })
}
