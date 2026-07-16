// ============================================================
// GrowGrid™ Firestore service — persists per-user learning progress
// at growgrid_progress/{uid}. Owner-only access (see firestore.rules).
// ============================================================

import { db } from '@/lib/firebaseConfig'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { GrowGridProgressDoc, ModuleProgress } from './types'
import { getAllModules } from './content'

const COLLECTION = 'growgrid_progress'

function emptyDoc(userId: string): GrowGridProgressDoc {
  const now = Date.now()
  return {
    userId,
    totalXP: 0,
    learningMinutes: 0,
    moduleProgress: {},
    createdAt: now,
    updatedAt: now,
  }
}

/** Reads the user's progress doc, creating an empty one on first visit. */
export async function getOrCreateProgress(userId: string): Promise<GrowGridProgressDoc> {
  const ref = doc(db, COLLECTION, userId)
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data() as GrowGridProgressDoc
  const fresh = emptyDoc(userId)
  await setDoc(ref, fresh)
  return fresh
}

/** Live subscription to the user's progress doc. */
export function subscribeToProgress(
  userId: string,
  cb: (doc: GrowGridProgressDoc | null) => void
): () => void {
  const ref = doc(db, COLLECTION, userId)
  return onSnapshot(
    ref,
    (snap) => cb(snap.exists() ? (snap.data() as GrowGridProgressDoc) : null),
    (error) => {
      console.error('[growgrid] progress subscribe failed:', error)
      cb(null)
    }
  )
}

/**
 * Recomputes denormalized totals (XP, learning minutes) from the module
 * progress map so they can never drift from the source of truth.
 */
function recomputeTotals(moduleProgress: Record<string, ModuleProgress>) {
  const modules = getAllModules()
  let totalXP = 0
  let learningMinutes = 0
  for (const m of modules) {
    const mp = moduleProgress[m.id]
    if (mp?.status === 'completed') {
      totalXP += m.xp
      learningMinutes += m.minutes
    }
  }
  return { totalXP, learningMinutes }
}

/**
 * Sets a module's progress and persists recomputed totals. Marking a
 * module completed awards its XP (idempotent — re-completing does not
 * double-count because totals are recomputed, not incremented).
 */
export async function setModuleProgress(
  userId: string,
  moduleId: string,
  progress: number
): Promise<GrowGridProgressDoc> {
  const ref = doc(db, COLLECTION, userId)
  const current = await getOrCreateProgress(userId)
  const now = Date.now()

  const clamped = Math.max(0, Math.min(100, Math.round(progress)))
  const status: ModuleProgress['status'] =
    clamped >= 100 ? 'completed' : clamped > 0 ? 'in_progress' : 'not_started'

  const nextModuleProgress: Record<string, ModuleProgress> = {
    ...current.moduleProgress,
    [moduleId]: {
      status,
      progress: clamped,
      updatedAt: now,
      ...(status === 'completed' ? { completedAt: now } : {}),
    },
  }

  const { totalXP, learningMinutes } = recomputeTotals(nextModuleProgress)

  const next: GrowGridProgressDoc = {
    ...current,
    moduleProgress: nextModuleProgress,
    totalXP,
    learningMinutes,
    updatedAt: now,
  }
  await setDoc(ref, next)
  return next
}

export async function completeModule(userId: string, moduleId: string) {
  return setModuleProgress(userId, moduleId, 100)
}
