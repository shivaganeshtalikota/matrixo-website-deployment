'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { FaBug, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'

const serviceSubjectOptions = [
  'Technical Workshops',
  'Hackathons',
  'Bootcamps',
  'Career Programs',
  'Campus Events',
  'Corporate Collaboration',
]

const contactInfoCards = [
  {
    title: 'Email Us',
    value: 'hello@matrixo.in',
    icon: FaEnvelope,
  },
  {
    title: 'Call Us',
    value: '+91 99XXXXXX88',
    icon: FaPhone,
  },
  {
    title: 'Our Location',
    value: 'Ghanapur, Hyderabad, India',
    icon: FaMapMarkerAlt,
  },
]

export default function ContactContent() {
  const searchParams = useSearchParams()
  const inputClassName =
    'w-full h-[54px] bg-transparent border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-400 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300/40 hover:shadow-[0_0_18px_rgba(96,165,250,0.18)]'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const previousStyles = {
      htmlHeight: html.style.height,
      htmlOverflow: html.style.overflow,
      bodyHeight: body.style.height,
      bodyOverflow: body.style.overflow,
    }

    html.style.height = '100%'
    html.style.overflow = 'hidden'
    body.style.height = '100%'
    body.style.overflow = 'hidden'

    return () => {
      html.style.height = previousStyles.htmlHeight
      html.style.overflow = previousStyles.htmlOverflow
      body.style.height = previousStyles.bodyHeight
      body.style.overflow = previousStyles.bodyOverflow
    }
  }, [])

  useEffect(() => {
    const typeParam = searchParams.get('type')
    if (!typeParam) {
      return
    }

    let decodedType = typeParam
    try {
      decodedType = decodeURIComponent(typeParam)
    } catch {
      decodedType = typeParam
    }

    if (serviceSubjectOptions.includes(decodedType)) {
      setFormData((prev) => ({ ...prev, subject: decodedType }))
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Thank you for your message! We\'ll get back to you soon.')
        const typeParam = searchParams.get('type')
        let decodedType = ''
        if (typeParam) {
          try {
            decodedType = decodeURIComponent(typeParam)
          } catch {
            decodedType = typeParam
          }
        }

        const preselectedSubject = serviceSubjectOptions.includes(decodedType) ? decodedType : ''
        setFormData({ name: '', email: '', phone: '', subject: preselectedSubject, message: '' })
      } else {
        toast.error(data.error || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="relative isolate min-h-screen h-screen w-full overflow-hidden">
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm hover:bg-white/20 transition"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-40 brightness-90 contrast-110 saturate-125"
        >
          <source src="/backgrounds/mesh.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#020617]/85 via-[#0a1a3a]/60 to-[#1e3a8a]/40" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_35%_45%,rgba(59,130,246,0.18),transparent_58%)]" />
      <div className="absolute inset-y-0 right-0 -z-10 w-[60%] bg-gradient-to-l from-[#020617] via-[#020617]/95 to-transparent" />

      <main className="relative z-10 flex h-full items-center px-[clamp(2rem,5vw,6rem)] py-[clamp(1rem,3vh,2rem)] overflow-hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-[clamp(10rem,15vw,18rem)]">
          <div className="relative z-10 w-full max-w-[560px] lg:flex-[0_0_48%] lg:translate-x-[3%]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full h-auto max-h-[700px] overflow-visible space-y-4 rounded-2xl border border-white/10 bg-[#0a0f2c]/50 p-8 backdrop-blur-xl"
              >
                <h2 className="mb-1 text-xl font-semibold text-white">Let's Connect</h2>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-200">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={inputClassName}
                      placeholder="Abhishek Kumar"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-200">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClassName}
                      placeholder="abhishek@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-200">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder="+91 99XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-200">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={`${inputClassName} appearance-none`}
                    >
                      <option value="" className="bg-[#0f1737] text-gray-200">Select a subject</option>
                      {serviceSubjectOptions.map((option) => (
                        <option key={option} value={option} className="bg-[#0f1737] text-gray-200">
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-200">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={3}
                      className={`${inputClassName} h-[120px] min-h-[120px] max-h-[120px] resize-none`}
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[58px] mt-4 rounded-[18px] text-white font-medium border border-white/20 bg-[linear-gradient(90deg,#050C4F,#31387D,#A0A1B8)] bg-[length:200%_100%] bg-left hover:bg-right transition-all duration-500 ease-in-out"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="relative w-full max-w-[430px] lg:flex-[0_0_42%] lg:ml-auto lg:translate-x-[12%] lg:pr-[clamp(5rem,8vw,12rem)]"
          >
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-[1.08]">
                  We're Here
                  <span className="block bg-gradient-to-r from-[#A0A1B8] via-[#8ab6ff] to-[#5a6ff2] bg-clip-text text-transparent">
                    To Help You
                  </span>
                </h1>
                <div className="mt-4 h-px w-16 bg-gradient-to-r from-blue-400/60 to-transparent" />
              </div>

              <Link
                href="mailto:hello@matrixo.in?subject=Bug%20Report"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-blue-100/80 backdrop-blur-md transition-colors duration-300 hover:border-blue-300/40 hover:bg-white/10"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/10 text-blue-200">
                  <FaBug className="text-[11px]" />
                </span>
                Report a Bug
              </Link>

              <p className="text-sm leading-relaxed text-blue-100/70">
                Have a question, idea, or project in mind? Let's build something great together.
              </p>

              <div className="grid gap-4">
                {contactInfoCards.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-4 rounded-[20px] border border-white/10 bg-white/5 px-[1.2rem] py-4 backdrop-blur-md transition-colors duration-300 hover:border-blue-400/30 hover:bg-white/10"
                  >
                    <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white/10 bg-white/10 text-blue-200">
                      <item.icon className="text-[15px]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-100/60">
                        {item.title}
                      </p>
                      <p className="text-sm font-medium text-white/90">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
