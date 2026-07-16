'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaHome, FaRocket, FaCompass, FaBug } from 'react-icons/fa'
import HeadingHighlight from '@/components/HeadingHighlight'

interface FloatEl {
  left: number
  duration: number
  emoji: string
}

export default function NotFound() {
  // Randomized decorations are generated AFTER mount so server and client
  // markup match (Math.random() during render causes hydration mismatches).
  const [floats, setFloats] = useState<FloatEl[]>([])
  useEffect(() => {
    setFloats(
      Array.from({ length: 6 }, (_, i) => ({
        left: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        emoji: i % 3 === 0 ? '🚀' : i % 3 === 1 ? '💻' : '🎯',
      }))
    )
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center px-6 py-24">
      <div className="max-w-4xl mx-auto text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative mb-8"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />
          
          {/* 404 Text */}
          <h1 className="relative text-[150px] md:text-[250px] font-black leading-none">
            <HeadingHighlight text="404" />
          </h1>
        </motion.div>

        {/* Funny but Professional Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <HeadingHighlight text="Oops! Page Not Found" />
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Looks like you've ventured into the <span className="text-purple-600 dark:text-purple-400 font-semibold">void</span>
          </p>
          
          <div className="space-y-2 max-w-xl mx-auto">
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-500">
              🤔 This page is taking a coffee break... permanently.
            </p>
            <p className="text-base md:text-lg text-gray-500 dark:text-gray-500">
              💡 <strong>Pro tip:</strong> If you're lost in cyberspace, just head home.
            </p>
          </div>
        </motion.div>

        {/* Floating Elements Animation (client-only, post-mount) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floats.map((f, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl md:text-6xl"
              style={{ left: `${f.left}%` }}
              initial={{ y: '100vh', opacity: 0.1 }}
              animate={{ y: [null, '-20vh'], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: f.duration, repeat: Infinity, repeatType: 'reverse' }}
            >
              {f.emoji}
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10"
        >
          <Link href="/">
            <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3">
              <FaHome className="text-xl group-hover:rotate-12 transition-transform" />
              <span>Back to Home</span>
            </button>
          </Link>

          <Link href="/events">
            <button className="group px-8 py-4 glass-card text-gray-900 dark:text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3">
              <FaRocket className="text-xl text-purple-600 group-hover:translate-y-[-4px] transition-transform" />
              <span>Explore Events</span>
            </button>
          </Link>
        </motion.div>

        {/* Error Code Box */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 relative z-10"
        >
          <div className="inline-block glass-card-elevated px-6 py-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <FaBug className="text-red-500" />
              <code className="font-mono">
                ERROR_CODE: <span className="text-purple-600 dark:text-purple-400 font-bold">PAGE_NOT_FOUND</span>
              </code>
            </div>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-sm text-gray-500 dark:text-gray-500 relative z-10"
        >
          Need help? <Link href="/contact" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">Contact us</Link> or check out our <Link href="/events" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">upcoming events</Link>
        </motion.p>

        {/* Fun Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto relative z-10"
        >
          <div className="glass-card p-6 hover-lift">
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              <HeadingHighlight text="Go Home" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Start fresh from the homepage</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              <HeadingHighlight text="Find Events" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Discover amazing workshops</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="text-3xl mb-3">📧</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              <HeadingHighlight text="Get Support" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">We're here to help you</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
