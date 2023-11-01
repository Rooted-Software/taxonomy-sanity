import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud } from '@/lib/feAccounts'
import { getCurrentUser } from '@/lib/session'
import { dateFilterOptions } from '@/lib/utils'
import { getVirtuousProjects } from '@/lib/virProjects'
import { MappingCreateButton } from '@/components/dashboard/mapping-create-button'

export const metadata = {
  title: 'Map your data',
  description: 'Select which projects should map to which accounts.',
}

const getProjectAccountMappings = async (teamId) => {
  return await db.projectAccountMapping.findMany({
    select: {
      id: true,
      virProjectId: true,
      feAccountId: true,
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

  const feAccountsData = getFeAccountsFromBlackbaud(user.team.id)
  const projectsData = getVirtuousProjects(user.team.id, projectDays)
  const mappingData = getProjectAccountMappings(user.team.id)
  const [projects, feAccounts, mappings] = await Promise.all([
    projectsData,
    feAccountsData,
    mappingData,
  ])

  return (
    <>
      <div>
        {projects && feAccounts ? (
          <MappingCreateButton
            projects={projects}
            feAccounts={feAccounts}
            mappings={mappings}
            nextProjectDays={nextProjectDays}
            projectsDaysLoaded={projectDays}
            className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          />
        ) : (
          `getting projects and accounts...`
        )}
      </div>
    </>
  )
}
