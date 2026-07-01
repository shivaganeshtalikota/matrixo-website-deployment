'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaArrowRight, FaCalendar } from 'react-icons/fa'
import HeadingHighlight from '@/components/HeadingHighlight'

export default function CTA() {
  return (
    <section className="section-padding bg-white/30 dark:bg-white/[0.01] backdrop-blur-sm relative overflow-hidden">
      {/* Subtle glass panel background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/50 dark:bg-purple-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-gray-900 dark:text-white">
            <HeadingHighlight text="Ready to Build Your Tech Career?" highlightWords={3} />
          </h2>

          <p className="text-xl text-gray-700 dark:text-gray-300 mb-12">
            Join matriXO&apos;s workshops, hackathons, and bootcamps to gain
            industry-ready skills and kickstart your career.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/events">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex items-center justify-center space-x-2 text-lg"
              >
                <FaCalendar />
                <span>Browse Events</span>
                <FaArrowRight />
              </motion.button>
            </Link>

            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary flex items-center justify-center text-lg"
              >
                Partner with Us
              </motion.button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center gap-8 text-gray-400"
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 dark:text-white text-2xl">✓</span>
              <span>Hands-on Workshops</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 dark:text-white text-2xl">✓</span>
              <span>Expert Mentorship</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 dark:text-white text-2xl">✓</span>
              <span>Industry Certifications</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
