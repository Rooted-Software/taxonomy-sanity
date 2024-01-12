import { Stack } from '@sanity/ui'

import { dashboardConfig } from '@/config/dashboard'
import { MainNav } from '@/components/main-nav'

// Adds markup and invokes renderDefault()
export function enhancedNavbar(props: any) {
  return (
    <Stack>
      <header className="container sticky top-0 z-40 bg-dark">
        <div className="flex h-16 items-center justify-between border-b border-b-slate-200 py-4">
          <MainNav items={dashboardConfig.mainNav} />
        </div>
      </header>
      <>{props.renderDefault(props)}</>
    </Stack>
  )
}
