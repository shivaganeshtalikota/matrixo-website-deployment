'use client'

import type { MouseEvent } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaRocket, FaUniversity } from 'react-icons/fa'
import HeadingHighlight from '@/components/HeadingHighlight'

export default function Hero() {
  const getEntryDirection = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left

    return x < rect.width / 2 ? 'left' : 'right'
  }

  const handleCtaMouseEnter = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.dataset.direction = getEntryDirection(event)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent">
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:28px_28px]" />

      {/* Very subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/[0.06] to-transparent" />

      {/* Content */}
      <div className="relative z-10 container-custom px-4 sm:px-6 py-20 sm:py-24 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-6 px-6 py-2 glass-chip"
          >
            <span className="text-slate-700 dark:text-gray-300 font-medium text-sm md:text-base">
              AI-Powered Career Growth Platform 🧬
            </span>
          </motion.div>
          <br />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative inline-block mb-6"
          >
            <img
              src="/logos/logo-light.png"
              alt="matriXO"
              className="h-14 md:h-32 lg:h-20 w-auto mx-auto block dark:hidden"
            />
            <img
              src="/logos/logo-dark.png"
              alt="matriXO"
              className="h-14 md:h-32 lg:h-20 w-auto mx-auto transform hidden dark:block"
            />
          </motion.div>

          {/* Headline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-3xl lg:text-4xl font-light text-slate-700 dark:text-gray-300 mb-4 max-w-4xl mx-auto"
          >
            <HeadingHighlight text="Where AI Meets Your Career Journey" />
          </motion.p>

          {/* Bold tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-2xl md:text-3xl font-display font-bold text-slate-800 dark:text-white mb-12"
          >
            <HeadingHighlight text="Map Your Skills. Grow Smarter. Prove Your Worth." />
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl text-slate-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            AI-driven skill analysis, personalized learning paths, blockchain-verified credentials,
            and AI-matched mentorship — everything you need to become industry-ready, in one platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link href="/events">
              <motion.button
                onMouseEnter={handleCtaMouseEnter}
                whileTap={{ scale: 0.98 }}
                className="hero-cta"
              >
                <FaRocket />
                <span>Explore Events</span>
              </motion.button>
            </Link>

            <Link href="/services">
              <motion.button
                onMouseEnter={handleCtaMouseEnter}
                whileTap={{ scale: 0.98 }}
                className="hero-cta"
              >
                <FaRocket />
                <span>Explore Services</span>
              </motion.button>
            </Link>

            <Link href="/contact">
              <motion.button
                onMouseEnter={handleCtaMouseEnter}
                whileTap={{ scale: 0.98 }}
                className="hero-cta"
              >
                <FaUniversity />
                <span>For Colleges</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-300/60 dark:border-white/[0.12] rounded-full flex justify-center backdrop-blur-sm"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
