// ============================================================
// PlayCred™ Firestore service — mint & read verifiable credentials.
//
// Storage: playcred_credentials/{userId}_{pathId} (deterministic id →
// exactly one credential per path per user, and mint is idempotent).
// Rules: public read (verification), owner-scoped create, immutable.
//
// HARDENING PATH: issuance is currently client-side under the owner's
// authenticated identity. To make credentials unforgeable, move minting
// to a server route that verifies GrowGrid completion via the Admin SDK
// and signs the credential with a server key (blocked on rotating the
// leaked service-account key first).
// ============================================================

import { db } from '@/lib/firebaseConfig'
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import SHA256 from 'crypto-js/sha256'
import { PlayCredCredential, CredentialCanonical } from './types'
import { getCredentialTemplate } from './content'

const COLLECTION = 'playcred_credentials'

export function credentialId(userId: string, pathId: string): string {
  return `${userId}_${pathId}`
}

/** SHA-256 over the canonical fields — tamper-evidence for verification. */
export function computeIntegrityHash(c: CredentialCanonical): string {
  const canonical = `${c.userId}|${c.pathId}|${c.title}|${c.issuedAt}`
  return SHA256(canonical).toString()
}

/** True if the stored hash matches a recompute of the canonical fields. */
export function verifyIntegrity(cred: PlayCredCredential): boolean {
  const recomputed = computeIntegrityHash({
    userId: cred.userId,
    pathId: cred.pathId,
    title: cred.title,
    issuedAt: cred.issuedAt,
  })
  return recomputed === cred.integrityHash
}

/**
 * Mints the credential for a completed path if the user does not already
 * hold it. Idempotent (deterministic id + existence check). Returns the
 * credential, or null if the path has no template.
 */
export async function mintPathCredential(
  userId: string,
  ownerName: string,
  pathId: string
): Promise<PlayCredCredential | null> {
  const template = getCredentialTemplate(pathId)
  if (!template) return null

  const id = credentialId(userId, pathId)
  const ref = doc(db, COLLECTION, id)
  const existing = await getDoc(ref)
  if (existing.exists()) return existing.data() as PlayCredCredential

  const issuedAt = Date.now()
  const cred: PlayCredCredential = {
    userId,
    ownerName: ownerName || 'matriXO Learner',
    pathId,
    title: template.title,
    description: template.description,
    category: template.category,
    rarity: template.rarity,
    colorFrom: template.colorFrom,
    colorTo: template.colorTo,
    iconKey: template.iconKey,
    issuedAt,
    integrityHash: computeIntegrityHash({ userId, pathId, title: template.title, issuedAt }),
  }
  await setDoc(ref, cred)
  return cred
}

/** Live feed of a user's credentials (newest first). */
export function subscribeToCredentials(
  userId: string,
  cb: (creds: PlayCredCredential[]) => void
): () => void {
  if (!userId) {
    cb([])
    return () => {}
  }
  const q = query(collection(db, COLLECTION), where('userId', '==', userId))
  return onSnapshot(
    q,
    (snap) => {
      const creds = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as PlayCredCredential) }))
        .sort((a, b) => b.issuedAt - a.issuedAt)
      cb(creds)
    },
    (error) => {
      console.error('[playcred] subscribe failed:', error)
      cb([])
    }
  )
}

/** Public: fetch a single credential by id for the verification page. */
export async function getCredentialById(id: string): Promise<PlayCredCredential | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, id))
    if (!snap.exists()) return null
    return { id: snap.id, ...(snap.data() as PlayCredCredential) }
  } catch (error) {
    console.error('[playcred] fetch failed:', error)
    return null
  }
}
