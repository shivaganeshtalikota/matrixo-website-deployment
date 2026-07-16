'use client'

// ============================================================
// Public credential verification page — no auth required.
// Anyone with the link can confirm a PlayCred credential is genuine
// and untampered. Reads the credential (public read per rules) and
// recomputes its integrity hash client-side.
// ============================================================

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaAward,
  FaShieldAlt,
  FaCertificate,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from 'react-icons/fa'
import Link from 'next/link'
import { PlayCredCredential } from '@/lib/playcred/types'
import { getCredentialById, verifyIntegrity } from '@/lib/playcred/service'

const ICONS = { trophy: FaTrophy, award: FaAward, star: FaStar, medal: FaMedal, certificate: FaCertificate, shield: FaShieldAlt }

type State =
  | { kind: 'loading' }
  | { kind: 'not_found' }
  | { kind: 'tampered'; cred: PlayCredCredential }
  | { kind: 'valid'; cred: PlayCredCredential }

export default function VerifyCredentialPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string)
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    let active = true
    getCredentialById(id).then((cred) => {
      if (!active) return
      if (!cred) return setState({ kind: 'not_found' })
      setState(verifyIntegrity(cred) ? { kind: 'valid', cred } : { kind: 'tampered', cred })
    })
    return () => {
      active = false
    }
  }, [id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <Link href="/" className="font-display text-2xl font-bold gradient-text">matriXO</Link>
          <p className="text-sm text-gray-400 mt-1">Credential Verification</p>
        </div>

        {state.kind === 'loading' && (
          <div className="glass-card p-12 text-center">
            <FaSpinner className="mx-auto text-3xl text-blue-400 animate-spin mb-3" />
            <p className="text-gray-300">Verifying credential…</p>
          </div>
        )}

        {state.kind === 'not_found' && (
          <div className="glass-card p-10 text-center">
            <FaTimesCircle className="mx-auto text-4xl text-red-400 mb-3" />
            <h1 className="font-display text-2xl font-bold text-white mb-2">Credential not found</h1>
            <p className="text-gray-400">
              This verification link doesn’t match any credential issued by matriXO. It may be mistyped or revoked.
            </p>
          </div>
        )}

        {state.kind === 'tampered' && (
          <div className="glass-card p-10 text-center border border-red-500/30">
            <FaTimesCircle className="mx-auto text-4xl text-red-400 mb-3" />
            <h1 className="font-display text-2xl font-bold text-white mb-2">Integrity check failed</h1>
            <p className="text-gray-400">
              This record’s contents don’t match its integrity hash and cannot be trusted as genuine.
            </p>
          </div>
        )}

        {state.kind === 'valid' && (() => {
          const c = state.cred
          const Icon = ICONS[c.iconKey]
          return (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-green-500/20 px-6 py-4 flex items-center justify-center gap-2">
                <FaCheckCircle className="text-green-400" />
                <span className="font-semibold text-green-300">Verified &amp; authentic</span>
              </div>

              <div className="p-8 text-center">
                <div className={`mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${c.colorFrom} ${c.colorTo} text-white text-5xl shadow-xl`}>
                  <Icon />
                </div>
                <h1 className="font-display text-2xl font-bold text-white mb-1">{c.title}</h1>
                <p className="text-gray-400 mb-5">{c.description}</p>

                <div className="space-y-3 text-left">
                  <Row label="Issued to" value={c.ownerName} />
                  <Row label="Category" value={c.category} />
                  <Row label="Rarity" value={c.rarity} capitalize />
                  <Row label="Issued on" value={new Date(c.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Integrity hash (SHA-256)</p>
                    <p className="text-xs text-gray-300 font-mono break-all bg-white/5 rounded-lg p-3">{c.integrityHash}</p>
                  </div>
                </div>

                <p className="mt-6 text-xs text-gray-500">
                  Issued by matriXO · This page recomputed the credential’s hash to confirm it was not altered after issuance.
                </p>
              </div>
            </motion.div>
          )
        })()}

        <div className="mt-6 text-center">
          <Link href="/playcred" className="text-sm text-blue-400 hover:text-blue-300">Learn about PlayCred credentials →</Link>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-white ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  )
}
