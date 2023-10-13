import { virDateOptions } from './utils'
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

export const getVirtuousProjects = async (
  teamId,
  projectIdsOrDays: number | string[] = 30
) => {
  const projects: any[] = []
  let hasMoreData = true

  do {
    const body = {
      groups: [
        {
          conditions: Array.isArray(projectIdsOrDays)
            ? projectIdsOrDays.map((id) => ({
                parameter: 'ID',
                operator: 'Is',
                value: id,
              }))
            : [
                {
                  parameter: 'Create Date',
                  operator: 'LessThanOrEqual',
                  value: virDateOptions[projectIdsOrDays],
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
      `https://api.virtuoussoftware.com/api/Project/Query?skip=${projects.length}&take=1000`,
      'POST',
      teamId,
      body
    )

    if (res.status === 200) {
      const data = await res.json()
      if (data) {
        projects.push(
          ...data.list.map((project) => ({
            ...project,
            teamId: teamId,
            projectCode: project.projectCode || 'none',
            createdDateTimeUTC: new Date(project.createDateTimeUtc),
            modifiedDateTimeUTC: new Date(project.modifiedDateTimeUtc),
          }))
        )

        if (data.total < 1000) {
          hasMoreData = false
        }
      }
    } else {
      throw new Error(
        `Failed to get project (${res.status}): ${await res.text()}`
      )
    }
  } while (hasMoreData)

  return projects
}
