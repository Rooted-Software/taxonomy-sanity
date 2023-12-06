import { DashboardConfig } from "types"

export const dashboardConfig: DashboardConfig = {
  navigation: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "clipboard",
    },
    {
      title: "Batch Management",
      href: "/dashboard/batchManagement",
      icon: "wallet",
    },
    {
      title: "Project Mapping",
      href: "/dashboard/projectMapping",
      icon: "map",
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: "billing",
    },
    {
      title: "Team",
      href: "/dashboard/team",
      icon: "users",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
    },
  ],
}
