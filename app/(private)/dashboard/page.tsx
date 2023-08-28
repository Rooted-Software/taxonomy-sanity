import { ApiRefreshButton } from '@/components/dashboard/api-refresh-button'
import { KeygenButton } from '@/components/dashboard/keygen-button'
import { ReTestApiButton } from '@/components/dashboard/re-test-button'
import { ReTestPostButton } from '@/components/dashboard/re-test-post-button'
import { VirtuousGetGiftsButton } from '@/components/dashboard/virtuous-get-gifts'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { DashboardHeader } from '@/components/header'
import { PaginationButtons } from '@/components/pagination-buttons'
import { PostCreateButton } from '@/components/post-create-button'
import { PostItem } from '@/components/post-item'
import { DashboardShell } from '@/components/shell'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getFeEnvironment } from '@/lib/feEnvironment'
import { getCurrentUser } from '@/lib/session'
import { formatDate } from '@/lib/utils'
import { User } from '@prisma/client'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard',
}

const SYNC_PAGE_SIZE = 5

export default async function DashboardPage({ searchParams }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || '/login')
  }

  const feEnvironment = await getFeEnvironment(user.team.id)

  const batches = await db.giftBatch.findMany({
    where: {
      teamId: user.team.id,
      synced: false,
    },
    select: {
      id: true,
      batch_name: true,
      synced: true,
      createdAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  const syncPage =
    searchParams.syncPage && !Number.isNaN(searchParams.syncPage)
      ? parseInt(searchParams.syncPage)
      : 0
  const history = await db.syncHistory.findMany({
    where: {
      teamId: user.team.id,
    },
    select: {
      id: true,
      syncType: true,
      syncDuration: true,
      syncDate: true,
      syncStatus: true,
      syncMessage: true,
      giftBatchId: true,
      giftBatch: true,
    },
    orderBy: {
      syncDate: 'desc',
    },
    take: SYNC_PAGE_SIZE,
    skip: syncPage * SYNC_PAGE_SIZE,
  })
  const historyMorePages = history.length === SYNC_PAGE_SIZE

  console.log(user.id)
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Virtuous to Financial Edge Sync made simple"
      ></DashboardHeader>
      <div>
        {batches?.length ? (
          <div className="divide-y divide-border rounded-md border">
            <h3 className="text-xl text-accent-1">
              Un-synced Virtuous Gift Batches:{' '}
            </h3>
            {batches.map((batch) => (
              <div className="flex items-center justify-between p-4">
                <div className="grid gap-1">
                  <Link
                    href={`/batchManagement/?batchId=${batch.id}`}
                    className="font-semibold hover:underline"
                  >
                    {batch.batch_name}
                  </Link>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(batch.createdAt?.toDateString())}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPlaceholder className="border border-white">
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>
              No Un-synced Virtuous Gift Batches.
            </EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              Un-synced Virtuous batches will show here
            </EmptyPlaceholder.Description>
          </EmptyPlaceholder>
        )}
      </div>
      <div>
        {history?.length ? (
          <div className="grid-flow-row auto-rows-max divide-y divide-border rounded-md border">
            <h3 className="text-xl text-accent-1">Sync History: </h3>
            {history.map((log) => (
              <div className="flex items-center justify-between p-4">
                <div className="grid w-full gap-1">
                  <div className="w-full">
                    Virtuous Batch: {log.giftBatch?.batch_name} -{' '}
                    {log.syncType.charAt(0).toUpperCase() +
                      log.syncType.slice(1)}{' '}
                    Sync
                    <div className="float-right">
                      <a
                        className="align-items-right text-xs"
                        target=""
                        href={`javascript:window.open('https://host.nxt.blackbaud.com/journalentry/${log.giftBatch?.reBatchNo}?envid=${feEnvironment?.environment_id}', 'financialEdge', 'width=1200,height=750');`}
                      >
                        {' '}
                        FE Batch# {log.giftBatch?.reBatchNo}{' '}
                        <span className="text-accent-1">&nbsp; (synced)</span>
                      </a>{' '}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      status: {log.syncStatus} | duration: {log.syncDuration}s |{' '}
                      {formatDate(log.syncDate?.toDateString())}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <PaginationButtons
              paramName="syncPage"
              hasMore={historyMorePages}
            />
          </div>
        ) : (
          <EmptyPlaceholder className="border border-white">
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>
              No sync activity yet.
            </EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              Sync history will appear here.
            </EmptyPlaceholder.Description>
          </EmptyPlaceholder>
        )}
      </div>
    </DashboardShell>
  )
}
