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

  const feAccountsData = getFeAccountsFromBlackbaud(user.team.id)
  const projectsData = getVirtuousProjects(user.team.id, projectDays)
  const mappingData = getProjectAccountMappings(user.team.id)
  const [projects, feAccounts, mappings] = await Promise.all([
    projectsData,
    feAccountsData,
    mappingData,
  ])

  return (
    <div className="lg:h-[90vh]">
      {projects && feAccounts ? (
        <MappingEditor
          projects={projects}
          feAccounts={feAccounts}
          mappings={mappings}
          nextProjectDays={nextProjectDays}
          projectsDaysLoaded={projectDays}
        />
      ) : (
        `getting projects and accounts...`
      )}
    </div>
  )
}
