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
import { storeRedirectAfterLogin } from '@/lib/authRedirect'
import HeadingHighlight from '@/components/HeadingHighlight'
// @ts-ignore
import DevAgentsRegistrationForm from './DevAgentsRegistrationForm'

export default function DevAgentsEventDetail({ event }: { event: any }) {
  const { user } = useAuth()
  const [showRegistration, setShowRegistration] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const ticketSectionRef = useRef<HTMLDivElement>(null)
  const scheduleSectionRef = useRef<HTMLDivElement>(null)

  const handleRegisterNow = (ticket: any) => {
    if (!user) {
      storeRedirectAfterLogin()
      window.location.href = '/auth'
      return
    }
    setSelectedTicket(ticket)
    setShowRegistration(true)
  }

  const scrollToTickets = () => {
    ticketSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
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
    <div className="min-h-screen bg-gradient-to-b from-[#030712] via-[#0b0f19] to-[#030712] text-white">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0f172a] to-[#030712]" />
          
          {/* Animated grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }} />
          </div>
          
          {/* Neon Glow spots */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 mb-6 backdrop-blur-sm"
          >
            <FaRobot className="animate-pulse" />
            <span className="text-sm font-semibold tracking-wider uppercase">Agentic AI Hackathon & Workshop</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400"
          >
            {event.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
          >
            {event.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-6 max-w-4xl mx-auto mb-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <FaCalendar />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Date</p>
                <p className="text-sm font-semibold text-white">
                  {format(new Date(event.date), 'EEEE, MMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 hidden md:block" />

            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <FaClock />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Time</p>
                <p className="text-sm font-semibold text-white">09:30 AM - 06:00 PM</p>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10 hidden md:block" />

            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <FaMapMarkerAlt />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Venue</p>
                <p className="text-sm font-semibold text-white">{event.venue}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button
              onClick={scrollToTickets}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1"
            >
              Get Tickets & Register
            </button>
            <button
              onClick={scrollToSchedule}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
            >
              View Schedule
            </button>
          </motion.div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-24 bg-[#050b18] border-t border-b border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-extrabold mb-6">
                About <span className="text-cyan-400">DevAgents 1.0</span>
              </h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                {event.description}
              </p>
              <p className="text-gray-300 leading-relaxed">
                Whether you are a developer, researcher, or AI enthusiast, this event provides the absolute resources to transition from theoretical understanding to building actual production-grade AI systems.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <FaRobot className="text-3xl text-purple-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">Build Agents</h3>
                <p className="text-sm text-gray-400">Deploy custom autonomous agents from scratch.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <FaNetworkWired className="text-3xl text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">Orchestration</h3>
                <p className="text-sm text-gray-400">Master multi-agent communication frameworks.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <FaCode className="text-3xl text-indigo-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">Hackathon</h3>
                <p className="text-sm text-gray-400">Build in real-time and win exciting cash prizes.</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <FaCertificate className="text-3xl text-green-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">Certificate</h3>
                <p className="text-sm text-gray-400">Get verified DevAgents certification by matriXO.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS SECTION */}
      <section className="py-24 bg-[#030712]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-16">
            Event <span className="text-purple-400">Highlights</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {event.highlights.map((highlight: string, index: number) => (
              <motion.div
                key={`highlight-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <FaBolt />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Highlight #{index + 1}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{highlight}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKETS SECTION */}
      <section ref={ticketSectionRef} className="py-24 bg-[#050b18] border-t border-white/5">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-6">
            Select Your <span className="text-cyan-400">Pass</span>
          </h2>
          <p className="text-gray-400 text-center max-w-xl mx-auto mb-16 font-light">
            Secure your spot now. Capacity is limited to 150 developers to maintain high-quality individual support.
          </p>

          <div className="max-w-md mx-auto">
            {event.tickets.map((ticket: any) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#0b0f19] border-2 border-purple-500/40 relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 px-4 py-1.5 bg-purple-500 text-xs font-bold uppercase tracking-wider rounded-bl-xl text-white">
                  Limited Spots
                </div>

                <h3 className="text-2xl font-bold mb-2 text-white">{ticket.name}</h3>
                <p className="text-gray-400 text-sm mb-6 font-light">{ticket.description}</p>

                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-4xl font-extrabold text-white">₹{ticket.price}</span>
                  {ticket.originalPrice && (
                    <span className="text-gray-500 line-through text-lg">₹{ticket.originalPrice}</span>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {ticket.perks.map((perk: string, index: number) => (
                    <div key={`perk-${index}`} className="flex items-center gap-3 text-sm">
                      <FaCheckCircle className="text-cyan-400 flex-shrink-0" />
                      <span className="text-gray-300">{perk}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleRegisterNow(ticket)}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300"
                >
                  Register Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SCHEDULE SECTION */}
      <section ref={scheduleSectionRef} className="py-24 bg-[#030712] border-t border-white/5">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-16">
            Event <span className="text-purple-400">Schedule</span>
          </h2>

          <div className="max-w-3xl mx-auto space-y-6">
            {event.agenda.map((item: any, index: number) => (
              <motion.div
                key={`agenda-${index}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4 justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-cyan-300 font-mono text-sm font-semibold">{item.time}</span>
                </div>
                <div className="md:text-right">
                  <h3 className="font-bold text-white text-lg">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 bg-[#050b18] border-t border-white/5">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-16">
            Frequently Asked <span className="text-cyan-400">Questions</span>
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {event.faqs.map((faq: any, index: number) => (
              <div 
                key={`faq-${index}`}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex justify-between items-center font-bold"
                >
                  <span>{faq.question}</span>
                  {expandedFaq === index ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                <AnimatePresence initial={false}>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRATION MODAL */}
      <AnimatePresence>
        {showRegistration && selectedTicket && (
          <DevAgentsRegistrationForm
            event={event}
            ticket={selectedTicket}
            onClose={closeRegistration}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
