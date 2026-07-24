'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaAward,
  FaShieldAlt,
  FaDownload,
  FaShareAlt,
  FaLink,
  FaCheckCircle,
  FaCertificate,
  FaCrown,
  FaLock,
} from 'react-icons/fa'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuth } from '@/lib/AuthContext'
import { PlayCredCredential, CredentialRarity } from '@/lib/playcred/types'
import { subscribeToCredentials } from '@/lib/playcred/service'
import { subscribeToEntitlement } from '@/lib/entitlements/service'
import UpgradeModal from '@/components/premium/UpgradeModal'
import { BetaShell } from '@/components/beta/BetaShell'

const ICONS = { trophy: FaTrophy, award: FaAward, star: FaStar, medal: FaMedal, certificate: FaCertificate, shield: FaShieldAlt }

const rarityRing: Record<CredentialRarity, string> = {
  common: 'border-gray-400 bg-gray-100/60 dark:bg-gray-800/40',
  rare: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
  epic: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
  legendary: 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
}
const rarityChip: Record<CredentialRarity, string> = {
  common: 'bg-gray-500 text-white',
  rare: 'bg-blue-500 text-white',
  epic: 'bg-purple-500 text-white',
  legendary: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
}

export default function PlayCred() {
  const { user, loading: authLoading } = useAuth()
  const [creds, setCreds] = useState<PlayCredCredential[]>([])
  const [entitled, setEntitled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<PlayCredCredential | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    const unsubCreds = subscribeToCredentials(user.uid, (list) => {
      setCreds(list)
      setLoading(false)
    })
    const unsubEnt = subscribeToEntitlement(user.uid, 'playcred', ({ entitled }) => setEntitled(entitled))
    return () => {
      unsubCreds()
      unsubEnt()
    }
  }, [user, authLoading])

  const stats = useMemo(() => {
    const legendary = creds.filter((c) => c.rarity === 'legendary').length
    const categories = new Set(creds.map((c) => c.category)).size
    return { total: creds.length, legendary, verified: creds.length, categories }
  }, [creds])

  const verifyUrl = (c: PlayCredCredential) =>
    typeof window !== 'undefined' ? `${window.location.origin}/playcred/verify/${c.id}` : `/playcred/verify/${c.id}`

  const copyVerifyLink = (c: PlayCredCredential) => {
    navigator.clipboard.writeText(verifyUrl(c))
    toast.success('Verification link copied')
  }

  const handleShare = async (c: PlayCredCredential) => {
    const url = verifyUrl(c)
    if (navigator.share) {
      try {
        await navigator.share({ title: `${c.title} — matriXO PlayCred`, url })
      } catch {
        /* user cancelled */
      }
    } else {
      copyVerifyLink(c)
    }
  }

  const handleDownload = (c: PlayCredCredential) => {
    if (!entitled) {
      setShowUpgrade(true)
      return
    }
    toast.success('Certificate download will begin shortly.')
    // Premium certificate export is generated from the verification page.
    window.open(verifyUrl(c) + '?print=1', '_blank')
  }

  // ---- Not signed in ----
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="glass-card max-w-md w-full p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-3xl">
            <FaTrophy />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">Your credential wallet</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign in to view and share the verified credentials you earn across matriXO.
          </p>
          <Link href="/auth" className="btn-primary inline-block">Sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <BetaShell
      accent="from-yellow-500 to-orange-500"
      badgeIcon={<FaTrophy className="animate-bounce" />}
      badgeLabel="PlayCred™ Verified Credentials"
      title="Your Verified Achievements"
      subtitle="Tamper-evident, matriXO-issued credentials you earn by completing real learning paths — shareable and publicly verifiable."
      premium={entitled}
      premiumLabel="Pro"
    >

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { v: stats.total, l: 'Credentials' },
            { v: stats.legendary, l: 'Legendary' },
            { v: stats.verified, l: 'Verified' },
            { v: stats.categories, l: 'Categories' },
          ].map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + 1) }} className="glass-card p-6 text-center">
              <div className="text-4xl font-bold gradient-text mb-2">{loading ? '—' : s.v}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{s.l}</p>
            </motion.div>
          ))}
        </div>

        {/* Premium banner */}
        {!entitled && !loading && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowUpgrade(true)}
            className="group mb-12 w-full overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 p-6 text-left transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl"><FaCrown /></div>
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Unlock PlayCred Pro</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Downloadable certificates, custom branding, and a public credential passport.</p>
                </div>
              </div>
              <span className="btn-primary shrink-0 hidden sm:inline-flex">Upgrade ₹299</span>
            </div>
          </motion.button>
        )}

        {/* Credentials grid / empty state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/40 dark:bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : creds.length === 0 ? (
          <div className="glass-card text-center py-16 px-6">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-4xl opacity-90">
              <FaCertificate />
            </div>
            <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">No credentials yet</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              Complete a full learning path in GrowGrid to earn your first verifiable credential. It’ll appear here automatically.
            </p>
            <Link href="/growgrid" className="btn-primary inline-block">Start a learning path</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {creds.map((c, index) => {
              const Icon = ICONS[c.iconKey]
              return (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => setSelected(c)}
                  className={`group text-left p-6 rounded-2xl border-2 ${rarityRing[c.rarity]} hover:shadow-2xl transition-all duration-300 hover:scale-[1.03]`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${rarityChip[c.rarity]}`}>{c.rarity}</span>
                    <FaCheckCircle className="text-green-500 text-xl" title="Verified" />
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${c.colorFrom} ${c.colorTo} flex items-center justify-center text-white text-4xl shadow-xl group-hover:scale-110 transition-transform`}>
                      <Icon />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">{c.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 line-clamp-2">{c.description}</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <FaCertificate />
                    <span>Issued {new Date(c.issuedAt).toLocaleDateString()}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Detail modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
              >
                {(() => {
                  const Icon = ICONS[selected.iconKey]
                  return (
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${selected.colorFrom} ${selected.colorTo} flex items-center justify-center text-white text-3xl`}><Icon /></div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{selected.title}</h2>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${rarityChip[selected.rarity]}`}>{selected.rarity}</span>
                        </div>
                      </div>
                      <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl">×</button>
                    </div>
                  )
                })()}

                <p className="text-gray-600 dark:text-gray-400 mb-6">{selected.description}</p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <FaCheckCircle className="text-green-500 text-2xl shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Verified & tamper-evident</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Issued by matriXO and confirmable on the public verification page.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white/40 dark:bg-white/[0.03] rounded-xl">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Integrity hash (SHA-256):</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">{selected.integrityHash}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Issued</p>
                      <p className="font-bold text-gray-900 dark:text-white">{new Date(selected.issuedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selected.category}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDownload(selected)}
                    className="flex-1 min-w-[140px] bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                  >
                    {entitled ? <FaDownload /> : <FaLock />} {entitled ? 'Download' : 'Download (Pro)'}
                  </button>
                  <button
                    onClick={() => handleShare(selected)}
                    className="flex-1 min-w-[140px] bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                  >
                    <FaShareAlt /> Share
                  </button>
                  <button
                    onClick={() => copyVerifyLink(selected)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                    title="Copy verification link"
                  >
                    <FaLink />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      <UpgradeModal product="playcred" open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </BetaShell>
  )
}
