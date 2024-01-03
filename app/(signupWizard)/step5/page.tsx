import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import { getCurrentUser } from '@/lib/session'
import { dateFilterOptions } from '@/lib/utils'
import { getVirtuousProjects } from '@/lib/virProjects'
import { MappingEditor } from '@/components/dashboard/mapping-editor'

export const metadata = {
  title: 'Map your data',
  description: 'Select which projects should map to which accounts.',
}

const getProjectAccountMappings = async (teamId) => {
  return await db.projectAccountMapping.findMany({
    select: {
      id: true,
      virProjectName: true,
      virProjectId: true,
      feAccountId: true,
      feDebitAccountId: true,
      feDebitAccountForGiftType: true,
    },
    where: {
      teamId: teamId,
    },
  })
}

export default async function DataMapPage({ searchParams }) {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }

  const projectDays =
    searchParams.projectDays && !Number.isNaN(searchParams.projectDays)
      ? parseInt(searchParams.projectDays)
      : dateFilterOptions[0]

  const currentDateIndex = dateFilterOptions.indexOf(projectDays)
  const nextProjectDays = dateFilterOptions[currentDateIndex + 1]

  const [projects, feAccounts, mappings] = await Promise.all([
    getVirtuousProjects(user.team.id, projectDays),
    getFeAccountsFromBlackbaud(user.team.id),
    getProjectAccountMappings(user.team.id),
  ])

  return (
    <>
      <div className="center-content h-full w-full">
        <p className="justify-left px-5 pt-8 text-lg text-white">
          <span className="font-bold text-accent-1">STEP 5:</span> Select which
          projects should map to which accounts.
        </p>
        {projects && feAccounts ? (
          <div className="h-full px-8 pt-8 lg:pr-0">
            <MappingEditor
              showHeader={false}
              projects={projects}
              feAccounts={feAccounts}
              mappings={mappings}
              nextProjectDays={nextProjectDays}
              projectsDaysLoaded={projectDays}
            />
          </div>
        ) : (
          `getting projects and accounts...`
        )}
      </div>
    </>
  )
}
