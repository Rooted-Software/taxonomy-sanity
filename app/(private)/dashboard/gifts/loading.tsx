import Image from 'next/image'

import { DashboardHeader } from '@/components/header'
import { DashboardShell } from '@/components/shell'

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Gift Management" text="" />
      <div className="grid gap-10">
        <Image
          className="mx-auto animate-spin"
          src={'/icon.png'}
          alt="loading"
          width={64}
          height={64}
        />
      </div>
    </DashboardShell>
  )
}
