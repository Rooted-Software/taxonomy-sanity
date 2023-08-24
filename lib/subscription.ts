// @ts-nocheck
// TODO: Fix this when we turn strict mode on.
import { freePlan, proPlan } from '@/config/subscriptions'
import { db } from '@/lib/db'
import { TeamSubscriptionPlan } from 'types'

export async function getTeamSubscriptionPlan(
  teamId: string
): Promise<TeamSubscriptionPlan> {
  const team = await db.team.findFirst({
    where: {
      id: teamId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
    },
  })

  if (!team) {
    throw new Error('Team not found')
  }

  // Check if team is on a pro plan.
  const isPro =
    team.stripePriceId &&
    team.stripeCurrentPeriodEnd?.getTime() + 86_400_000 > Date.now()

  const plan = isPro ? proPlan : freePlan

  return {
    ...plan,
    ...team,
    stripeCurrentPeriodEnd: team.stripeCurrentPeriodEnd?.getTime(),
    isPro,
  }
}
