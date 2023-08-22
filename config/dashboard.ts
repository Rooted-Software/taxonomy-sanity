import { DashboardConfig } from 'types'

export const dashboardConfig: DashboardConfig = {
  mainNav: [],
  sidebarNav: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'clipboard',
    },
    {
      title: 'Batch Management',
      href: '/batchManagement',
      icon: 'wallet',
    },
    {
      title: 'Project Mapping',
      href: '/projectMapping',
      icon: 'map',
    },
    {
      title: 'Billing',
      href: '/dashboard/billing',
      icon: 'billing',
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: 'settings',
    },
    {
      title: 'Support',
      href: '/support',
      icon: 'lifeRing'
    },
  ],
}
