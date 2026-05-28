/**
 * Careers Module — Server-side Job Validation
 *
 * Used in the apply/[roleId] page.tsx (server component) to gate access.
 * - Fetches the role from Firestore
 * - Auto-closes expired roles
 * - Returns a validation result so the page can render accordingly
 */

import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import type { JobRole, JobStatus } from './types'

// Use the shared Firestore instance from `lib/firebaseConfig`
function getServerDb() {
  return db
}

export type ValidationResult =
  | { ok: true; role: JobRole }
  | { ok: false; reason: 'not-found' | 'closed' | 'draft' | 'archived' | 'expired'; role?: JobRole }

/**
 * Validate a role by its Firestore document ID.
 *
 * 1. If no document → not-found
 * 2. If expiryDate < today → auto-mark CLOSED in Firestore, return expired
 * 3. If status !== 'open' → return the specific reason
 * 4. Otherwise → ok
 *
 * @param preview  If true, bypass status check (for admin/recruiter preview)
 */
export async function validateRole(
  roleId: string,
  preview = false
): Promise<ValidationResult> {
  try {
    const db = getServerDb()
    if (!db) {
      console.warn('[careers] Firestore not initialized (missing Firebase config). Skipping validation.')
      return { ok: false, reason: 'not-found' }
    }
    const roleDoc = await getDoc(doc(db, 'roles', roleId))

    if (!roleDoc.exists()) {
      return { ok: false, reason: 'not-found' }
    }

    const data = roleDoc.data()
    const role: JobRole = { id: roleDoc.id, ...data } as JobRole

    // ── Auto-close expired roles ──────────────────────────────
    if (role.expiryDate) {
      const expiry = new Date(role.expiryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (expiry < today && role.status === 'open') {
        // Side-effect: update Firestore so it stays closed for everyone
        try {
          await updateDoc(doc(db, 'roles', roleId), { status: 'closed' })
        } catch (e) {
          console.error('[careers] failed to auto-close expired role:', e)
        }
        role.status = 'closed'
        return { ok: false, reason: 'expired', role }
      }
    }

    // ── Admin/recruiter preview bypass ────────────────────────
    if (preview) {
      return { ok: true, role }
    }

    // ── Status gate ──────────────────────────────────────────
    if (role.status !== 'open') {
      const reason = (['closed', 'draft', 'archived'] as const).includes(role.status as any)
        ? (role.status as 'closed' | 'draft' | 'archived')
        : 'closed'
      return { ok: false, reason, role }
    }

    return { ok: true, role }
  } catch (error) {
    console.error('[careers] validateRole error:', error)
    return { ok: false, reason: 'not-found' }
  }
}
