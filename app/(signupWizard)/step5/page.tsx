import { MappingCreateButton } from "@/components/dashboard/mapping-create-button"
import { db } from "@/lib/db"
import { getFeAccountsFromBlackbaud, upsertFeAccount } from "@/lib/feAccounts"
import { getCurrentUser } from "@/lib/session"
import { dateFilterOptions } from "@/lib/utils"
import { getVirtuousProjects } from "@/lib/virProjects"

export const metadata = {
  title: "Map your data",
  description: "Select which projects should map to which accounts.",
}

const getFeProjects = async (teamId) => {
  return await db.feProject.findMany({
    select: {
      id: true,
      project_id: true,
      ui_project_id: true,
      description: true,
      location: true,
      division: true,
      department: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      teamId: teamId,
    },
    orderBy: {
      description: "asc",
    },
  })
}

const getProjectAccountMappings = async (teamId) => {
  return await db.projectAccountMapping.findMany({
    select: {
      id: true,
      virProjectName: true,
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
  console.log("accounts length: ", feAccounts.length)
  console.log("projects length: ", projects.length)

  return (
    <>
      <div className="center-content h-full w-full">
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
