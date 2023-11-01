import { getServerSession } from 'next-auth/next'
import { z } from 'zod'

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { reFetch } from '@/lib/reFetch'

async function upsertProject(project, userId) {
  await db.feProject.upsert({
    where: {
      userId_project_id: {
        userId: userId,
        project_id: project.project_id,
      },
    },
    update: {
      projectCode: project.projectCode,
      ui_project_id: project.ui_project_id,
      start_date: new Date(project.start_date),
      end_date: new Date(project.end_date),
      location: project.location,
      division: project.division,
      department: project.division,
      type: project.type,
      status: project.status,
      prevent_data_entry: project.prevent_data_entry,
      prevent_posting_after: project.prevent_posting_after,
      posting_date: project.posting_date
        ? new Date(project.posting_date)
        : null,
      account_restrictions: project.account_restrictions,
      customFields: project.customFields,
      added_by: project.added_by,
      modified_by: project.modified_by,
      date_added: project.date_added ? new Date(project.date_added) : null,
      date_modified: project.date_modified
        ? new Date(project.date_modified)
        : null,
    },
    create: {
      userId: userId,
      project_id: project.project_id,
      projectCode: project.projectCode,
      ui_project_id: project.ui_project_id,
      start_date: new Date(project.start_date),
      end_date: new Date(project.end_date),
      location: project.location,
      division: project.division,
      department: project.division,
      type: project.type,
      status: project.status,
      prevent_data_entry: project.prevent_data_entry,
      prevent_posting_after: project.prevent_posting_after,
      posting_date: project.posting_date
        ? new Date(project.posting_date)
        : null,
      account_restrictions: project.account_restrictions,
      customFields: project.customFields,
      added_by: project.added_by,
      modified_by: project.modified_by,
      date_added: project.date_added ? new Date(project.date_added) : null,
      date_modified: project.date_modified
        ? new Date(project.date_modified)
        : null,
    },
  })
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 })
    }
    const { user } = session
    console.log('GET RE Projects API Route')
    const res2 = await reFetch(
      'https://api.sky.blackbaud.com/generalledger/v1/projects',
      'GET',
      user.id
    )
    console.log(res2.status)
    if (res2.status !== 200) {
      console.log('returning status')
      return res2
    }
    console.log('returning something else')
    const data = await res2.json()
    console.log(data.value)
    data?.value.forEach((project) => {
      upsertProject(project, session.user.id)
    })
    return new Response(JSON.stringify(data))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }
    return new Response(null, { status: 500 })
  }
}
