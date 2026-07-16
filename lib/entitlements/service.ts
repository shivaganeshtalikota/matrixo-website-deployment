// ============================================================
// Entitlements service — reads/writes the `subscriptions` collection.
//
// Security is enforced by Firestore rules (see firestore.rules):
//   - a user may CREATE a pending subscription for themselves only
//   - a user may READ their own subscriptions
//   - only employees may flip status to active/rejected
// The client therefore cannot self-grant `active`; it can only claim a
// payment, which an employee verifies. Never trust status from the client.
// ============================================================

import { db } from '@/lib/firebaseConfig'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore'
import { Subscription, ProductId, SubscriptionStatus } from './types'

const SUBSCRIPTIONS = 'subscriptions'

function isActive(sub: Subscription, now: number): boolean {
  if (sub.status !== 'active') return false
  if (sub.expiresAt && sub.expiresAt < now) return false
  return true
}

/**
 * Returns true if the user currently holds an active entitlement for
 * the product. Fails closed (returns false) on any error so a lookup
 * failure never accidentally unlocks premium content.
 */
export async function hasActiveEntitlement(
  userId: string,
  product: ProductId
): Promise<boolean> {
  if (!userId) return false
  try {
    const q = query(
      collection(db, SUBSCRIPTIONS),
      where('userId', '==', userId),
      where('product', '==', product),
      where('status', '==', 'active')
    )
    const snap = await getDocs(q)
    const now = Date.now()
    return snap.docs.some((d) => isActive(d.data() as Subscription, now))
  } catch (error) {
    console.error('[entitlements] lookup failed:', error)
    return false
  }
}

/**
 * Live entitlement + latest-status subscription for a product. Returns
 * an unsubscribe function. Used by the paywall so the UI reacts the
 * moment an admin verifies a payment.
 */
export function subscribeToEntitlement(
  userId: string,
  product: ProductId,
  cb: (state: { entitled: boolean; latest: Subscription | null }) => void
): () => void {
  if (!userId) {
    cb({ entitled: false, latest: null })
    return () => {}
  }
  const q = query(
    collection(db, SUBSCRIPTIONS),
    where('userId', '==', userId),
    where('product', '==', product)
  )
  return onSnapshot(
    q,
    (snap) => {
      const now = Date.now()
      const subs = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Subscription) }))
        .sort((a, b) => b.createdAt - a.createdAt)
      const entitled = subs.some((s) => isActive(s, now))
      cb({ entitled, latest: subs[0] || null })
    },
    (error) => {
      console.error('[entitlements] subscribe failed:', error)
      cb({ entitled: false, latest: null })
    }
  )
}

/**
 * Records a manual-UPI purchase claim as a `pending` subscription.
 * An employee later verifies the UPI reference and activates it.
 */
export async function createPurchaseRequest(params: {
  userId: string
  product: ProductId
  planLabel: string
  amount: number
  upiRef: string
}): Promise<string> {
  const { userId, product, planLabel, amount, upiRef } = params
  const trimmedRef = upiRef.trim()
  if (!userId) throw new Error('You must be signed in to purchase.')
  if (trimmedRef.length < 6) throw new Error('Enter the UPI reference / UTR from your payment.')

  const payload: Subscription = {
    userId,
    product,
    planLabel,
    status: 'pending' as SubscriptionStatus,
    amount,
    upiRef: trimmedRef,
    createdAt: Date.now(),
  }
  const ref = await addDoc(collection(db, SUBSCRIPTIONS), payload)
  return ref.id
}

// ---- Admin / employee operations (guarded by isEmployee() in rules) ----

/**
 * Live feed of subscriptions by status for the admin verification panel.
 * Employees can read all subscriptions per the security rules.
 */
export function subscribeByStatus(
  status: SubscriptionStatus,
  cb: (subs: Subscription[]) => void
): () => void {
  const q = query(collection(db, SUBSCRIPTIONS), where('status', '==', status))
  return onSnapshot(
    q,
    (snap) => {
      const subs = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Subscription) }))
        .sort((a, b) => b.createdAt - a.createdAt)
      cb(subs)
    },
    (error) => {
      console.error('[entitlements] admin subscribe failed:', error)
      cb([])
    }
  )
}

/**
 * Approves a pending payment: grants the entitlement. Only employees can
 * perform this (enforced by rules). `expiresAt` omitted = lifetime.
 */
export async function approveSubscription(
  subId: string,
  verifiedBy: string,
  opts?: { expiresAt?: number; note?: string }
): Promise<void> {
  await updateDoc(doc(db, SUBSCRIPTIONS, subId), {
    status: 'active' as SubscriptionStatus,
    activatedAt: Date.now(),
    verifiedBy,
    ...(opts?.expiresAt ? { expiresAt: opts.expiresAt } : {}),
    ...(opts?.note ? { note: opts.note } : {}),
  })
}

/** Rejects a payment claim (bad/duplicate UTR). Only employees. */
export async function rejectSubscription(
  subId: string,
  verifiedBy: string,
  note?: string
): Promise<void> {
  await updateDoc(doc(db, SUBSCRIPTIONS, subId), {
    status: 'rejected' as SubscriptionStatus,
    verifiedBy,
    ...(note ? { note } : {}),
  })
}

/**
 * All subscriptions for a user (for the dashboard payment history),
 * newest first.
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  if (!userId) return []
  try {
    // Single-field equality only (no composite index needed); sort in memory.
    const q = query(collection(db, SUBSCRIPTIONS), where('userId', '==', userId))
    const snap = await getDocs(q)
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Subscription) }))
      .sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('[entitlements] history failed:', error)
    return []
  }
}
