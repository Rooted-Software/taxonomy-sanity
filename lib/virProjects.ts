import { db } from '@/lib/db'
import { virApiFetch } from './virApiFetch'

export const getProjectAccountMappings = async (teamId) => {
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

export const getVirtuousProjects = async (teamId) => {
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
    const res = await virApiFetch('https://api.virtuoussoftware.com/api/Project/Query?skip=0&take=1000', 'POST', teamId, body)

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

export async function upsertProject(project, teamId) {
    await db.virtuousProject.upsert({
      where: {
        teamId_id: { 
          teamId: teamId, 
          id: project.id,
        }
        
      },
      update: {
        name: project.name,
        projectCode: project.projectCode,
        externalAccountingCode: project.externalAccountingCode || 'none',
        onlineDisplayName: project.onlineDisplayName,
        description: project.description,
        isPublic: project.isPublic === true,
        isActive: project.isActive === true,
        isTaxDeductible: project.isTaxDeductible === true,
        giftSpecifications: project.giftSpecifications,
        customFields: project.customFields,
        createdDateTimeUTC: new Date(project.createDateTimeUtc),
        modifiedDateTimeUTC: new Date(project.modifiedDateTimeUtc),
      },
      create: {
        teamId: teamId,
        id: project.id,
        name: project.name,
        projectCode: project.projectCode || 'none',
        externalAccountingCode: project.externalAccountingCode,
        onlineDisplayName: project.onlineDisplayName,
        description: project.description,
        isPublic: project.isPublic === true,
        isActive: project.isActive === true,
        isTaxDeductible: project.isTaxDeductible === true,
        giftSpecifications: project.giftSpecifications,
        customFields: project.customFields,
        createdDateTimeUTC: new Date(project.createDateTimeUtc),
        modifiedDateTimeUTC: new Date(project.modifiedDateTimeUtc),
      },
    })
  }


export async function insertManyProject(data, teamId) {
  await db.virtuousProject.deleteMany({
    where: {
      teamId: teamId,
  }}) 

  await db.virtuousProject.createMany({
    data: data,
    skipDuplicates: true, 
  })
}