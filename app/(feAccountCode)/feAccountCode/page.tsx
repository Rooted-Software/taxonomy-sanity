import { ApiRefreshButton } from '@/components/dashboard/api-refresh-button'
import { DashboardHeader } from '@/components/dashboard/header'
import { KeygenButton } from '@/components/dashboard/keygen-button'
import { MappingCreateButton } from '@/components/dashboard/mapping-create-button'
import { ReGetAccountsButton } from '@/components/dashboard/re-get-accounts'
import { ReGetProjectsButton } from '@/components/dashboard/re-get-projects'
import { UniversalButton } from '@/components/dashboard/universal-button'
import { VirtuousGetProjectsButton } from '@/components/dashboard/virtuous-get-projects'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { PostItem } from '@/components/post-item'
import { DashboardShell } from '@/components/shell'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/session'
import { getVirtuousProjects } from '@/lib/virProjects'
import { User } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import * as React from 'react'

const getFeProjects = async () => {
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
    orderBy: {
      description: 'asc',
    },
  })
}

export default async function ReAccountsPage() {
  const user = await getCurrentUser()
  const projects = (await getVirtuousProjects(user?.team.id)) || []
  const feProjects = (await getFeProjects()) || []

  if (!user && authOptions?.pages?.signIn) {
    redirect(authOptions.pages.signIn)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Accounts"
        text="Accounts Matching Page"
      ></DashboardHeader>
      <div className="">
        Get RE Accounts (Universal)
        <UniversalButton
          title="Get Accounts"
          route="/api/reAccounts"
          method="GET"
          fields={['account_code_id', 'description', 'value']}
        />
      </div>
      <div className="">
        Get Virtuous Projects (Universal)
        <UniversalButton
          title="Get Projects"
          route="/api/virProjects"
          method="GET"
          fields={['id', 'name', 'projectCode']}
        />
      </div>
      <div className="">
        Get Virtuous Projects
        <VirtuousGetProjectsButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
      </div>
      <div>
        {projects && feProjects ? (
          <MappingCreateButton
            projects={projects}
            feProjects={feProjects}
            className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          />
        ) : null}
      </div>
      {/*
      <div className="">Test KeyGen
        <KeygenButton className="border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" />
        </div> */}
    </DashboardShell>
  )
}
