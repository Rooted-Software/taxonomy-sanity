import { DashboardHeader } from '@/components/header'
import { DashboardShell } from '@/components/shell'

export const metadata = {
  title: 'Support',
}

export default async function SupportPage() {

  // Need to make support page into a component so it can be added here

  return (
    <DashboardShell>
      <DashboardHeader heading="Support" />
      <div className="p-2">
       {/* will load support component here */}
      </div>
    </DashboardShell>
  )
}
