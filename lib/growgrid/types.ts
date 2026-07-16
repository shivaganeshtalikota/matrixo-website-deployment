// ============================================================
// GrowGrid™ — Adaptive Learning Pathways: domain types
// ============================================================

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type Tier = 'free' | 'premium'

export interface GrowGridModule {
  id: string
  title: string
  description: string
  duration: string // human label, e.g. "2 hours"
  minutes: number // numeric, for learning-time accounting
  difficulty: Difficulty
  tier: Tier
  xp: number
  lessons: string[]
}

export interface GrowGridPath {
  id: string
  name: string
  description: string
  color: string // tailwind gradient, e.g. "from-blue-500 to-cyan-500"
  iconKey: 'code' | 'palette' | 'chart' | 'mic' | 'rocket'
  estimatedTime: string
  modules: GrowGridModule[]
}

export type ModuleStatus = 'not_started' | 'in_progress' | 'completed'

export interface ModuleProgress {
  status: ModuleStatus
  progress: number // 0-100
  updatedAt: number
  completedAt?: number
}

/**
 * Persisted per-user GrowGrid progress. Stored at growgrid_progress/{uid}.
 * moduleProgress is keyed by moduleId. XP and learningMinutes are
 * denormalized totals kept in sync as modules complete.
 */
export interface GrowGridProgressDoc {
  userId: string
  totalXP: number
  learningMinutes: number
  moduleProgress: Record<string, ModuleProgress>
  createdAt: number
  updatedAt: number
}

export const XP_PER_LEVEL = 500

export function levelFromXP(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1
}

export function xpIntoLevel(totalXP: number): number {
  return totalXP % XP_PER_LEVEL
}
