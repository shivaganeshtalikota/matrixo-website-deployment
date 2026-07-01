'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import HeadingHighlight from '@/components/HeadingHighlight'
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineCodeBracketSquare,
  HiOutlineRocketLaunch,
  HiOutlineTrophy,
  HiOutlineUserGroup,
} from 'react-icons/hi2'

const features = [
  {
    icon: HiOutlineCodeBracketSquare,
    title: 'Technical Workshops',
    description: 'Hands-on coding workshops on cutting-edge technologies taught by industry experts. Web development, AI/ML, cloud, and more.',
    href: '/services',
    iconClassName: 'text-[#5B5BF6] dark:text-slate-200',
  },
  {
    icon: HiOutlineTrophy,
    title: 'Hackathons',
    description: 'Competitive coding events where students build real projects and solve industry challenges with prizes and recognition.',
    href: '/events',
    iconClassName: 'text-[#D97706] dark:text-slate-200',
  },
  {
    icon: HiOutlineAcademicCap,
    title: 'Bootcamps',
    description: 'Intensive multi-week training programs covering full-stack development, data science, cybersecurity, and more.',
    href: '/services',
    iconClassName: 'text-[#4F46E5] dark:text-slate-200',
  },
  {
    icon: HiOutlineBriefcase,
    title: 'Career Programs',
    description: 'Placement preparation, resume building, mock interviews, and DSA training to help you land your dream job.',
    href: '/services',
    iconClassName: 'text-[#2563EB] dark:text-slate-200',
  },
  {
    icon: HiOutlineRocketLaunch,
    title: 'Campus Events',
    description: 'Large-scale technical events, seminars, and conferences hosted at educational institutions across India.',
    href: '/events',
    iconClassName: 'text-[#059669] dark:text-slate-200',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Corporate Collaboration',
    description: 'Partner with us to train students, host events, run internship drives, and build a talent pipeline for your organization.',
    href: '/contact',
    iconClassName: 'text-[#475569] dark:text-slate-200',
  },
]

export default function Features() {
  return (
    <section className="section-padding bg-transparent">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            <HeadingHighlight text="What We Offer" />
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comprehensive technical training programs designed to build
            industry-ready skills and launch successful tech careers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Link key={feature.title} href={feature.href} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="group h-full cursor-pointer"
              >
                <div
                  className="feature-card relative flex h-full flex-col overflow-hidden p-8"
                >
                  <div className="relative flex h-full flex-col">
                    <div className="feature-card-icon mb-6">
                      <feature.icon
                        className={`h-7 w-7 ${feature.iconClassName}`}
                      />
                    </div>

                    <h3 className="relative mb-3 text-xl font-bold text-slate-800 dark:text-white">
                      <HeadingHighlight text={feature.title} />
                    </h3>
                    <p className="relative text-[15px] leading-7 text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>

                    <div className="relative mt-6 flex items-center text-sm font-semibold text-slate-700 dark:text-gray-300">
                      <span>Learn more</span>
                      <span className="ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
