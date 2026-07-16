// ============================================================
// MentorMatrix™ Firestore service — persists mentorship session
// requests at mentormatrix_sessions/*. Owner-scoped (see rules).
// ============================================================

import { db } from '@/lib/firebaseConfig'
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore'
import { MentorSession } from './types'

const COLLECTION = 'mentormatrix_sessions'

// A session counts as "active" (against the free-tier cap) until it is
// completed or cancelled.
const ACTIVE_STATUSES = new Set(['requested', 'confirmed'])

export function isActiveSession(s: MentorSession): boolean {
  return ACTIVE_STATUSES.has(s.status)
}

/** Live feed of the user's mentorship sessions (newest first). */
export function subscribeToSessions(
  userId: string,
  cb: (sessions: MentorSession[]) => void
): () => void {
  if (!userId) {
    cb([])
    return () => {}
  }
  const q = query(collection(db, COLLECTION), where('userId', '==', userId))
  return onSnapshot(
    q,
    (snap) => {
      const sessions = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as MentorSession) }))
        .sort((a, b) => b.createdAt - a.createdAt)
      cb(sessions)
    },
    (error) => {
      console.error('[mentormatrix] subscribe failed:', error)
      cb([])
    }
  )
}

/**
 * Creates a mentorship session request. Callers must enforce the free
 * vs premium booking cap before calling (the UI does, and the count is
 * derived from the same live session feed).
 */
export async function requestSession(params: {
  userId: string
  userName: string
  mentorId: string
  mentorName: string
  focusArea: string
  preferredTime: string
  note: string
  priority: boolean
}): Promise<string> {
  const { userId } = params
  if (!userId) throw new Error('You must be signed in to book a session.')

  const now = Date.now()
  const session: MentorSession = {
    userId,
    userName: params.userName || 'matriXO Learner',
    mentorId: params.mentorId,
    mentorName: params.mentorName,
    focusArea: params.focusArea.trim().slice(0, 120),
    preferredTime: params.preferredTime.trim().slice(0, 120),
    note: params.note.trim().slice(0, 500),
    status: 'requested',
    priority: params.priority,
    createdAt: now,
    updatedAt: now,
  }
  const ref = await addDoc(collection(db, COLLECTION), session)
  return ref.id
}
