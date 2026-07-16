'use client'

// ============================================================
// Subscription verification panel (employee portal, admin tab).
// Closes the manual-UPI revenue loop: staff review pending payment
// claims and approve (grant entitlement) or reject them. Approvals
// live-unlock the product for the user via their entitlement listener.
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheck, FaTimes, FaHourglassHalf, FaReceipt, FaCopy } from 'react-icons/fa'
import { toast } from 'sonner'
import { useEmployeeAuth } from '@/lib/employeePortalContext'
import { Card, Button, Badge } from '@/components/employee-portal/ui'
import {
  subscribeByStatus,
  approveSubscription,
  rejectSubscription,
} from '@/lib/entitlements/service'
import { Subscription, SubscriptionStatus } from '@/lib/entitlements/types'

type FilterTab = 'pending' | 'active' | 'rejected'

const STATUS_BADGE: Record<SubscriptionStatus, { variant: 'warning' | 'success' | 'error' | 'default'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  active: { variant: 'success', label: 'Active' },
  rejected: { variant: 'error', label: 'Rejected' },
  expired: { variant: 'default', label: 'Expired' },
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SubscriptionAdmin() {
  const { employee } = useEmployeeAuth()
  const [tab, setTab] = useState<FilterTab>('pending')
  const [subs, setSubs] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeByStatus(tab as SubscriptionStatus, (list) => {
      setSubs(list)
      setLoading(false)
    })
    return unsub
  }, [tab])

  const pendingHint = useMemo(
    () => (tab === 'pending' && subs.length > 0 ? ` (${subs.length})` : ''),
    [tab, subs.length]
  )

  const handleApprove = async (sub: Subscription) => {
    if (!sub.id) return
    if (!employee?.employeeId) {
      toast.error('Employee identity not loaded.')
      return
    }
    setBusyId(sub.id)
    try {
      await approveSubscription(sub.id, employee.employeeId)
      toast.success(`Approved — ${sub.planLabel} unlocked for the user.`)
    } catch {
      toast.error('Could not approve. Check your permissions.')
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (sub: Subscription) => {
    if (!sub.id) return
    if (!employee?.employeeId) {
      toast.error('Employee identity not loaded.')
      return
    }
    setBusyId(sub.id)
    try {
      await rejectSubscription(sub.id, employee.employeeId, 'Rejected during verification')
      toast.success('Marked as rejected.')
    } catch {
      toast.error('Could not reject.')
    } finally {
      setBusyId(null)
    }
  }

  const copyRef = (ref: string) => {
    navigator.clipboard.writeText(ref)
    toast.success('UPI reference copied')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaReceipt className="text-primary-400" /> Premium Payments
        </h2>
        <p className="text-neutral-400 text-sm mt-1">
          Verify manual UPI payments to grant premium product access.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['pending', 'active', 'rejected'] as FilterTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              tab === t
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-white/5 text-neutral-300 hover:bg-white/10'
            }`}
          >
            {t}
            {t === 'pending' && pendingHint}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-neutral-400">
          <FaHourglassHalf className="animate-pulse mr-2" /> Loading payments…
        </div>
      ) : subs.length === 0 ? (
        <Card className="text-center py-16">
          <FaReceipt className="mx-auto text-4xl text-neutral-600 mb-3" />
          <p className="text-neutral-400">No {tab} payments.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {subs.map((sub) => {
              const badge = STATUS_BADGE[sub.status]
              return (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                >
                  <Card>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{sub.planLabel}</span>
                          <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                          <div>
                            <span className="text-neutral-500">Amount</span>
                            <p className="text-white font-medium">₹{sub.amount}</p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-neutral-500">UPI Ref</span>
                            <button
                              onClick={() => copyRef(sub.upiRef)}
                              className="flex items-center gap-1.5 text-white font-mono hover:text-primary-400 transition-colors"
                            >
                              <span className="truncate">{sub.upiRef}</span>
                              <FaCopy className="text-neutral-500 shrink-0 text-xs" />
                            </button>
                          </div>
                          <div>
                            <span className="text-neutral-500">Submitted</span>
                            <p className="text-white">{formatDate(sub.createdAt)}</p>
                          </div>
                          <div className="col-span-2 sm:col-span-1 min-w-0">
                            <span className="text-neutral-500">User</span>
                            <p className="text-white font-mono text-xs truncate" title={sub.userId}>{sub.userId}</p>
                          </div>
                        </div>
                        {sub.verifiedBy && (
                          <p className="mt-2 text-xs text-neutral-500">
                            Handled by {sub.verifiedBy}
                            {sub.activatedAt ? ` · ${formatDate(sub.activatedAt)}` : ''}
                          </p>
                        )}
                      </div>

                      {sub.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="success"
                            size="sm"
                            icon={<FaCheck />}
                            loading={busyId === sub.id}
                            onClick={() => handleApprove(sub)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<FaTimes />}
                            disabled={busyId === sub.id}
                            onClick={() => handleReject(sub)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
