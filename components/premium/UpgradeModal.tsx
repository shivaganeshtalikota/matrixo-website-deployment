'use client'

// ============================================================
// Shared premium upgrade paywall — manual UPI + verify flow.
// Reused by every beta product (GrowGrid, PlayCred, MentorMatrix,
// SkillDNA). Renders via a portal, closes on ESC / backdrop click,
// and live-reacts when an admin verifies the payment.
// ============================================================

import { useEffect, useMemo, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import {
  FaCrown,
  FaCheckCircle,
  FaCopy,
  FaTimes,
  FaHourglassHalf,
  FaShieldAlt,
} from 'react-icons/fa'
import { useAuth } from '@/lib/AuthContext'
import { ProductId, PRODUCT_PLANS, Subscription } from '@/lib/entitlements/types'
import { createPurchaseRequest, subscribeToEntitlement } from '@/lib/entitlements/service'

// Product-subscription UPI payee. Configurable per environment; falls
// back to the same account used by live event payments.
const UPI_ID = process.env.NEXT_PUBLIC_MATRIXO_UPI_ID || 'vutukurikishan.8@okaxis'
const UPI_PAYEE_NAME = 'matriXO'

interface UpgradeModalProps {
  product: ProductId
  open: boolean
  onClose: () => void
}

export default function UpgradeModal({ product, open, onClose }: UpgradeModalProps) {
  const { user } = useAuth()
  const plan = PRODUCT_PLANS[product]

  const [mounted, setMounted] = useState(false)
  const [upiRef, setUpiRef] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [latest, setLatest] = useState<Subscription | null>(null)
  const [entitled, setEntitled] = useState(false)

  useEffect(() => setMounted(true), [])

  // A stable per-open transaction note so the payment is traceable.
  const txnNote = useMemo(() => {
    if (!open || !user) return ''
    return `${product.toUpperCase()}-${user.uid.slice(0, 6)}-${Date.now().toString().slice(-6)}`
  }, [open, user, product])

  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_PAYEE_NAME,
      am: String(plan.amount),
      cu: 'INR',
      tn: `${plan.planLabel} ${txnNote}`,
    })
    return `upi://pay?${params.toString()}`
  }, [plan, txnNote])

  // Live subscription status so the UI flips to "unlocked" the instant
  // an admin verifies, without a refresh.
  useEffect(() => {
    if (!open || !user) return
    const unsub = subscribeToEntitlement(user.uid, product, ({ entitled, latest }) => {
      setEntitled(entitled)
      setLatest(latest)
    })
    return unsub
  }, [open, user, product])

  const handleClose = useCallback(() => {
    if (submitting) return
    onClose()
  }, [submitting, onClose])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, handleClose])

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID)
    toast.success('UPI ID copied')
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade.')
      return
    }
    if (upiRef.trim().length < 6) {
      toast.error('Enter the UPI reference / UTR from your payment app.')
      return
    }
    setSubmitting(true)
    try {
      await createPurchaseRequest({
        userId: user.uid,
        product,
        planLabel: plan.planLabel,
        amount: plan.amount,
        upiRef: upiRef.trim(),
      })
      toast.success('Payment submitted! We’ll verify and unlock within a few hours.')
      setUpiRef('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not submit payment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  const pendingClaim = latest?.status === 'pending'

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Upgrade to ${plan.planLabel}`}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl"
          >
            {/* Gradient top rail */}
            <div className="h-1.5 w-full rounded-t-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />

            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-500/10 hover:text-gray-800 dark:hover:text-white transition-colors"
              aria-label="Close"
            >
              <FaTimes />
            </button>

            <div className="p-7">
              {entitled ? (
                <div className="text-center py-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white text-3xl">
                    <FaCheckCircle />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                    You’re unlocked!
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Your {plan.planLabel} is active. Enjoy every premium module.
                  </p>
                  <button onClick={handleClose} className="btn-primary mt-6">
                    Start learning
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xl">
                      <FaCrown />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                        {plan.planLabel}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        One-time payment · unlock instantly on verification
                      </p>
                    </div>
                  </div>

                  {/* Perks */}
                  <ul className="mt-5 space-y-2">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <FaCheckCircle className="mt-0.5 shrink-0 text-green-500" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="my-5 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold gradient-text">₹{plan.amount}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">one-time</span>
                  </div>

                  {pendingClaim ? (
                    <div className="rounded-2xl border border-amber-300/50 bg-amber-50 dark:bg-amber-500/10 p-5 text-center">
                      <FaHourglassHalf className="mx-auto mb-2 text-2xl text-amber-500" />
                      <p className="font-semibold text-amber-800 dark:text-amber-300">
                        Payment received — verifying
                      </p>
                      <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-400/80">
                        We’re confirming your UPI reference{' '}
                        <span className="font-mono">{latest?.upiRef}</span>. This unlocks
                        automatically once verified.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* UPI payment block */}
                      <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-5">
                        <div className="flex flex-col items-center">
                          <div className="rounded-2xl bg-white p-3 shadow-sm">
                            <QRCodeSVG value={upiLink} size={148} includeMargin={false} />
                          </div>
                          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            Scan with any UPI app to pay ₹{plan.amount}
                          </p>

                          <button
                            onClick={copyUpi}
                            className="mt-3 flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-white/5 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                          >
                            <span className="font-mono">{UPI_ID}</span>
                            <FaCopy className="text-gray-400" />
                          </button>

                          <a
                            href={upiLink}
                            className="btn-secondary mt-3 w-full text-center sm:hidden"
                          >
                            Open UPI app
                          </a>
                        </div>
                      </div>

                      {/* UTR submission */}
                      <div className="mt-5">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          After paying, enter your UPI reference / UTR
                        </label>
                        <input
                          value={upiRef}
                          onChange={(e) => setUpiRef(e.target.value)}
                          placeholder="e.g. 4198XXXXXXX"
                          inputMode="numeric"
                          className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="btn-primary mt-3 w-full disabled:opacity-60"
                        >
                          {submitting ? 'Submitting…' : 'I’ve paid — submit for verification'}
                        </button>
                        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                          <FaShieldAlt /> Verified manually by the matriXO team, usually within a few hours.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
