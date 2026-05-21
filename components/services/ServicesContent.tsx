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

export default function ServicesContent() {
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
              Programs That Build
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 block mt-2">Real Tech Careers</span>
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
              Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Programs</span>
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
                className="feature-card p-8"
              >
                <div className="feature-card-icon mb-6">
                  <service.icon className={`h-7 w-7 ${service.iconClassName}`} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {service.title}
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
                <div className="mt-6">
                  <Link href={`/contact?type=${encodeURIComponent(service.title)}`}>
                    <button className="btn-primary w-full">
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
      <section className="section-padding bg-white/30 dark:bg-white/[0.01] backdrop-blur-sm">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              How It <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Works</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              From registration to certification - a seamless learning journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Browse & Choose', desc: 'Explore our workshops, bootcamps, and hackathons to find the perfect program' },
              { step: '02', title: 'Register Online', desc: 'Quick and secure registration with instant confirmation via email' },
              { step: '03', title: 'Learn & Build', desc: 'Attend hands-on sessions, work on real projects with industry mentors' },
              { step: '04', title: 'Get Certified', desc: 'Receive certificates and lifetime access to resources and community' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
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
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-[var(--glass-radius-lg)] p-12 text-white text-center relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
              
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-6"
                >
                  <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                    <FaUsers size={40} />
                  </div>
                </motion.div>

                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                  Partner as Ticketing Partner
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
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
                      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6"
                    >
                      <div className="text-4xl mb-3">{benefit.icon}</div>
                      <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-white/80">{benefit.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-4 bg-white text-blue-600 font-bold rounded-full hover:shadow-2xl 
                             transition-all duration-200 text-lg"
                  >
                    Become a Partner →
                  </motion.button>
                </Link>

                <p className="mt-6 text-sm text-white/70">
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
              Simple, Transparent <span className="gradient-text">Pricing</span>
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
                className={`rounded-[var(--glass-radius)] p-8 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-neon-blue to-neon-purple text-white scale-105 shadow-2xl'
                    : 'glass-card'
                }`}
              >
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className={`${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-center ${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'}`}>
                      <span className={`mr-2 ${plan.highlighted ? 'text-white' : 'text-neon-blue'}`}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/contact">
                  <button className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-white text-neon-blue hover:shadow-xl'
                      : 'btn-primary'
                  }`}>
                    {plan.cta}
                  </button>
                </Link>
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
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 gradient-text">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers who trust matriXO for their ticketing needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="btn-primary">
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
