import { TeamUserAdd } from '@/components/dashboard/team-user-add'
import { TeamUserRemove } from '@/components/dashboard/team-user-remove'
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
import { User } from '@prisma/client'
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

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Team"
        text="Manage your team and invite users"
      />
      <TeamUserAdd />
      {/* <h3 className="text-xl text-accent-1">
        Your team users:
      </h3> */}

      <ul role="list" className="divide-y divide-gray-100  dark:bg-slate-800">
        {team.users.map((user) => (
          <li key={user.email} className="flex justify-between gap-x-6 py-5">
            <div className="flex min-w-0 gap-x-4">
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-neutral-100">{user.name}</p>
                <p className="mt-1 truncate text-xs leading-5 text-accent-1">{user.email}</p>
              </div>
            </div>
            <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
              <TeamUserRemove user={user} />
            </div>
          </li>
        ))}
      </ul>



    </DashboardShell >
  )
}
