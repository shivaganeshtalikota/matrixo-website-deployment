'use client'

// ============================================================
// Unified user dashboard — aggregates the learner's whole matriXO
// footprint: event tickets (QR), SkillDNA, GrowGrid, PlayCred wallet,
// MentorMatrix sessions, and payment history.
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  FaDna,
  FaRocket,
  FaTrophy,
  FaUserTie,
  FaTicketAlt,
  FaReceipt,
  FaArrowRight,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
} from 'react-icons/fa'
import { useAuth } from '@/lib/AuthContext'
import { useProfile } from '@/lib/ProfileContext'
import { getSkillDNAUser } from '@/lib/skilldna/firestore-service'
import { getOrCreateProgress } from '@/lib/growgrid/firestore-service'
import { levelFromXP } from '@/lib/growgrid/types'
import { totalModuleCount } from '@/lib/growgrid/content'
import { subscribeToCredentials } from '@/lib/playcred/service'
import { subscribeToSessions, isActiveSession } from '@/lib/mentormatrix/service'
import { getUserSubscriptions } from '@/lib/entitlements/service'
import { getUserTickets, EventTicket } from '@/lib/tickets/service'
import { PlayCredCredential } from '@/lib/playcred/types'
import { MentorSession } from '@/lib/mentormatrix/types'
import { Subscription } from '@/lib/entitlements/types'

interface DashState {
  skillScore: number | null
  hiringReadiness: number | null
  skillOnboarded: boolean
  ggLevel: number
  ggXP: number
  ggCompleted: number
}

const subStatusStyle: Record<string, { icon: JSX.Element; cls: string }> = {
  active: { icon: <FaCheckCircle />, cls: 'text-green-600 bg-green-500/10' },
  pending: { icon: <FaHourglassHalf />, cls: 'text-amber-600 bg-amber-500/10' },
  rejected: { icon: <FaTimesCircle />, cls: 'text-red-600 bg-red-500/10' },
  expired: { icon: <FaTimesCircle />, cls: 'text-gray-500 bg-gray-500/10' },
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { profile } = useProfile()

  const [loading, setLoading] = useState(true)
  const [state, setState] = useState<DashState>({
    skillScore: null,
    hiringReadiness: null,
    skillOnboarded: false,
    ggLevel: 1,
    ggXP: 0,
    ggCompleted: 0,
  })
  const [creds, setCreds] = useState<PlayCredCredential[]>([])
  const [sessions, setSessions] = useState<MentorSession[]>([])
  const [payments, setPayments] = useState<Subscription[]>([])
  const [tickets, setTickets] = useState<EventTicket[]>([])

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading) setLoading(false)
      return
    }
    let active = true
    const unsubCreds = subscribeToCredentials(user.uid, (c) => active && setCreds(c))
    const unsubSessions = subscribeToSessions(user.uid, (s) => active && setSessions(s))

    Promise.all([
      getSkillDNAUser(user.uid),
      getOrCreateProgress(user.uid),
      getUserSubscriptions(user.uid),
      getUserTickets(user.uid),
    ])
      .then(([skill, gg, subs, tks]) => {
        if (!active) return
        const completed = Object.values(gg.moduleProgress).filter((m) => m.status === 'completed').length
        setState({
          skillScore: skill?.skillDNA?.dynamicSkillScore ?? null,
          hiringReadiness: skill?.skillDNA?.hiringReadiness ?? null,
          skillOnboarded: skill?.profile?.onboardingComplete ?? false,
          ggLevel: levelFromXP(gg.totalXP),
          ggXP: gg.totalXP,
          ggCompleted: completed,
        })
        setPayments(subs)
        setTickets(tks)
      })
      .catch(() => {})
      .finally(() => active && setLoading(false))

    return () => {
      active = false
      unsubCreds()
      unsubSessions()
    }
  }, [user, authLoading])

  const activeSessions = useMemo(() => sessions.filter(isActiveSession).length, [sessions])
  const displayName = profile?.fullName || user?.displayName || 'there'
  const firstName = displayName.split(' ')[0]

  // ---- Not signed in ----
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-blue-950/20">
        <div className="glass-card max-w-md w-full p-10 text-center">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Your dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Sign in to see your tickets, progress, credentials, and more.</p>
          <Link href="/auth" className="btn-primary inline-block">Sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-blue-950/20 py-24">
      <div className="container-custom px-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-10">
          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {profile?.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.profilePhoto} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              firstName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
              Welcome back, {firstName}
            </h1>
            {profile?.username && (
              <Link href={`/u/${profile.username}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View public profile →
              </Link>
            )}
          </div>
        </motion.div>

        {/* Product cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* SkillDNA */}
          <ProductCard
            href="/skilldna"
            icon={<FaDna />}
            gradient="from-cyan-500 to-blue-600"
            title="SkillDNA"
            loading={loading}
          >
            {state.skillOnboarded && state.skillScore != null ? (
              <div className="flex items-center gap-6">
                <Ring value={state.hiringReadiness ?? 0} label="Ready" />
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{state.skillScore}</p>
                  <p className="text-sm text-gray-500">Dynamic skill score / 1000</p>
                </div>
              </div>
            ) : (
              <CardEmpty text="Take your AI skill assessment to unlock your genome." cta="Start assessment" />
            )}
          </ProductCard>

          {/* GrowGrid */}
          <ProductCard
            href="/growgrid"
            icon={<FaRocket />}
            gradient="from-indigo-500 to-purple-600"
            title="GrowGrid"
            loading={loading}
          >
            <div className="flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">Lv {state.ggLevel}</p>
                <p className="text-sm text-gray-500">{state.ggXP} XP</p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-semibold text-gray-900 dark:text-white">{state.ggCompleted}/{totalModuleCount()}</p>
                <p>modules completed</p>
              </div>
            </div>
          </ProductCard>

          {/* PlayCred */}
          <ProductCard
            href="/playcred"
            icon={<FaTrophy />}
            gradient="from-yellow-500 to-orange-500"
            title="PlayCred"
            loading={loading}
          >
            {creds.length > 0 ? (
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{creds.length}</p>
                <p className="text-sm text-gray-500">verified credential{creds.length > 1 ? 's' : ''} earned</p>
              </div>
            ) : (
              <CardEmpty text="Complete a GrowGrid path to earn your first credential." cta="Learn how" />
            )}
          </ProductCard>

          {/* MentorMatrix */}
          <ProductCard
            href="/mentormatrix"
            icon={<FaUserTie />}
            gradient="from-blue-500 to-indigo-600"
            title="MentorMatrix"
            loading={loading}
          >
            {sessions.length > 0 ? (
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeSessions}</p>
                <p className="text-sm text-gray-500">active session{activeSessions === 1 ? '' : 's'} · {sessions.length} total</p>
              </div>
            ) : (
              <CardEmpty text="Get AI-matched with a mentor and book a session." cta="Find a mentor" />
            )}
          </ProductCard>
        </div>

        {/* Tickets */}
        <Section title="Event Tickets" icon={<FaTicketAlt />}>
          {tickets.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <FaTicketAlt className="mx-auto text-3xl text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">You don’t have any tickets yet.</p>
              <Link href="/events" className="btn-primary inline-block">Browse events</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((t) => (
                <div key={t.id} className="glass-card p-5 flex gap-4 items-center">
                  <div className="rounded-xl bg-white p-2 shrink-0">
                    <QRCodeSVG value={t.transactionCode} size={72} includeMargin={false} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{t.eventTitle}</p>
                    <p className="text-xs text-gray-500">{t.ticketType} · ₹{t.price}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${subStatusStyle[t.status === 'confirmed' ? 'active' : t.status === 'cancelled' ? 'rejected' : 'pending'].cls}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Payment history */}
        <Section title="Payment History" icon={<FaReceipt />}>
          {payments.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-600 dark:text-gray-400">
              No payments yet. Premium upgrades and purchases will appear here.
            </div>
          ) : (
            <div className="glass-card divide-y divide-gray-200/60 dark:divide-white/5 overflow-hidden">
              {payments.map((p) => {
                const s = subStatusStyle[p.status] || subStatusStyle.pending
                return (
                  <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{p.planLabel}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · ₹{p.amount}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${s.cls}`}>
                      {s.icon} {p.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

function ProductCard({
  href,
  icon,
  gradient,
  title,
  loading,
  children,
}: {
  href: string
  icon: JSX.Element
  gradient: string
  title: string
  loading: boolean
  children: React.ReactNode
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg`}>
            {icon}
          </div>
          <h3 className="font-display font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <Link href={href} className="text-gray-400 hover:text-blue-500 transition-colors" aria-label={`Open ${title}`}>
          <FaArrowRight />
        </Link>
      </div>
      {loading ? <div className="h-12 rounded-lg bg-black/5 dark:bg-white/5 animate-pulse" /> : children}
    </motion.div>
  )
}

function CardEmpty({ text, cta }: { text: string; cta: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{text}</p>
      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{cta} →</span>
    </div>
  )
}

function Ring({ value, label }: { value: number; label: string }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.max(0, Math.min(100, value)) / 100) * circ
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" className="stroke-gray-200 dark:stroke-gray-700" />
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} className="stroke-blue-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-gray-900 dark:text-white">{value}%</span>
        <span className="text-[10px] text-gray-500">{label}</span>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: JSX.Element; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="flex items-center gap-2 font-display text-lg font-bold text-gray-900 dark:text-white mb-4">
        <span className="text-blue-500">{icon}</span> {title}
      </h2>
      {children}
    </div>
  )
}
