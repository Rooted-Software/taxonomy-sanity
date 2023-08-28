import { MappingCreateButton } from '@/components/dashboard/mapping-create-button'
import { db } from '@/lib/db'
import { getFeAccountsFromBlackbaud, upsertFeAccount } from '@/lib/feAccounts'
import { getCurrentUser } from '@/lib/session'
import { virApiFetch } from '@/lib/virApiFetch'
import { upsertProject } from '@/lib/virProjects'

export const metadata = {
  title: 'Map your data',
  description: 'Select which projects should map to which accounts.',
}

const getVirtuousProjects = async (teamId) => {
  let projects = await db.virtuousProject.findMany({
    select: {
      id: true,
      name: true,
      project_id: true,
      projectCode: true,
      onlineDisplayName: true,
      externalAccountingCode: true,
      description: true,
      isActive: true,
      isPublic: true,
      isTaxDeductible: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      teamId: teamId,
    },
    orderBy: {
      onlineDisplayName: 'asc',
    },
  })

  if (projects.length < 1) {
    console.log('no initial projects...querying virtuous')
    const body = {
      groups: [
        {
          conditions: [
            {
              parameter: 'Create Date',
              operator: 'LessThanOrEqual',
              value: '30 Days Ago',
            },
            {
              parameter: 'Active',
              operator: 'IsTrue',
            },
          ],
        },
      ],
      sortBy: 'Last Modified Date',
      descending: 'true',
    }
    const res = await virApiFetch(
      'https://api.virtuoussoftware.com/api/Project/Query?skip=0&take=1000',
      'POST',
      teamId,
      body
    )

    console.log('after virApiFetch')
    console.log(res.status)
    if (res.status !== 200) {
      console.log('no projects')
    }
    console.log('returning data')
    const data = await res.json()
    console.log(data)
    data?.list.forEach((project) => {
      upsertProject(project, teamId)
    })
    return await db.virtuousProject.findMany({
      select: {
        id: true,
        name: true,
        project_id: true,
        projectCode: true,
        onlineDisplayName: true,
        externalAccountingCode: true,
        description: true,
        isActive: true,
        isPublic: true,
        isTaxDeductible: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        teamId: teamId,
      },
      orderBy: {
        onlineDisplayName: 'asc',
      },
    })
  }
  return projects
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
      description: 'asc',
    },
  })
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

export default async function DataMapPage() {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }
  const feAccountsData = getFeAccountsFromBlackbaud(user.team.id)
  const projectsData = getVirtuousProjects(user.team.id)
  const mappingData = getProjectAccountMappings(user.team.id)
  const [projects, feAccounts, mappings] = await Promise.all([
    projectsData,
    feAccountsData,
    mappingData,
  ])
  console.log('accounts length: ', feAccounts.length)
  console.log('projects length: ', projects.length)

  return (
    <>
      <div className="container grid w-screen  grid-cols-3  flex-col items-center bg-dark  lg:max-w-none lg:grid-cols-3 lg:px-0">
        {projects && feAccounts ? (
          <MappingCreateButton
            projects={projects}
            feAccounts={feAccounts}
            mappings={mappings}
            className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          />
        ) : (
          `getting projects and accounts...`
        )}
      </div>
    </>
  )
}
