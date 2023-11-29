import { Icons } from '@/components/icons'

export type NavItem = {
  title: string
  href: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
} & (
  | {
      href: string
      items?: never
      slug?: string
    }
  | {
      href?: string
      items: NavLink[]
      slug?: string
    }
)

export type SiteConfig = {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}

export type DocsConfig = {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export type MarketingConfig = {
  mainNav: MainNavItem[]
}

export type DashboardConfig = {
  navigation: SidebarNavItem[]}

export type SubscriptionPlan = {
  name: string
  description: string
  stripePriceId: string
}

export type TeamSubscriptionPlan = SubscriptionPlan &
  Pick<Team, 'stripeCustomerId' | 'stripeSubscriptionId'> & {
    stripeCurrentPeriodEnd: number
    isPro: boolean
  }
