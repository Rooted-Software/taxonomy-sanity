import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { DashboardHeader } from '@/components/header'
import { PaginationButtons } from '@/components/pagination-buttons'
import { DashboardShell } from '@/components/shell'
import WindowOpenLink from '@/components/ui/window-open-link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getFeEnvironment } from '@/lib/feEnvironment'
import { getCurrentUser } from '@/lib/session'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dashboard',
}

const PAGE_SIZE = 8

export default async function DashboardPage({ searchParams }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || '/login')
  }

  const feEnvironment = await getFeEnvironment(user.team.id)

  const batchPage =
    searchParams.batchPage && !Number.isNaN(searchParams.batchPage)
      ? parseInt(searchParams.batchPage)
      : 0
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
      latestGiftAt: true,
    },
    orderBy: {
      latestGiftAt: 'desc',
    },
    // Take one extra so that we can know if there are more pages available
    take: PAGE_SIZE + 1,
    skip: batchPage * PAGE_SIZE,
  })
  const batchesMorePages = batches.length > PAGE_SIZE

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
    // Take one extra so that we can know if there are more pages available
    take: PAGE_SIZE + 1,
    skip: syncPage * PAGE_SIZE,
  })
  const historyMorePages = history.length > PAGE_SIZE

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
            {batches.slice(0, PAGE_SIZE).map((batch) => (
              <div className="flex items-center justify-between px-4 py-2">
                <div className="grid gap-1">
                  <Link
                    href={`/batchManagement/?batchId=${batch.id}`}
                    className="font-semibold hover:underline"
                  >
                    {batch.batch_name}
                  </Link>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(batch.latestGiftAt?.toDateString())}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <PaginationButtons
              paramName="batchPage"
              hasMore={batchesMorePages}
            />
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
            {history.slice(0, PAGE_SIZE).map((log) => (
              <div className="flex items-center justify-between px-4 py-2">
                <div className="grid w-full gap-1">
                  <div className="w-full">
                    Virtuous Batch: {log.giftBatch?.batch_name} -{' '}
                    {log.syncType.charAt(0).toUpperCase() +
                      log.syncType.slice(1)}{' '}
                    Sync
                    <div className="float-right">
                      <WindowOpenLink
                        className="align-items-right text-xs"
                        url={`https://host.nxt.blackbaud.com/journalentry/${log.giftBatch?.reBatchNo}?envid=${feEnvironment?.environment_id}`}
                        target="financialEdge"
                        features="width=1200,height=750"
                      >
                        {' '}
                        FE Batch# {log.giftBatch?.reBatchNo}{' '}
                        <span className="text-accent-1">&nbsp; (synced)</span>
                      </WindowOpenLink>{' '}
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
