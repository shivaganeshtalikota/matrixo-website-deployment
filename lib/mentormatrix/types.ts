// ============================================================
// MentorMatrix™ — AI-matched mentorship: domain types
// ============================================================

export type Availability = 'available' | 'busy' | 'booked'

export interface Mentor {
  id: string
  name: string
  title: string
  company: string
  avatar: string // emoji or initial-based avatar
  expertise: string[]
  category: 'Development' | 'Design' | 'Data Science' | 'Business' | 'Cloud'
  rating: number
  totalSessions: number
  responseTime: string
  languages: string[]
  about: string
  pricePerSession: number
  availability: Availability
  social: {
    linkedin?: string
    github?: string
    twitter?: string
  }
}

export type SessionStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled'

/**
 * A persisted mentorship booking. Created as `requested`; a mentor/admin
 * confirms it. Free users are limited to one active session; MentorMatrix
 * Plus removes the cap and flags the request as priority.
 */
export interface MentorSession {
  id?: string
  userId: string
  userName: string
  mentorId: string
  mentorName: string
  focusArea: string
  preferredTime: string
  note: string
  status: SessionStatus
  priority: boolean
  createdAt: number
  updatedAt: number
}
