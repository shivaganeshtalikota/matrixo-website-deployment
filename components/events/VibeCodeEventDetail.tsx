'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers,
  FaUser, 
  FaTag, 
  FaCode, 
  FaRobot, 
  FaTrophy, 
  FaGift, 
  FaCertificate, 
  FaNetworkWired,
  FaChevronDown,
  FaChevronUp,
  FaRupeeSign,
  FaCheckCircle,
  FaLaptopCode,
  FaBolt
} from 'react-icons/fa'
import { useAuth } from '@/lib/AuthContext'
import { toast } from 'sonner'
// @ts-ignore - Import error is a VS Code cache issue, file exists
import VibeCodeRegistrationForm from './VibeCodeRegistrationForm'

export default function VibeCodeEventDetail({ event }: { event: any }) {
  const { user } = useAuth()
  const [showRegistration, setShowRegistration] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const scheduleSectionRef = useRef<HTMLDivElement>(null)

  const handleRegisterNow = (ticket: any) => {
    if (event.googleFormLink) {
      window.open(event.googleFormLink, '_blank', 'noopener,noreferrer')
      return
    }
    if (!user) {
      const currentUrl = window.location.pathname
      window.location.href = `/auth?returnUrl=${encodeURIComponent(currentUrl)}`
      return
    }
    setSelectedTicket(ticket)
    setShowRegistration(true)
  }

  const scrollToSchedule = () => {
    scheduleSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
  }

  const closeRegistration = () => {
    setShowRegistration(false)
    setSelectedTicket(null)
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#0d1529] to-[#0a0f1c]">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Dark navy gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0d1830] to-[#0a0f1c]" />
          
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(0, 200, 255, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(0, 200, 255, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              animation: 'gridMove 20s linear infinite'
            }} />
          </div>
          
          {/* Floating particles */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 20}s`,
              }}
            />
          ))}
          
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Organizer Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6"
            >
              <span className="text-cyan-400 text-sm font-medium">Organized by matriXO</span>
            </motion.div>

            {/* 1st Year Only Badge */}
            {event.firstYearOnly && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mb-6"
              >
                <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/40 rounded-full px-5 py-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  <span className="text-orange-300 text-sm font-semibold">Only for 1st Year Students</span>
                </div>
              </motion.div>
            )}

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,200,255,0.5)]">
                VibeCode
              </span>
              <span className="text-white"> IRL</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl lg:text-3xl text-cyan-300/80 font-light mb-8">
              Where Coding Meets the Vibe
            </p>

            {/* Icon Highlights */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <FaClock className="text-cyan-400" />
                <span className="text-white text-sm md:text-base">Full Day Event</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <FaMapMarkerAlt className="text-cyan-400" />
                <span className="text-white text-sm md:text-base">KPRIT, Hyderabad</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <FaUser className="text-cyan-400" />
                <span className="text-white text-sm md:text-base">Individual Event</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <FaRobot className="text-cyan-400" />
                <span className="text-white text-sm md:text-base">AI-Powered</span>
              </div>
            </div>

              {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => handleRegisterNow(event.googleFormLink ? null : event.tickets[0])}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg text-white
                         shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300
                         overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {event.googleFormLink ? 'Register Now' : 'Register Now – ₹69 Only'}
                  <FaBolt className="group-hover:animate-pulse" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>

              <motion.button
                onClick={scrollToSchedule}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-cyan-500/50 rounded-full font-semibold text-cyan-400
                         hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300"
              >
                View Schedule
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cyan-400/50 animate-bounce"
        >
          <FaChevronDown className="text-2xl" />
        </motion.div>
      </section>

      {/* EVENT OVERVIEW */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              What is <span className="text-cyan-400">VibeCode IRL</span>?
            </h2>
            
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                VibeCode IRL isn't just another workshop. It's a <span className="text-cyan-400 font-semibold">full-day event</span> where 
                you learn to leverage cutting-edge AI tools to supercharge your coding workflow.
              </p>
              
              <p>
                Learn fast. Code smarter. <span className="text-cyan-400 font-semibold">Level up your skills.</span>
              </p>
              
              <p>
                Whether you're prompting GPT, pair-programming with Copilot, or debugging with Claude — this is where 
                <span className="text-cyan-400 font-semibold"> AI meets practical development</span>. No fluff. Just hands-on learning.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-10">
              <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium">
                AI-Assisted Development
              </span>
              <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium">
                Hands-On Practice
              </span>
              <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium">
                Expert Mentorship
              </span>
              <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium">
                3 Hours of Learning
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why <span className="text-cyan-400">Join</span>?
            </h2>
            <p className="text-gray-400 text-lg">More than just code. Real value.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Certificate Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group p-6 bg-gradient-to-br from-[#0d1830] to-[#0a1525] border border-cyan-500/20 
                       rounded-2xl hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 
                            group-hover:bg-cyan-500/20 transition-colors">
                <FaCertificate className="text-2xl text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Certificates</h3>
              <p className="text-gray-400 text-sm">
                All participants receive physical certificates of participation from matriXO (distributed at the venue).
              </p>
            </motion.div>

            {/* Hands-On Learning Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group p-6 bg-gradient-to-br from-[#0d1830] to-[#0a1525] border border-cyan-500/20 
                       rounded-2xl hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 
                            group-hover:bg-cyan-500/20 transition-colors">
                <FaTrophy className="text-2xl text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hands-On Learning</h3>
              <p className="text-gray-400 text-sm">
                Practical workshop with real coding exercises. Learn by doing, not just watching.
              </p>
            </motion.div>

            {/* Exposure Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group p-6 bg-gradient-to-br from-[#0d1830] to-[#0a1525] border border-cyan-500/20 
                       rounded-2xl hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 
                            group-hover:bg-cyan-500/20 transition-colors">
                <FaNetworkWired className="text-2xl text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Industry Exposure</h3>
              <p className="text-gray-400 text-sm">
                Connect with tech mentors, get feedback, and expand your network.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SCHEDULE SECTION */}
      <section ref={scheduleSectionRef} className="py-20 px-6" id="schedule">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Event <span className="text-cyan-500 dark:text-cyan-400">Schedule</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Two sessions. {format(new Date(event.date), 'MMM d')} & {format(new Date(event.endDate), 'MMM d')}. Choose your day!</p>
          </motion.div>

          {/* Single Session Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gradient-to-br dark:from-[#0d1830] dark:to-[#0a1525] border border-gray-200 dark:border-cyan-500/20 rounded-2xl p-8 max-w-3xl mx-auto shadow-lg dark:shadow-none"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <FaClock className="text-2xl text-cyan-500 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Full Day Event</h3>
                <p className="text-gray-500 dark:text-gray-400">Workshop, Quiz, Competition & Certificates</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {event.agenda?.map((item: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="w-24 flex-shrink-0">
                    <span className="text-cyan-600 dark:text-cyan-400 text-sm font-medium">
                      {item.time}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full mb-2" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRICING & REGISTRATION RULES */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent" id="pricing">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pricing & <span className="text-cyan-400">Registration</span>
            </h2>
          </motion.div>

          {event.googleFormLink ? (
            /* Google Form Registration Card */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#0d1830] to-[#0a1525] border-2 border-cyan-500/30 rounded-3xl p-8 md:p-12 text-center"
            >
              {event.firstYearOnly && (
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                  <span className="text-orange-300 font-semibold text-sm">Only for 1st Year Students</span>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6 text-left mb-10">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Interactive Workshop</h4>
                    <p className="text-gray-400 text-sm">Hands-on AI-assisted coding session for 1st year students.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Team-Based Challenge</h4>
                    <p className="text-gray-400 text-sm">Compete in teams and win exciting prizes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Participation Certificate</h4>
                    <p className="text-gray-400 text-sm">Every participant receives a certificate from matriXO.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Swags & Prizes</h4>
                    <p className="text-gray-400 text-sm">Win exciting swags and prizes for top performers.</p>
                  </div>
                </div>
              </div>
              <motion.button
                onClick={() => handleRegisterNow(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full
                         font-bold text-lg text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50
                         transition-all duration-300"
              >
                Register Now
              </motion.button>
              <p className="text-gray-500 text-sm mt-4">Opens Google Form in a new tab</p>
            </motion.div>
          ) : (
            /* Default Pricing Card */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#0d1830] to-[#0a1525] border-2 border-cyan-500/30 rounded-3xl p-8 md:p-12 text-center"
            >
              {/* Price Display */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <span className="text-2xl text-gray-500 line-through">₹99</span>
                  <span className="text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text">
                    ₹69
                  </span>
                </div>
                <p className="text-gray-400">Per person</p>
                <div className="inline-block mt-4 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full">
                  <span className="text-orange-400 font-semibold text-sm">Early Bird Discount Active</span>
                </div>
              </div>

              {/* Rules */}
              <div className="grid md:grid-cols-2 gap-6 text-left mb-10">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Individual Registration</h4>
                    <p className="text-gray-400 text-sm">Each person registers individually. No team required.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Full-Day Event Access</h4>
                    <p className="text-gray-400 text-sm">Workshop, quiz, competition, lunch & certificates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Physical Certificate Included</h4>
                    <p className="text-gray-400 text-sm">₹69 includes full day access, lunch, and certificate.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold">Limited Seats</h4>
                    <p className="text-gray-400 text-sm">Only 144 participants per day. Register early to secure your spot.</p>
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <motion.button
                onClick={() => handleRegisterNow(event.tickets[0])}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full
                         font-bold text-lg text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50
                         transition-all duration-300"
              >
                Register Now
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* REGISTRATION FORM INFO & PAYMENT — hidden when using Google Form */}
      {!event.googleFormLink && (
        <>
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Registration <span className="text-cyan-400">Fields</span>
            </h2>
            <p className="text-gray-400 text-lg">What you'll need to register</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#0d1830] to-[#0a1525] border border-cyan-500/20 rounded-2xl p-8"
          >
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Full Name',
                'Email Address',
                'Phone Number',
                'College Name',
                'Year of Study',
                'GitHub Profile (Optional)'
              ].map((field, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <span className="text-cyan-400 text-sm font-bold">{index + 1}</span>
                  </div>
                  <span className="text-gray-300">{field}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
              <p className="text-cyan-400 text-sm text-center">
                After form submission, you'll be redirected to your UPI app to complete payment. 
                Payment confirmation is mandatory to secure your spot.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PAYMENT SECTION */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Secure <span className="text-cyan-400">Payment</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#0d1830] to-[#0a1525] border border-cyan-500/20 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaRupeeSign className="text-3xl text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Secure UPI Payment</h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              All payments are completed via UPI. After submitting the registration form, you'll be redirected 
              to your UPI app to complete payment. Payment confirmation is mandatory to secure your spot.
            </p>
            <div className="flex justify-center">
              <span className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full text-purple-300 text-lg font-semibold">UPI Payment</span>
            </div>
          </motion.div>
        </div>
      </section>
        </>
      )}

      {/* CERTIFICATES & DELIVERABLES */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What You'll <span className="text-cyan-400">Get</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-8 bg-gradient-to-br from-[#0d1830] to-[#0a1525] border border-cyan-500/20 rounded-2xl hover:border-cyan-500/50 transition-all"
            >
              <FaCertificate className="text-5xl text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Participation Certificate</h3>
              <p className="text-gray-400">Physical certificate for everyone who participated</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-8 bg-gradient-to-br from-[#0d1830] to-[#0a1525] border border-cyan-500/20 rounded-2xl hover:border-cyan-500/50 transition-all"
            >
              <FaGift className="text-5xl text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Swags</h3>
              <p className="text-gray-400">Exciting swags for top 3 quiz competition winners</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center p-8 bg-gradient-to-br from-[#0d1830] to-[#0a1525] border border-cyan-500/20 rounded-2xl hover:border-cyan-500/50 transition-all"
            >
              <FaTrophy className="text-5xl text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Merit Certificate</h3>
              <p className="text-gray-400">Special merit certificates for top 3 competition winners</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* VENUE & LOCATION */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Venue & <span className="text-cyan-400">Location</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#0d1830] to-[#0a1525] border border-cyan-500/20 rounded-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-2xl text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Auditorium, D-Block</h3>
                  <p className="text-gray-300 mb-1">Kommuri Pratap Reddy Institute of Technology (KPRIT)</p>
                  <p className="text-gray-400">Ghatkesar, Hyderabad, Telangana</p>
                  <a 
                    href="https://maps.app.goo.gl/phYNNYQyWgacvBA59"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mt-4 transition-colors"
                  >
                    <span>Get Directions</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Map */}
            <div className="h-64 md:h-80 border-t border-cyan-500/20">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.553845987853!2d78.68277187462795!3d17.433186001485225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a33110155555557%3A0xb597e25edcbfbfbb!2sKommuri%20Pratap%20Reddy%20Institute%20Of%20Technology%20(Autonomous%20Institute)!5e0!3m2!1sen!2sin!4v1760181922948!5m2!1sen!2sin" 
                width="100%" 
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked <span className="text-cyan-400">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {event.faqs?.map((faq: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#0d1830] to-[#0a1525] border border-cyan-500/20 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-white font-semibold pr-4">{faq.question}</span>
                  {expandedFaq === index ? (
                    <FaChevronUp className="text-cyan-400 flex-shrink-0" />
                  ) : (
                    <FaChevronDown className="text-cyan-400 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-gray-400">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-cyan-950/30 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Urgency Badge */}
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-orange-400 font-medium text-sm">Seats are limited to 144 per day</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to <span className="text-cyan-400">Learn & Level Up</span>?
            </h2>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              This is your chance to master AI-assisted coding. Join us for 3 hours. 
              Transform your workflow. Level up your skills.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => handleRegisterNow(event.tickets[0])}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full 
                         font-bold text-xl text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 
                         transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {event.googleFormLink ? 'Register Now' : 'Register Now – ₹69 Only'}
                  <FaLaptopCode className="group-hover:rotate-12 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </div>

            <p className="text-gray-500 text-sm mt-6">
              Full-Day Event • KPRIT, Hyderabad • Offline Event
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer Spacer */}
      <div className="h-20" />

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistration && selectedTicket && (
          <VibeCodeRegistrationForm
            event={event}
            ticket={selectedTicket}
            onClose={closeRegistration}
          />
        )}
      </AnimatePresence>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0px) translateX(20px); }
          75% { transform: translateY(20px) translateX(10px); }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
