'use client'

// ============================================================
// Shared page shell for every beta product (GrowGrid, PlayCred,
// MentorMatrix, …). Unifies the things that must be identical across
// products — page background, container width, responsive padding,
// header layout, and typography scale — while each product keeps its
// own ACCENT gradient (passed via `accent`). This is what makes the
// pages feel like one product without erasing per-feature identity.
//
// Mobile-first: padding, badge, and title scale down cleanly on small
// screens; the max width and gutters match the /dashboard shell.
// ============================================================

import { motion } from 'framer-motion'
import { FaCrown } from 'react-icons/fa'
import HeadingHighlight from '@/components/HeadingHighlight'

interface BetaShellProps {
  /** Tailwind gradient tokens for this product's accent, e.g. "from-indigo-500 to-purple-500". */
  accent: string
  badgeIcon: React.ReactNode
  badgeLabel: string
  title: string
  subtitle: string
  premium?: boolean
  premiumLabel?: string
  children: React.ReactNode
}

export function BetaShell({
  accent,
  badgeIcon,
  badgeLabel,
  title,
  subtitle,
  premium = false,
  premiumLabel = 'Premium',
  children,
}: BetaShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/10 dark:to-blue-950/20 py-20 sm:py-24">
      <div className="container-custom px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-12"
        >
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${accent} text-white px-5 sm:px-6 py-2 rounded-full mb-4 text-sm sm:text-base`}>
            {badgeIcon}
            <span className="font-bold">{badgeLabel}</span>
            {premium && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                <FaCrown className="text-amber-200" /> {premiumLabel}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4">
            <HeadingHighlight text={title} />
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-2">
            {subtitle}
          </p>
        </motion.div>

        {children}
      </div>
    </div>
  )
}

/** Unified stat tile used across beta product headers. */
export function BetaStatCard({
  delay = 0,
  icon,
  value,
  label,
  accentText,
  children,
}: {
  delay?: number
  icon?: React.ReactNode
  value: string
  label: string
  accentText?: string
  children?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className={`text-2xl sm:text-3xl font-bold ${accentText || 'text-gray-900 dark:text-white'}`}>{value}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      {children}
    </motion.div>
  )
}

/** Unified section heading used across beta product bodies. */
export function BetaSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
      {children}
    </h2>
  )
}
