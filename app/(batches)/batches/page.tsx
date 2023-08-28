import { ApiRefreshButton } from '@/components/dashboard/api-refresh-button'
import { DashboardHeader } from '@/components/dashboard/header'
import { KeygenButton } from '@/components/dashboard/keygen-button'
import { ReTestApiButton } from '@/components/dashboard/re-test-button'
import { ReTestPostButton } from '@/components/dashboard/re-test-post-button'
import { VirtuousGetGiftsButton } from '@/components/dashboard/virtuous-get-gifts'
import { VirtuousSyncButton } from '@/components/dashboard/virtuous-sync-button'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { PostCreateButton } from '@/components/post-create-button'
import { PostItem } from '@/components/post-item'
import { DashboardShell } from '@/components/shell'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cache } from 'react'

const getBatches = async (teamId) => {
  return await db.giftBatch.findMany({
    where: { 
      teamId: teamId,
    }, 
    select: {
      id: true,
      batch_name: true,
      synced: true,
      syncedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('auth/signIn')
  }

  const batches = await getBatches(user.team.id)

  return (
    <DashboardShell>
      <DashboardHeader
        heading={batches.length ? `Batches: ${batches.length}` : 'Batches'}
        text="Recent Dontation Batches from Virtuous"
      ></DashboardHeader>
      <div className="">
        Get Batches
        <VirtuousGetGiftsButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>
      <div>
        {batches?.length ? (
          <div className="divide-y divide-neutral-200 rounded-md border border-slate-200">
            {batches.map((batch) => (
              <div key={batch.id} className="mb-3 p-3">
                {batch.batch_name}{' '}
                {!batch.synced ? (
                  <VirtuousSyncButton
                    batch_name={batch.batch_name}
                    className="float-right border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="post" />
            <EmptyPlaceholder.Title>No batches created</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any batches yet. Start creating content.
            </EmptyPlaceholder.Description>
            <PostCreateButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
          </EmptyPlaceholder>
        )}
      </div>

      <div className="">
        Virtuous Refresh Button
        <ApiRefreshButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>
      <div className="">
        Test RE Button
        <ReTestApiButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>
      <div className="">
        Test RE POST Button
        <ReTestPostButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>

      {/*
      <div className="">Test KeyGen
        <KeygenButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
        </div> */}
    </DashboardShell>
  )
}
