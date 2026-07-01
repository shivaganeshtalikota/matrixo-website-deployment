'use client'

import { memo, useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import HeadingHighlight from '@/components/HeadingHighlight'
import {
  HiOutlineChartBarSquare,
  HiOutlineCubeTransparent,
  HiOutlinePuzzlePiece,
  HiOutlineSparkles,
  HiOutlineTrophy,
  HiOutlineUserCircle,
} from 'react-icons/hi2'

const features = [
  {
    id: 'skilldna',
    title: 'SkillDNA™',
    description: 'AI-powered skill assessment and genome visualization',
    content: {
      details:
        'Discover your unique skill genome through AI-powered assessment. Our advanced algorithms analyze your technical abilities, learning patterns, and growth trajectory to create a visual DNA map of your capabilities. Understand your strengths, identify gaps, and get personalized recommendations.',
      href: '/skilldna',
      gradient: 'from-purple-500 to-fuchsia-500',
      icon: HiOutlineSparkles,
      iconClassName: 'text-[#5B5BF6] dark:text-slate-200',
    },
  },
  {
    id: 'growgrid',
    title: 'GrowGrid™',
    description: 'Adaptive learning paths with gamification',
    content: {
      details:
        'Navigate your learning journey with adaptive pathways that evolve with you. Earn XP, unlock achievements, and level up your skills through gamified challenges designed by industry experts. Your personalized grid adapts in real-time based on your progress.',
      href: '/growgrid',
      gradient: 'from-blue-500 to-cyan-500',
      icon: HiOutlinePuzzlePiece,
      iconClassName: 'text-[#2563EB] dark:text-slate-200',
    },
  },
  {
    id: 'playcred',
    title: 'PlayCred™',
    description: 'Blockchain-verified achievement badges',
    content: {
      details:
        'Showcase your achievements with tamper-proof, blockchain-verified credentials. Every badge, certificate, and milestone is permanently recorded and instantly verifiable by employers and peers. Build a credential portfolio that speaks for itself.',
      href: '/playcred',
      gradient: 'from-emerald-500 to-teal-500',
      icon: HiOutlineTrophy,
      iconClassName: 'text-[#059669] dark:text-slate-200',
    },
  },
  {
    id: 'mentormatrix',
    title: 'MentorMatrix™',
    description: 'AI-matched mentorship connections',
    content: {
      details:
        'Get matched with the perfect mentor using our AI-powered compatibility algorithm. Whether you need guidance on career transitions, technical skills, or industry insights, MentorMatrix connects you with experienced professionals who align with your goals.',
      href: '/mentormatrix',
      gradient: 'from-indigo-500 to-violet-500',
      icon: HiOutlineCubeTransparent,
      iconClassName: 'text-[#4F46E5] dark:text-slate-200',
    },
  },
  {
    id: 'impactvault',
    title: 'ImpactVault™',
    description: 'Real-time analytics and skill gap insights',
    content: {
      details:
        'Track your growth with real-time analytics and comprehensive skill gap insights. Visualize your learning progress, benchmark against industry standards, and get actionable recommendations to accelerate your career development.',
      href: '/impactvault',
      gradient: 'from-amber-500 to-orange-500',
      icon: HiOutlineChartBarSquare,
      iconClassName: 'text-[#D97706] dark:text-slate-200',
    },
  },
  {
    id: 'profile',
    title: 'Profile & Username',
    description: 'Public profiles with usernames, privacy controls & sharing',
    content: {
      details:
        'Create your professional identity with customizable public profiles. Set your unique username, control your privacy settings, and share your achievements across platforms. Your matriXO profile becomes your digital career card.',
      href: '/profile',
      gradient: 'from-pink-500 to-rose-500',
      icon: HiOutlineUserCircle,
      iconClassName: 'text-[#475569] dark:text-slate-200',
    },
  },
] as const

type Feature = (typeof features)[number]

type FeatureButtonProps = {
  feature: Feature
  index: number
  isActive: boolean
  onSelect: (index: number) => void
}

const FeatureNavButton = memo(function FeatureNavButton({
  feature,
  index,
  isActive,
  onSelect,
}: FeatureButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-pressed={isActive}
      className={`w-full text-left px-4 py-3 rounded-xl border-l-4 transition-all duration-300 ease-in-out hover:scale-[1.02] ${
        isActive
          ? 'bg-white/70 dark:bg-white/[0.08] border-blue-500 opacity-100'
          : 'border-transparent opacity-70 hover:opacity-100 hover:bg-white/40 dark:hover:bg-white/[0.04]'
      }`}
    >
      <div className={`font-bold ${isActive ? '' : 'text-gray-500 dark:text-gray-400'}`}>
        {isActive ? (
          <HeadingHighlight text={feature.title} solidClassName="text-gray-900 dark:text-white" />
        ) : (
          feature.title
        )}
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
    </button>
  )
})

const FeaturePillButton = memo(function FeaturePillButton({
  feature,
  index,
  isActive,
  onSelect,
}: FeatureButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-pressed={isActive}
      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out hover:scale-[1.02] ${
        isActive
          ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600'
          : 'text-gray-700 dark:text-gray-300 bg-gray-200/70 dark:bg-white/[0.08]'
      }`}
    >
      {feature.title}
    </button>
  )
})

export default function BetaFeaturesShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isBeta, setIsBeta] = useState(true)

  useEffect(() => {
    setMounted(true)
    setIsBeta(true)
  }, [])

  if (!mounted || !isBeta) return null

  const activeFeature = features[activeIndex] || features[0]
  const ActiveIcon = activeFeature.content.icon

  return (
    <section id="explore-features" className="section-padding bg-transparent carousel-section">
      <div className="container-custom">
        <motion.div
          id="feature-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            <HeadingHighlight text="Explore New Features" highlightWords={2} />
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore our latest features and discover powerful tools designed to enhance your experience.
          </p>
        </motion.div>

        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
          <aside className="lg:col-span-4">
            <div className="space-y-2">
              {features.map((item, index) => (
                <FeatureNavButton
                  key={item.id}
                  feature={item}
                  index={index}
                  isActive={activeIndex === index}
                  onSelect={setActiveIndex}
                />
              ))}
            </div>
          </aside>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="glass-card min-h-[560px] p-8 md:p-10"
              >
                <div className="feature-card-icon mb-6">
                  <ActiveIcon className={`h-7 w-7 ${activeFeature.content.iconClassName}`} />
                </div>
                <h3 className="mb-4 text-3xl font-display font-bold lg:text-4xl">
                  <HeadingHighlight text={activeFeature.title} />
                </h3>
                <p className="mb-4 text-xl font-medium text-gray-700 dark:text-gray-300">
                  {activeFeature.description}
                </p>
                <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                  {activeFeature.content.details}
                </p>
                <Link href={activeFeature.content.href} className="btn-primary inline-flex items-center">
                  Try it now →
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="sticky top-20 z-20 -mx-4 mb-6 border-y border-gray-200/70 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-white/[0.08] dark:bg-gray-950/80">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {features.map((item, index) => (
                <FeaturePillButton
                  key={item.id}
                  feature={item}
                  index={index}
                  isActive={activeIndex === index}
                  onSelect={setActiveIndex}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="glass-card min-h-[520px] p-8 md:p-10"
            >
              <div className="feature-card-icon mb-6">
                <ActiveIcon className={`h-7 w-7 ${activeFeature.content.iconClassName}`} />
              </div>
              <h3 className="mb-4 text-3xl font-display font-bold lg:text-4xl">
                <HeadingHighlight text={activeFeature.title} />
              </h3>
              <p className="mb-4 text-xl font-medium text-gray-700 dark:text-gray-300">
                {activeFeature.description}
              </p>
              <p className="mb-8 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                {activeFeature.content.details}
              </p>
              <Link href={activeFeature.content.href} className="btn-primary inline-flex items-center">
                Try it now →
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
