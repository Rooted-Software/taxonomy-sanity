import { TeamUserAdd } from '@/components/dashboard/team-user-add'
import { TeamUserRemove } from '@/components/dashboard/team-user-remove'
import { DashboardHeader } from '@/components/header'
import { Icons } from '@/components/icons'
import { DashboardShell } from '@/components/shell'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { redirect } from 'next/navigation'

// import us from 'next/server'

const getTeam = async (teamId) => {
  return await db.team.findUniqueOrThrow({
    where: { id: teamId },
    include: {
      users: true,
    },
  })
}

export const metadata = {
  title: 'Team',
  description: 'Manage your team and invite users',
}

// Assuming this is your handler function
function myHandler() {
  // Your handler logic here
  console.log('not implemented')
}

export default async function TeamPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || '/login')
  }

  const team = await getTeam(user.team.id)
  // Wrap the handler function with useServer
  // const safeHandler = useServer(myHandler)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Team"
        text="Manage your team and invite users"
      />
      <TeamUserAdd />
      <ul role="list" className="divide-y divide-gray-100  dark:bg-slate-800">
        {team.users.map((teamuser) => (
          <li
            key={teamuser.email}
            className="flex flex-wrap justify-between gap-x-6 py-5 pr-1"
          >
            <div className="mb-4 flex gap-x-4">
              <div className="flex flex-auto flex-wrap gap-x-6">
                <p className="text-sm font-semibold leading-6 text-neutral-100">
                  {teamuser.name}
                </p>
                <p className="mt-1 text-xs leading-5 text-accent-1">
                  {teamuser.email}
                </p>
                <Badge variant="secondary" className="mb-2">
                  {teamuser.role}
                </Badge>
              </div>
            </div>
            <div className="flex-col items-center">
              {user.id == teamuser.id ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Icons.lock className="mr-2 h-4 w-4" />
                    </TooltipTrigger>

                    <TooltipContent sideOffset={4}>
                      You cannot remove yourself
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : teamuser.role == 'admin' ? (
                <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icons.lock className="mr-2 h-4 w-4" />
                  </TooltipTrigger>

                  <TooltipContent sideOffset={4}>
                    You cannot remove admins
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              ) : (
                <TeamUserRemove user={teamuser} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </DashboardShell>
  )
}
