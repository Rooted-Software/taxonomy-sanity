// import { BillingForm } from '@/components/billing-form'
import { DashboardHeader } from '@/components/header'
import { Icons } from '@/components/icons'
import { DashboardShell } from '@/components/shell'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'

const getTeam = async (teamId) => {
  return await db.team.findUniqueOrThrow({
    where: { id: teamId },
    include: {
      users: true
    }
  })
}

export const metadata = {
  title: 'Team',
  description: 'Manage your team and invite users',
}

export default async function TeamPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || '/login')
  }

  const team = await getTeam(user.team.id);
  console.log("teams!", team.users);
  // const history = [
  //   {
  //     id: 'cllzs0f8a000amq08yus0ozlb',
  //     syncType: 'automatic',
  //     syncDuration: 2,
  //     syncDate: "test",
  //     syncStatus: 'success',
  //     syncMessage: 'success',
  //     giftBatchId: 'cllzalbkl0005apno5d0b44qr',
  //     giftBatch: {
  //       id: 'cllzalbkl0005apno5d0b44qr',
  //       batch_name: 'Qgiv Batch 1693410522-1693410522',
  //       synced: true,
  //       reBatchNo: 4497,
  //       syncedAt: "test",
  //       createdAt: "test",
  //       updatedAt: "test",
  //       latestGiftAt: "test",
  //       teamId: 'cllxz0r570001ap4dd1tsafw0'
  //     }
  //   },
  //   {
  //     id: 'cllzrzrf60003mh09gduavrru',
  //     syncType: 'automatic',
  //     syncDuration: 17,
  //     syncDate: "test",
  //     syncStatus: 'success',
  //     syncMessage: 'success',
  //     giftBatchId: 'clly1x8xq007psfa14ba80zvt',
  //     giftBatch: {
  //       id: 'clly1x8xq007psfa14ba80zvt',
  //       batch_name: 'sdsgsdggsdgsd',
  //       synced: true,
  //       reBatchNo: 4496,
  //       syncedAt: "test",
  //       createdAt: "test",
  //       updatedAt: "test",
  //       latestGiftAt: "test",
  //       teamId: 'cllxz0r570001ap4dd1tsafw0'
  //     }
  //   }];

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Team"
        text="Manage your team and invite users"
      />
      <h3 className="text-xl text-accent-1">
        Team users
      </h3>
      <div >
        {team.users.map((teamUser) => (
          <div className="flex items-center justify-between px-4 py-2">
            <div className="grid w-full gap-1">
              <div className="w-full">
                <span>{teamUser.name}</span>
                <span>{teamUser.email}</span>
                <span className="text-accent-1">&nbsp; {teamUser.role}</span>
              </div>

            </div>
          </div>
        ))}
      </div>

    </DashboardShell>
  )
}
