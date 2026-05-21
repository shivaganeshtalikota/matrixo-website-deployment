'use client'

import { motion } from 'framer-motion'
import { HiOutlineBriefcase, HiOutlineCodeBracketSquare, HiOutlineUserGroup } from 'react-icons/hi2'
import Features from '@/components/home/Features'
import Partners from '@/components/home/Partners'

export default function About() {
  return (
    <>
      <section className="section-padding bg-white/30 dark:bg-white/[0.01] backdrop-blur-sm">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Who We <span className="gradient-text">Are</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              matriXO is an MSME-registered ed-tech startup building the future of skill
              development. We combine AI, blockchain, and adaptive learning to bridge the gap
              between academic knowledge and industry demands.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: HiOutlineCodeBracketSquare,
                title: 'Hands-on Training',
                description: 'Industry-relevant workshops and bootcamps with real coding projects. Learn web development, AI/ML, cloud computing, and more from expert instructors.',
                iconClassName: 'text-[#5B5BF6] dark:text-slate-200',
              },
              {
                icon: HiOutlineBriefcase,
                title: 'Career Growth',
                description: 'Placement preparation, resume building, mock interviews, and mentorship programs designed to help you land your dream tech job.',
                iconClassName: 'text-[#2563EB] dark:text-slate-200',
              },
              {
                icon: HiOutlineUserGroup,
                title: 'Industry Partnerships',
                description: 'We partner with leading institutions and companies to deliver cutting-edge technical training and create career opportunities for students.',
                iconClassName: 'text-[#059669] dark:text-slate-200',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="feature-card p-8"
              >
                <div className="feature-card-icon mb-6">
                  <item.icon className={`h-7 w-7 ${item.iconClassName}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Features />
      <Partners hideLogos />
    </>
  )
}
