'use client'

import { motion } from 'framer-motion'
import type { IconType } from 'react-icons'
import HeadingHighlight from '@/components/HeadingHighlight'
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCpuChip,
  HiOutlineShieldCheck,
  HiOutlineSquares2X2,
} from 'react-icons/hi2'

type FeatureStat = {
  icon: IconType
  title: string
  subtitle: string
  iconClassName: string
  iconContainerClassName: string
}

const stats: FeatureStat[] = [
  {
    icon: HiOutlineCpuChip,
    title: 'AI-Powered',
    subtitle: 'Skill Analysis',
    iconClassName: 'text-[#5B5BF6] dark:text-slate-200',
    iconContainerClassName: '',
  },
  {
    icon: HiOutlineSquares2X2,
    title: '5 Products',
    subtitle: 'One Platform',
    iconClassName: 'text-[#2563EB] dark:text-slate-200',
    iconContainerClassName: '',
  },
  {
    icon: HiOutlineAdjustmentsHorizontal,
    title: 'Personalized',
    subtitle: 'Learning Paths',
    iconClassName: 'text-[#059669] dark:text-slate-200',
    iconContainerClassName: '',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Verifiable',
    subtitle: 'Credentials',
    iconClassName: 'text-[#D97706] dark:text-slate-200',
    iconContainerClassName: '',
  },
]

function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  iconClassName,
  iconContainerClassName,
  index,
}: FeatureStat & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="feature-card group relative flex h-full flex-col items-center overflow-hidden px-6 py-8 text-center sm:px-8 sm:py-10"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-16 bg-gradient-to-b from-white/5 to-transparent dark:block" />

      <div className={`feature-card-icon mb-6 ${iconContainerClassName}`}>
        <Icon className={`h-7 w-7 ${iconClassName}`} />
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white sm:text-3xl">
        <HeadingHighlight text={title} />
      </h3>
      <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 sm:text-base">
        {subtitle}
      </p>
    </motion.div>
  )
}

export default function Stats() {
  return (
    <section className="section-padding bg-transparent">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat, index) => (
            <FeatureCard
              key={stat.title}
              index={index}
              {...stat}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
