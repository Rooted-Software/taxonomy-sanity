import GiftManagement from '@/components/dashboard/gift-management'
import { DashboardHeader } from '@/components/header'
import { DashboardShell } from '@/components/shell'

export default function GiftManagementPage({ searchParams }) {
  return (
    <div className="lg:h-[90vh]">
      <DashboardShell>
        <DashboardHeader heading="Gift Management" />
        <GiftManagement searchParams={searchParams} />
      </DashboardShell>
    </div>
  )
}
