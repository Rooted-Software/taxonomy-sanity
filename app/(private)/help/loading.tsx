import { DashboardHeader } from '@/components/dashboard/header'
import { PostItem } from '@/components/post-item'
import { DashboardShell } from '@/components/shell'

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Virtuous to Financial Edge Sync made simple"
      ></DashboardHeader>
      <div className=" rounded-md">
        <PostItem.Skeleton />
        <PostItem.Skeleton />
        <PostItem.Skeleton />
        <PostItem.Skeleton />
        <PostItem.Skeleton />
      </div>
    </DashboardShell>
  )
}
