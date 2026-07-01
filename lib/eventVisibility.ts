'use client'

import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore'
import { db, firebaseReady } from './firebaseConfig'

export const EVENT_VISIBILITY_COLLECTION = 'eventVisibility'

export interface EventVisibilityRecord {
  id?: string
  eventSlug: string
  eventId?: string
  eventTitle?: string
  hidden: boolean
  updatedAt?: Timestamp | null
  updatedBy?: string
  updatedByName?: string
}

export function useEventVisibility() {
  const [visibilityMap, setVisibilityMap] = useState<Record<string, EventVisibilityRecord>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseReady) {
      setVisibilityMap({})
      setLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      collection(db, EVENT_VISIBILITY_COLLECTION),
      (snapshot) => {
        const nextMap: Record<string, EventVisibilityRecord> = {}
        snapshot.docs.forEach((eventDoc) => {
          const data = eventDoc.data() as EventVisibilityRecord
          const slug = data.eventSlug || eventDoc.id
          nextMap[slug] = {
            id: eventDoc.id,
            ...data,
            eventSlug: slug,
            hidden: Boolean(data.hidden),
          }
        })
        setVisibilityMap(nextMap)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching event visibility:', error)
        setVisibilityMap({})
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { visibilityMap, loading }
}

export async function updateEventVisibility(
  eventSlug: string,
  updates: Omit<EventVisibilityRecord, 'id' | 'eventSlug' | 'hidden'> & {
    hidden: boolean
  }
) {
  if (!firebaseReady) {
    throw new Error('Firebase is not configured.')
  }

  await setDoc(
    doc(db, EVENT_VISIBILITY_COLLECTION, eventSlug),
    {
      eventSlug,
      hidden: updates.hidden,
      eventId: updates.eventId || null,
      eventTitle: updates.eventTitle || null,
      updatedAt: serverTimestamp(),
      updatedBy: updates.updatedBy || null,
      updatedByName: updates.updatedByName || null,
    },
    { merge: true }
  )
}
