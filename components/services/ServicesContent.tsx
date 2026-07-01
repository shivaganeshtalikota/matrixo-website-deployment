'use client'

import { motion } from 'framer-motion'
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineCodeBracketSquare,
  HiOutlineRocketLaunch,
  HiOutlineTrophy,
  HiOutlineUserGroup,
} from 'react-icons/hi2'
import { FaUsers } from 'react-icons/fa'
import Link from 'next/link'
import HeadingHighlight from '@/components/HeadingHighlight'

const services = [
  {
    icon: HiOutlineCodeBracketSquare,
    title: 'Technical Workshops',
    description: 'Hands-on coding workshops on cutting-edge technologies taught by industry experts.',
    features: ['Web Development', 'Mobile App Development', 'Cloud Computing', 'DevOps & CI/CD', 'Database Management'],
    iconClassName: 'text-[#5B5BF6] dark:text-slate-200',
  },
  {
    icon: HiOutlineTrophy,
    title: 'Hackathons',
    description: 'Competitive coding events where students build real projects and solve industry challenges.',
    features: ['24-48 hour events', 'Industry mentors', 'Real problem statements', 'Prizes & recognition', 'Networking opportunities'],
    iconClassName: 'text-[#D97706] dark:text-slate-200',
  },
  {
    icon: HiOutlineAcademicCap,
    title: 'Bootcamps',
    description: 'Intensive multi-week training programs to make students industry-ready.',
    features: ['Full-Stack Development', 'Data Science & ML', 'Cybersecurity', 'Mobile Development', 'Project-based learning'],
    iconClassName: 'text-[#4F46E5] dark:text-slate-200',
  },
  {
    icon: HiOutlineBriefcase,
    title: 'Career Programs',
    description: 'Placement preparation and career guidance to help students land their dream jobs.',
    features: ['Resume building', 'Interview preparation', 'Mock interviews', 'DSA training', 'Soft skills development'],
    iconClassName: 'text-[#2563EB] dark:text-slate-200',
  },
  {
    icon: HiOutlineRocketLaunch,
    title: 'Campus Events',
    description: 'Large-scale technical events, seminars, and conferences hosted at your institution.',
    features: ['Tech talks', 'Industry seminars', 'Career fairs', 'Coding competitions', 'Innovation challenges'],
    iconClassName: 'text-[#059669] dark:text-slate-200',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Corporate Collaboration',
    description: 'Partner with us to train students or host events at your organization.',
    features: ['Custom programs', 'Internship drives', 'Hiring events', 'Brand visibility', 'Talent pipeline'],
    iconClassName: 'text-[#475569] dark:text-slate-200',
  },
]

const pricingPlans = [
  {
    name: 'Workshop',
    price: '₹499',
    period: '/student',
    description: 'Single-day hands-on workshops',
    features: [
      '6-8 hours of training',
      'Industry expert instructors',
      'Hands-on projects',
      'Certificate of completion',
      'Learning materials',
    ],
    cta: 'Register Now',
    highlighted: false,
  },
  {
    name: 'Bootcamp',
    price: '₹9,999',
    period: '/student',
    description: 'Intensive 4-6 week programs',
    features: [
      'Full-stack training',
      'Live projects',
      'Industry mentorship',
      'Placement assistance',
      'Internship opportunities',
      'Lifetime community access',
    ],
    cta: 'Enroll Today',
    highlighted: true,
  },
  {
    name: 'Institution',
    price: 'Custom',
    description: 'For colleges & universities',
    features: [
      'Custom program design',
      'Bulk pricing for students',
      'On-campus events',
      'Faculty training',
      'Placement support',
      'Industry partnerships',
    ],
    cta: 'Partner with Us',
    highlighted: false,
  },
]

const howItWorksSteps = [
  { step: '01', title: 'Browse & Choose', desc: 'Explore our workshops, bootcamps, and hackathons to find the perfect program' },
  { step: '02', title: 'Register Online', desc: 'Quick and secure registration with instant confirmation via email' },
  { step: '03', title: 'Learn & Build', desc: 'Attend hands-on sessions, work on real projects with industry mentors' },
  { step: '04', title: 'Get Certified', desc: 'Receive certificates and lifetime access to resources and community' },
]

export default function ServicesContent() {
  const pricingButtonClass =
    'w-full h-12 px-6 rounded-full font-semibold text-base flex items-center justify-center text-center text-[#111827] bg-[#ffffff] dark:bg-[#f8fafc] shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_14px_rgba(0,0,0,0.25)] border-0 dark:border dark:border-[rgba(255,255,255,0.08)] transition-all duration-300 ease-in-out hover:-translate-y-[2px] hover:bg-[#f3f4f6] dark:hover:bg-[#e5e7eb]'
  return (
    <div className="min-h-screen pt-0">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-900 dark:text-white section-padding overflow-hidden">
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="container-custom px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              <HeadingHighlight text="Programs That Build Real Tech Careers" highlightWords={3} />
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              From beginner workshops to intensive bootcamps, we offer hands-on technical training that prepares students for industry success.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="programs" className="section-padding bg-transparent">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <HeadingHighlight text="Our Programs" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive technical training designed to build industry-ready skills
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="feature-card p-8 h-full flex flex-col"
              >
                <div className="feature-card-icon mb-6">
                  <service.icon className={`h-7 w-7 ${service.iconClassName}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  <HeadingHighlight text={service.title} />
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-blue-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Link href={`/contact?type=${encodeURIComponent(service.title)}`}>
                    <button className={pricingButtonClass}>
                      Contact Us
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] dark:bg-[linear-gradient(135deg,#0f172a_0%,#111827_50%,#0b1120_100%)]">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <HeadingHighlight
                text="How It Works"
                solidClassName="text-[#0f172a] dark:text-[#f8fafc]"
                gradientClassName="text-[#2563eb] dark:text-[#60a5fa]"
              />
            </h2>
            <p className="text-xl text-[#475569] dark:text-[#cbd5e1]">
              From registration to certification - a seamless learning journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorksSteps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="text-center relative flex flex-col items-center transition-transform duration-300 ease-in-out hover:-translate-y-1"
              >
                {index < howItWorksSteps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="hidden md:block absolute top-10 left-1/2 w-[calc(100%+2rem)] border-t border-dashed border-[#cbd5e1] dark:border-[rgba(255,255,255,0.2)] pointer-events-none"
                  />
                )}
                <div className="relative z-10 w-20 h-20 mx-auto mb-4 bg-[#e2e8f0] dark:bg-[#f8fafc] border border-[#cbd5e1] dark:border-[rgba(255,255,255,0.1)] rounded-full flex items-center justify-center text-[#1d4ed8] dark:text-[#111827] text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3">
                  <HeadingHighlight
                    text={item.title}
                    solidClassName="text-[#111827] dark:text-white"
                    gradientClassName="text-[#2563eb] dark:text-[#60a5fa]"
                  />
                </h3>
                <p className="text-[#475569] dark:text-[#cbd5e1]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner as Ticketing Partner Section */}
      <section className="section-padding bg-transparent">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-[linear-gradient(135deg,#f8fafc_0%,#eef2f7_40%,#ffffff_100%)] dark:bg-[linear-gradient(135deg,#111827_0%,#1f2937_50%,#0f172a_100%)] rounded-[var(--glass-radius-lg)] p-12 text-[#111827] dark:text-[#f9fafb] text-center relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 dark:bg-white/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-6"
                >
                  <div className="w-20 h-20 mx-auto bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(255,255,255,0.08)] backdrop-blur-[10px] rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                    <FaUsers size={40} />
                  </div>
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-[#111827] dark:text-[#f9fafb]">
                  <HeadingHighlight
                    text="Partner as Ticketing Partner"
                    solidClassName="text-[#111827] dark:text-[#f9fafb]"
                    gradientClassName="bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] dark:from-[#60a5fa] dark:to-[#a78bfa]"
                  />
                </h2>
                <p className="text-xl text-[#4b5563] dark:text-[#d1d5db] mb-8 max-w-3xl mx-auto">
                  Are you organizing technical events, workshops, or hackathons? Partner with matriXO as your official ticketing platform and enjoy seamless registration management, secure payments, and powerful analytics.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  {[
                    { icon: '🎫', title: 'Easy Ticketing', desc: 'Create and manage multiple ticket tiers' },
                    { icon: '✉️', title: 'Email Confirmations', desc: 'Automated registration confirmations' },
                    { icon: '📊', title: 'Real-time Analytics', desc: 'Track registrations and attendee insights' },
                  ].map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="rounded-2xl p-6 bg-[rgba(255,255,255,0.75)] dark:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.5)] dark:border-[rgba(255,255,255,0.08)] shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
                    >
                      <div className="text-4xl mb-3">{benefit.icon}</div>
                      <h3 className="text-lg font-bold mb-2 text-[#111827] dark:text-[#f9fafb]">
                        <HeadingHighlight
                          text={benefit.title}
                          solidClassName="text-[#111827] dark:text-[#f9fafb]"
                          gradientClassName="bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] dark:from-[#60a5fa] dark:to-[#a78bfa]"
                        />
                      </h3>
                      <p className="text-sm text-[#4b5563] dark:text-[#d1d5db]">{benefit.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-white text-[#2563eb] dark:bg-[#f3f4f6] dark:text-[#1d4ed8] font-bold rounded-full hover:bg-[#f3f4f6] dark:hover:bg-[#e5e7eb] transition-colors duration-200 text-lg"
                  >
                    Become a Partner →
                  </motion.button>
                </Link>

                <p className="mt-6 text-sm text-[#4b5563] dark:text-[#d1d5db]">
                  Join 5+ institutions already using matriXO for their events
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding bg-transparent">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <HeadingHighlight text="Simple, Transparent Pricing" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose a plan that fits your needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-[var(--glass-radius)] p-8 h-full flex flex-col ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-neon-blue to-neon-purple text-white shadow-2xl'
                    : 'glass-card'
                }`}
              >
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    <HeadingHighlight text={plan.name} solidClassName={plan.highlighted ? 'text-white' : 'heading-solid'} />
                  </h3>
                  <p className={`mb-6 ${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className={`${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>{plan.period}</span>}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className={`flex items-center ${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                        <span className={`mr-2 ${plan.highlighted ? 'text-white' : 'text-neon-blue'}`}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto pt-8">
                  <Link href="/contact">
                    <button className={pricingButtonClass}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-white/30 dark:bg-white/[0.01] backdrop-blur-sm">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center glass-card p-12"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              <HeadingHighlight text="Ready to Get Started?" />
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers who trust matriXO for their ticketing needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className={pricingButtonClass}>
                  Schedule a Demo
                </button>
              </Link>
              <Link href="/events">
                <button className="btn-secondary">
                  Browse Events
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
