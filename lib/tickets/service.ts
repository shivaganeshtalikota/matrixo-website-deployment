// ============================================================
// Event tickets — owner-scoped records surfaced in the user dashboard
// (with a scannable QR = transactionCode). Stored at event_tickets/*.
//
// NOTE: the current event registration flows post to a Google Sheet and
// only track a de-dupe list in localStorage — they do NOT yet persist a
// per-user ticket here. `createTicket` is the integration point to call
// from those flows so the dashboard shows real tickets. Until then the
// tickets section renders its (honest) empty state.
// ============================================================

import { db } from '@/lib/firebaseConfig'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

export type TicketStatus = 'pending' | 'confirmed' | 'cancelled'

export interface EventTicket {
  id?: string
  userId: string
  eventId: string
  eventTitle: string
  ticketType: string
  price: number
  transactionCode: string // QR payload / verification reference
  status: TicketStatus
  eventDate?: string
  createdAt: number
}

const COLLECTION = 'event_tickets'

/** All tickets for a user, newest first. */
export async function getUserTickets(userId: string): Promise<EventTicket[]> {
  if (!userId) return []
  try {
    const q = query(collection(db, COLLECTION), where('userId', '==', userId))
    const snap = await getDocs(q)
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as EventTicket) }))
      .sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('[tickets] fetch failed:', error)
    return []
  }
}

/** Integration point for registration flows to persist a ticket. */
export async function createTicket(
  ticket: Omit<EventTicket, 'id' | 'createdAt' | 'status'> & { status?: TicketStatus }
): Promise<string> {
  const payload: EventTicket = {
    ...ticket,
    status: ticket.status || 'pending',
    createdAt: Date.now(),
  }
  const ref = await addDoc(collection(db, COLLECTION), payload)
  return ref.id
}
