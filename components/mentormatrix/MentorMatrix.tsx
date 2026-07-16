'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaUserTie,
  FaStar,
  FaVideo,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaTimes,
} from 'react-icons/fa'
import Link from 'next/link'
import { toast } from 'sonner'
import HeadingHighlight from '@/components/HeadingHighlight'
import { useAuth } from '@/lib/AuthContext'
import { Mentor, MentorSession } from '@/lib/mentormatrix/types'
import { MENTORS, MENTOR_CATEGORIES, matchScore } from '@/lib/mentormatrix/content'
import { subscribeToSessions, requestSession, isActiveSession } from '@/lib/mentormatrix/service'
import { subscribeToEntitlement } from '@/lib/entitlements/service'
import UpgradeModal from '@/components/premium/UpgradeModal'

const FREE_SESSION_LIMIT = 1

const availabilityColors = { available: 'bg-green-500', busy: 'bg-yellow-500', booked: 'bg-red-500' }
const availabilityLabels = { available: 'Available Now', busy: 'Limited Slots', booked: 'Fully Booked' }
const statusStyle: Record<MentorSession['status'], string> = {
  requested: 'bg-amber-500/15 text-amber-500',
  confirmed: 'bg-blue-500/15 text-blue-500',
  completed: 'bg-green-500/15 text-green-600',
  cancelled: 'bg-gray-500/15 text-gray-500',
}

export default function MentorMatrix() {
  const { user, loading: authLoading } = useAuth()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'price'>('match')
  const [sessions, setSessions] = useState<MentorSession[]>([])
  const [entitled, setEntitled] = useState(false)
  const [booking, setBooking] = useState<Mentor | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    if (authLoading || !user) return
    const unsubS = subscribeToSessions(user.uid, setSessions)
    const unsubE = subscribeToEntitlement(user.uid, 'mentormatrix', ({ entitled }) => setEntitled(entitled))
    return () => {
      unsubS()
      unsubE()
    }
  }, [user, authLoading])

  const activeCount = useMemo(() => sessions.filter(isActiveSession).length, [sessions])

  const mentors = useMemo(() => {
    return MENTORS.map((m) => ({ ...m, score: matchScore(m, filter) }))
      .filter((m) => filter === 'all' || m.category === filter)
      .sort((a, b) => {
        if (sortBy === 'match') return b.score - a.score
        if (sortBy === 'rating') return b.rating - a.rating
        return a.pricePerSession - b.pricePerSession
      })
  }, [filter, sortBy])

  const avgRating = useMemo(
    () => (MENTORS.reduce((s, m) => s + m.rating, 0) / MENTORS.length).toFixed(1),
    []
  )

  const handleBookClick = (mentor: Mentor) => {
    if (!user) {
      toast.error('Please sign in to book a session.')
      return
    }
    if (!entitled && activeCount >= FREE_SESSION_LIMIT) {
      setShowUpgrade(true)
      return
    }
    setBooking(mentor)
  }

  // ---- Not signed in ----
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="glass-card max-w-md w-full p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-3xl">
            <FaUserTie />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Find your mentor</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign in to get AI-matched with mentors and book sessions.
          </p>
          <Link href="/auth" className="btn-primary inline-block">Sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950/10 dark:to-indigo-950/10 py-20">
      <div className="container-custom px-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full mb-4">
            <FaUserTie className="animate-bounce" />
            <span className="font-bold">MentorMatrix™ Network</span>
            {entitled && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                <FaCrown className="text-amber-200" /> Plus
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <HeadingHighlight text="Find Your Perfect Mentor" />
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            AI-matched mentorship connecting you with experienced industry mentors
          </p>
        </motion.div>

        {/* Stats (real, derived from roster + your bookings) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat delay={0.1} value={`${MENTORS.length}`} label="Mentors in Network" color="text-blue-600 dark:text-blue-400" />
          <Stat delay={0.2} value={`${sessions.length}`} label="Your Sessions" color="text-green-600 dark:text-green-400" />
          <Stat delay={0.3} value={`${avgRating}★`} label="Average Rating" color="text-purple-600 dark:text-purple-400" />
          <Stat delay={0.4} value={entitled ? '∞' : `${Math.max(0, FREE_SESSION_LIMIT - activeCount)}`} label={entitled ? 'Bookings (Plus)' : 'Free Bookings Left'} color="text-orange-600 dark:text-orange-400" />
        </div>

        {/* My sessions */}
        {sessions.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">Your Sessions</h2>
            <div className="space-y-3">
              {sessions.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/40 dark:bg-white/[0.03] px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {s.mentorName} · <span className="text-gray-500">{s.focusArea}</span>
                    </p>
                    <p className="text-xs text-gray-500">Preferred: {s.preferredTime || 'flexible'}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle[s.status]}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premium banner */}
        {!entitled && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowUpgrade(true)}
            className="group mb-8 w-full overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 p-6 text-left transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl"><FaCrown /></div>
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Unlock MentorMatrix Plus</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unlimited priority bookings, session recordings, and top-mentor access.</p>
                </div>
              </div>
              <span className="btn-primary shrink-0 hidden sm:inline-flex">Upgrade ₹999</span>
            </div>
          </motion.button>
        )}

        {/* Filters & sort */}
        <div className="glass-card p-4 mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {MENTOR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                  filter === cat
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow'
                    : 'bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:shadow'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="match">Best match</option>
            <option value="rating">Highest rated</option>
            <option value="price">Lowest price</option>
          </select>
        </div>

        {/* Mentor grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="glass-card p-6 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-3xl">
                    {mentor.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{mentor.name}</h3>
                    <p className="text-xs text-gray-500">{mentor.title}</p>
                    <p className="text-xs text-gray-400">{mentor.company}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-2.5 py-1">
                  {mentor.score}% match
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {mentor.expertise.slice(0, 4).map((e) => (
                  <span key={e} className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs px-2 py-0.5">{e}</span>
                ))}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{mentor.about}</p>

              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <FaStar className="text-yellow-500" /> {mentor.rating} · {mentor.totalSessions} sessions
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${availabilityColors[mentor.availability]}`} />
                    {availabilityLabels[mentor.availability]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">₹{mentor.pricePerSession}</span>
                    <span className="text-gray-500">/session</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {mentor.social.linkedin && <FaLinkedin className="text-gray-400 hover:text-blue-600" />}
                    {mentor.social.github && <FaGithub className="text-gray-400 hover:text-gray-900 dark:hover:text-white" />}
                    {mentor.social.twitter && <FaTwitter className="text-gray-400 hover:text-sky-500" />}
                  </div>
                </div>
                <button
                  onClick={() => handleBookClick(mentor)}
                  disabled={mentor.availability === 'booked'}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mentor.availability === 'booked' ? 'Fully booked' : 'Book session'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking modal */}
      <AnimatePresence>
        {booking && user && (
          <BookingModal
            mentor={booking}
            entitled={entitled}
            userId={user.uid}
            userName={user.displayName || user.email || 'matriXO Learner'}
            defaultFocus={filter !== 'all' ? filter : booking.expertise[0]}
            onClose={() => setBooking(null)}
          />
        )}
      </AnimatePresence>

      <UpgradeModal product="mentormatrix" open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}

function Stat({ delay, value, label, color }: { delay: number; value: string; label: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-4 text-center">
      <div className={`text-3xl font-bold mb-1 ${color}`}>{value}</div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </motion.div>
  )
}

function BookingModal({
  mentor,
  entitled,
  userId,
  userName,
  defaultFocus,
  onClose,
}: {
  mentor: Mentor
  entitled: boolean
  userId: string
  userName: string
  defaultFocus: string
  onClose: () => void
}) {
  const [focusArea, setFocusArea] = useState(defaultFocus)
  const [preferredTime, setPreferredTime] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async () => {
    if (!focusArea.trim()) {
      toast.error('Please add a focus area for the session.')
      return
    }
    setSubmitting(true)
    try {
      await requestSession({
        userId,
        userName,
        mentorId: mentor.id,
        mentorName: mentor.name,
        focusArea,
        preferredTime,
        note,
        priority: entitled,
      })
      toast.success(`Session requested with ${mentor.name}. You’ll be notified when confirmed.`)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not book session.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/85 dark:bg-gray-900/85 backdrop-blur-2xl shadow-2xl p-7"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-2xl">{mentor.avatar}</div>
            <div>
              <h3 className="font-display font-bold text-gray-900 dark:text-white">{mentor.name}</h3>
              <p className="text-xs text-gray-500">{mentor.title} · {mentor.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-500/10"><FaTimes /></button>
        </div>

        <div className="space-y-4">
          <Field label="Focus area">
            <input value={focusArea} onChange={(e) => setFocusArea(e.target.value)} placeholder="e.g. System design interview prep"
              className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </Field>
          <Field label="Preferred time">
            <input value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} placeholder="e.g. Weekday evenings, IST"
              className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </Field>
          <Field label="Note to mentor (optional)">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What would you like help with?"
              className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </Field>
        </div>

        {entitled && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-500">
            <FaCrown /> Priority request — Plus members are matched first.
          </p>
        )}

        <button onClick={submit} disabled={submitting} className="btn-primary w-full mt-5 disabled:opacity-60">
          {submitting ? 'Requesting…' : 'Request session'}
        </button>
      </motion.div>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
    </div>
  )
}
