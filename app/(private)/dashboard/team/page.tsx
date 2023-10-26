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
      <div className="rounded-lg border bg-whiteSmoke p-6 text-dark shadow-sm">
        <table className="w-full table-auto text-left">
          <thead className="hidden sm:table-header-group">
            <tr>
              <th className="border-b border-foreground py-4 pb-3 pt-0 text-left font-medium text-muted-foreground ">
                Name
              </th>
              <th className="border-b border-foreground py-4 pb-3 pt-0 text-left font-medium text-muted-foreground ">
                Email
              </th>
              <th className="border-b border-foreground py-4 pb-3 pt-0 text-left font-medium text-muted-foreground ">
                Role
              </th>
              <th className="w-[150px] border-b border-foreground py-4 pb-3 pt-0 text-right font-medium text-muted-foreground ">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2 sm:divide-y-0">
            {team.users.map((teamuser) => (
              <tr
                key={teamuser.email}
                className="relative flex flex-col py-3 sm:table-row"
              >
                <td className="sm:py-2">
                  <span className={teamuser.name ? 'mr-4' : ''}>
                    {teamuser.name}
                  </span>
                  <Badge variant="secondary" className="mb-2 sm:hidden">
                    {teamuser.role}
                  </Badge>
                </td>
                <td className="sm:py-2">{teamuser.email}</td>
                <td className="hidden sm:table-cell sm:py-2">
                  <Badge variant="secondary" className="mb-2">
                    {teamuser.role}
                  </Badge>
                </td>
                <td className="absolute right-0 top-[10px] sm:relative sm:py-2 sm:text-right">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6">
          <TeamUserAdd />
        </div>
      </div>
    </DashboardShell>
  )
}
