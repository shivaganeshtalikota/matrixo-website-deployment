'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaHome, FaRedo, FaExclamationTriangle } from 'react-icons/fa'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface the error to the console/monitoring; users see a friendly card.
    console.error('[app error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950/40 dark:to-purple-950/40">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="glass-card max-w-md w-full p-10 text-center"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl">
          <FaExclamationTriangle />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          A hiccup on our end — not you. You can retry, or head back home while we sort it out.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => reset()} className="btn-primary inline-flex items-center justify-center gap-2">
            <FaRedo /> Try again
          </button>
          <Link href="/" className="btn-secondary inline-flex items-center justify-center gap-2">
            <FaHome /> Go home
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-6 text-xs text-gray-400 font-mono">Reference: {error.digest}</p>
        )}
      </motion.div>
    </div>
  )
}
