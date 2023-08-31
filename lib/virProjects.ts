import { virApiFetch } from './virApiFetch'
import { db } from '@/lib/db'

export const getProjectAccountMappings = async (teamId) => {
  return await db.projectAccountMapping.findMany({
    select: {
      id: true,
      virProjectId: true,
      feAccountId: true,
      virProjectName: true,
    },
    where: {
      teamId: teamId,
    },
  })
}

export const getVirtuousProjects = async (teamId) => {
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

  if (res.status === 200) {
    const data = await res.json()
    if (data) {
      return data.list.map((project) => ({
        ...project,
        teamId: teamId,
        projectCode: project.projectCode || 'none',
        createdDateTimeUTC: new Date(project.createDateTimeUtc),
        modifiedDateTimeUTC: new Date(project.modifiedDateTimeUtc),
      }))
    }
  }
  console.log('no projects')
}
