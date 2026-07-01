'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineCodeBracketSquare,
  HiOutlineHeart,
  HiOutlineLightBulb,
  HiOutlineRocketLaunch,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineStar,
  HiOutlineTrophy,
  HiOutlineUserGroup,
} from 'react-icons/hi2'
import HeadingHighlight from '@/components/HeadingHighlight'

const headingSolidClass = 'text-slate-900 dark:text-white'
const headingGradientClass =
  'bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 bg-clip-text text-transparent dark:from-sky-400 dark:via-blue-500 dark:to-indigo-400'
const sectionTextClass = 'text-slate-600 dark:text-slate-200/80'
const glassPanel =
  'rounded-3xl border border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-slate-400/15 dark:bg-slate-900/60 dark:shadow-[0_20px_60px_rgba(2,8,25,0.55)]'
const glassPanelSoft =
  'rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-[0_14px_32px_rgba(15,23,42,0.08)] dark:border-slate-400/15 dark:bg-slate-900/55 dark:shadow-[0_16px_40px_rgba(2,8,25,0.5)]'
const cardHover =
  'transition duration-300 ease-out hover:-translate-y-1 hover:border-blue-300/60 hover:shadow-[0_18px_40px_rgba(59,130,246,0.18)] dark:hover:border-blue-400/40 dark:hover:shadow-[0_20px_60px_rgba(59,130,246,0.25)]'
const iconShell =
  'flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-300/50 bg-blue-500/10 text-blue-500 shadow-[0_0_16px_rgba(59,130,246,0.18)] dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-400 dark:shadow-[0_0_16px_rgba(59,130,246,0.25)]'

const offerings = [
  {
    icon: HiOutlineCodeBracketSquare,
    title: 'Technical Workshops',
    description:
      'Hands-on coding workshops on cutting-edge technologies taught by industry experts, with real coding projects. Learn web development, AI/ML, cloud computing, and more.',
  },
  {
    icon: HiOutlineTrophy,
    title: 'Hackathons',
    description:
      'Competitive coding events where students build real projects and solve industry challenges with prizes and recognition.',
  },
  {
    icon: HiOutlineAcademicCap,
    title: 'Bootcamps',
    description:
      'Intensive multi-week training programs covering full-stack development, data science, cybersecurity, and more.',
  },
  {
    icon: HiOutlineBriefcase,
    title: 'Career Programs',
    description:
      'Placement preparation, resume building, mock interviews, mentorship programs, and DSA training to help you land your dream tech job.',
  },
  {
    icon: HiOutlineRocketLaunch,
    title: 'Campus Events',
    description:
      'Large-scale technical events, seminars, and conferences hosted at educational institutions across India.',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Corporate Collaboration',
    description:
      'We partner with leading institutions and companies to deliver cutting-edge technical training, host events, run internship drives, and build a talent pipeline for your organization.',
  },
]

const reasons = [
  'Hands-on technical training programs',
  'Industry-relevant curriculum',
  'Expert mentorship and guidance',
  'Growing partner network',
  'Career-focused approach',
]

const values = [
  {
    icon: HiOutlineAcademicCap,
    title: 'Student-First',
    description:
      'Every program is designed with student career growth in mind, from affordable pricing to placement support.',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Collaboration',
    description:
      'We work closely with colleges, industry experts, and companies to create programs that truly matter.',
  },
  {
    icon: HiOutlineHeart,
    title: 'Passion for Education',
    description:
      "We&apos;re driven by a genuine passion for empowering students through educational opportunities.",
  },
  {
    icon: HiOutlineSparkles,
    title: 'Innovation',
    description: 'We constantly evolve our platform with cutting-edge technology to serve our users better.',
  },
  {
    icon: HiOutlineStar,
    title: 'Excellence',
    description: 'We strive for excellence in every aspect of our service, from technology to customer support.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Transparency',
    description:
      'We maintain open, honest communication with all stakeholders and operate with integrity.',
  },
]

const partners = [
  'Smartzy Edu Pvt. Ltd.',
  'TEDxIARE',
  'TEDxCMRIT Hyderabad',
  'Kommuri Pratap Reddy Institute of Technology',
  'TEDxKPRIT',
  'J B Institute of Engineering and Technology',
]

export default function AboutContent() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#EEF4FF] to-white text-slate-900 dark:from-[#020617] dark:via-[#081028] dark:to-[#0B1120] dark:text-white">
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-blue-400/10 blur-[140px] dark:bg-blue-500/10" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-400/10 blur-[160px] dark:bg-indigo-500/10" />

      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="text-4xl font-bold md:text-6xl font-display mb-4">
              <HeadingHighlight
                text="About Us"
                highlightWords={1}
                solidClassName={headingSolidClass}
                gradientClassName={headingGradientClass}
              />
            </h1>
            <p className={`text-base md:text-lg leading-relaxed ${sectionTextClass}`}>
              Empowering students through technical workshops, hackathons, and career-focused bootcamps
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl font-display mb-4">
              <HeadingHighlight
                text="Who We Are"
                highlightWords={1}
                solidClassName={headingSolidClass}
                gradientClassName={headingGradientClass}
              />
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${glassPanel} grid gap-8 p-6 md:p-10 lg:grid-cols-[1.1fr_auto_1fr]`}
          >
            <div className="space-y-4 text-sm md:text-base text-slate-600 dark:text-slate-200/80">
              <p>
                matriXO is an MSME-registered ed-tech startup building the future of skill development.
                We combine AI, blockchain, and adaptive learning to bridge the gap between academic
                knowledge and industry demands.
              </p>
              <p>
                matriXO is an MSME-registered organization dedicated to bridging the gap between academic
                learning and industry requirements. We specialize in conducting hands-on technical
                workshops, competitive hackathons, intensive bootcamps, and career-focused events
                exclusively for students.
              </p>
              <p>
                Our journey began when we recognized that traditional education often lacks practical,
                industry-relevant training. Students were graduating without the real-world skills that
                companies demand. We set out to change that.
              </p>
              <p>
                Today, we partner with leading educational institutions across India to deliver technical
                training programs that transform students into industry-ready professionals. From
                full-stack development bootcamps to AI/ML workshops, we focus on what matters: building
                skills that lead to careers.
              </p>
            </div>

            <div className="hidden lg:block w-px bg-slate-200/70 dark:bg-white/10" />
            <div className="block lg:hidden h-px bg-slate-200/70 dark:bg-white/10" />

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className={iconShell}>
                  <HiOutlineRocketLaunch className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                    <HeadingHighlight
                      text="Our Mission"
                      highlightWords={1}
                      solidClassName={headingSolidClass}
                      gradientClassName={headingGradientClass}
                    />
                  </h3>
                  <p className={`text-sm leading-relaxed ${sectionTextClass}`}>
                    To empower every student with industry-relevant technical skills through hands-on
                    workshops, competitive hackathons, and intensive bootcamps. We believe that practical
                    learning, combined with expert mentorship, is the key to building successful tech
                    careers. Our mission is to make quality technical education accessible to all students.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={iconShell}>
                  <HiOutlineLightBulb className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                    <HeadingHighlight
                      text="Our Vision"
                      highlightWords={1}
                      solidClassName={headingSolidClass}
                      gradientClassName={headingGradientClass}
                    />
                  </h3>
                  <p className={`text-sm leading-relaxed ${sectionTextClass}`}>
                    To become India&apos;s most trusted technical education platform for students, creating a
                    vibrant ecosystem where learning meets career opportunities. We envision a future
                    where every engineering student graduates not just with a degree, but with real project
                    experience, competitive coding skills, and the confidence to succeed in the tech
                    industry.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl font-display mb-4">
              <HeadingHighlight
                text="What We Offer"
                highlightWords={1}
                solidClassName={headingSolidClass}
                gradientClassName={headingGradientClass}
              />
            </h2>
            <p className={`text-base md:text-lg ${sectionTextClass}`}>
              Comprehensive technical training programs designed to build industry-ready skills and
              launch successful tech careers.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`${glassPanelSoft} ${cardHover} flex h-full flex-col p-6`}
              >
                <div className={`mb-4 ${iconShell}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">
                  <HeadingHighlight
                    text={item.title}
                    highlightWords={1}
                    solidClassName={headingSolidClass}
                    gradientClassName={headingGradientClass}
                  />
                </h3>
                <p className={`text-sm leading-relaxed ${sectionTextClass}`}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl font-display mb-4">
              <HeadingHighlight
                text="Trusted By"
                highlightWords={1}
                solidClassName={headingSolidClass}
                gradientClassName={headingGradientClass}
              />
            </h2>
            <p className={`text-base md:text-lg ${sectionTextClass}`}>
              Partnering with leading educational institutions and event organizers across India.
            </p>
          </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {partners.map((partner) => (
                <motion.div
                  key={partner}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`${glassPanelSoft} ${cardHover} flex min-h-[86px] items-center justify-center px-4 py-5 text-center text-sm font-semibold text-slate-700 md:text-base dark:text-slate-100/90`}
                >
                  <span className="leading-snug">{partner}</span>
                </motion.div>
              ))}
            </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl font-display mb-4">
              <HeadingHighlight
                text="Why Choose matriXO?"
                highlightWords={1}
                solidClassName={headingSolidClass}
                gradientClassName={headingGradientClass}
              />
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${glassPanel} p-6 md:p-10`}
          >
            <ul className="grid gap-4 md:grid-cols-2">
              {reasons.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 text-sm md:text-base text-slate-600 dark:text-slate-200/80"
                >
                  <span className="mt-2 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.35)] dark:bg-blue-400 dark:shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl font-display mb-4">
              <HeadingHighlight
                text="Our Values"
                highlightWords={1}
                solidClassName={headingSolidClass}
                gradientClassName={headingGradientClass}
              />
            </h2>
            <p className={`text-base md:text-lg ${sectionTextClass}`}>
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`${glassPanelSoft} ${cardHover} flex h-full flex-col p-6`}
              >
                <div className={`mb-4 ${iconShell}`}>
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-white">
                  <HeadingHighlight
                    text={value.title}
                    highlightWords={1}
                    solidClassName={headingSolidClass}
                    gradientClassName={headingGradientClass}
                  />
                </h3>
                <p className={`text-sm leading-relaxed ${sectionTextClass}`}>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container-custom px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl font-display mb-4">
              <HeadingHighlight
                text="Supported by KPRISE"
                highlightWords={1}
                solidClassName={headingSolidClass}
                gradientClassName={headingGradientClass}
              />
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${glassPanel} flex flex-col items-center gap-6 p-6 md:flex-row md:gap-10 md:p-10`}
          >
            <div className="flex w-full items-center justify-center md:w-auto">
              <Image
                src="/logos/kprise-logo.png"
                alt="KPRISE Logo"
                width={220}
                height={120}
                className="h-16 w-auto object-contain dark:brightness-0 dark:invert"
              />
            </div>
            <div className="hidden md:block h-24 w-px bg-slate-200/70 dark:bg-white/10" />
            <div className="space-y-4 text-center md:text-left">
              <p className={`text-sm md:text-base leading-relaxed ${sectionTextClass}`}>
                We&apos;re proud to be supported by <strong>KPR Foundation for Innovation and Social Empowerment (KPRISE)</strong>,
                which has provided us with mentorship, resources, and a collaborative environment to grow. This partnership
                has been instrumental in our journey from an idea to a thriving platform serving thousands of students.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-600 md:justify-start dark:text-slate-200/70">
                <span className="rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  EdTech Startup
                </span>
                <span className="rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  Supported 2023
                </span>
                <span className="rounded-full border border-slate-200/70 bg-white/70 px-3 py-1.5 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  Hyderabad, India
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

