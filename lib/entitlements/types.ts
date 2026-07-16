// ============================================================
// Entitlements & Subscriptions — shared across beta products
// (GrowGrid, PlayCred, MentorMatrix, SkillDNA Premium, ImpactVault).
//
// Payment model is MANUAL UPI + admin verification (same trust model
// as the DevAgents event flow): the user pays to a UPI ID, submits the
// UPI reference (UTR), and an employee verifies it, flipping the
// subscription from `pending` to `active`. No client-trusted money.
// ============================================================

export type ProductId =
  | 'growgrid'
  | 'playcred'
  | 'mentormatrix'
  | 'skilldna'
  | 'impactvault'

export type SubscriptionStatus =
  | 'pending' // payment claimed, awaiting admin verification
  | 'active' // verified, entitlement granted
  | 'rejected' // verification failed
  | 'expired' // past expiresAt

export interface Subscription {
  id?: string
  userId: string
  product: ProductId
  planLabel: string // e.g. "GrowGrid Premium — Lifetime"
  status: SubscriptionStatus
  amount: number // in INR
  upiRef: string // UTR / reference the user submits
  createdAt: number
  activatedAt?: number
  expiresAt?: number // omitted = lifetime
  verifiedBy?: string // employeeId who verified
  note?: string
}

/**
 * Pricing for each premium product. Single source of truth so the
 * paywall UI, the purchase request, and admin verification agree.
 */
export interface ProductPlan {
  product: ProductId
  planLabel: string
  amount: number
  perks: string[]
}

export const PRODUCT_PLANS: Record<ProductId, ProductPlan> = {
  growgrid: {
    product: 'growgrid',
    planLabel: 'GrowGrid Premium — Lifetime',
    amount: 499,
    perks: [
      'Unlock every learning path & advanced module',
      'Hands-on projects with reviewed submissions',
      'Completion certificates for your wallet',
      'Priority access to new curriculum',
    ],
  },
  playcred: {
    product: 'playcred',
    planLabel: 'PlayCred Pro — Lifetime',
    amount: 299,
    perks: [
      'Issue unlimited verifiable credentials',
      'Custom credential branding',
      'Public verification page',
    ],
  },
  mentormatrix: {
    product: 'mentormatrix',
    planLabel: 'MentorMatrix Plus — 3 Months',
    amount: 999,
    perks: [
      'Unlimited AI-matched mentor sessions',
      'Priority booking with top mentors',
      'Session recordings & notes',
    ],
  },
  skilldna: {
    product: 'skilldna',
    planLabel: 'SkillDNA Premium — Lifetime',
    amount: 399,
    perks: [
      'Full skill-gap report & AI coaching',
      'Unlimited re-assessments',
      'Downloadable profile PDF',
    ],
  },
  impactvault: {
    product: 'impactvault',
    planLabel: 'ImpactVault — Institution License',
    amount: 0, // B2B, handled via sales — not self-serve
    perks: [],
  },
}
