'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaGraduationCap, 
  FaUniversity,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaIdCard,
  FaCopy,
  FaMobileAlt,
  FaCodeBranch,
  FaUpload,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
  FaCode,
  FaQuestionCircle
} from 'react-icons/fa'
import { toast } from 'sonner'
import { useAuth } from '@/lib/AuthContext'
import { storeRedirectAfterLogin } from '@/lib/authRedirect'

interface DevAgentsRegistrationFormProps {
  event: any
  ticket: any
  onClose: () => void
}

export default function DevAgentsRegistrationForm({ event, ticket, onClose }: DevAgentsRegistrationFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [hasRegistered, setHasRegistered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    college: '',
    year: '1st Year',
    branch: '',
    city: '',
    github: '',
    linkedIn: '',
    experienceLevel: '',
    whyAttend: ''
  })

  // UPI ID configured for payment
  const UPI_ID = 'vutukurikishan.8@okaxis'
  
  // Unique transaction code matching pattern
  const [transactionCode, setTransactionCode] = useState('')

  useEffect(() => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    setTransactionCode(`DA-${timestamp}-${random}`)
  }, [])

  const UPI_PAYMENT_LINK = `upi://pay?pa=${UPI_ID}&pn=MatriXO&am=${ticket.price}&cu=INR&tn=${encodeURIComponent(`DevAgents 1.0 - ${transactionCode}`)}`

  // Duplicate check using localStorage (matching VibeCode reference)
  useEffect(() => {
    if (user?.email) {
      const registeredEmails = JSON.parse(localStorage.getItem('devagents_registrations') || '[]')
      if (registeredEmails.includes(user.email)) {
        setHasRegistered(true)
      }
    }
  }, [user?.email])

  // Pre-fill fields when user is authenticated
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        fullName: user.displayName || prev.fullName
      }))
    }
  }, [user])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      setIsMobile(isMobileDevice || window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID)
    toast.success('UPI ID copied to clipboard!')
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFileDialogOpen(false)
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }
      setPaymentScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
        toast.success('Screenshot selected successfully!')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFileDialogOpen(true)
    const handleFocus = () => {
      setTimeout(() => {
        setIsFileDialogOpen(false)
      }, 300)
      window.removeEventListener('focus', handleFocus)
    }
    window.addEventListener('focus', handleFocus)
    fileInputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter your full name')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return false
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Please enter a valid phone number (at least 10 digits)')
      return false
    }
    if (!formData.college.trim()) {
      toast.error('Please enter your college name')
      return false
    }
    if (!formData.year) {
      toast.error('Please select your year of study')
      return false
    }
    if (!formData.branch) {
      toast.error('Please select your branch')
      return false
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city')
      return false
    }
    if (!formData.experienceLevel) {
      toast.error('Please select your AI experience level')
      return false
    }
    if (!formData.whyAttend.trim()) {
      toast.error('Please let us know why you want to attend')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      toast.success('Please proceed to UPI payment')
      if (isMobile) {
        toast.info('Opening UPI app for payment...')
        setTimeout(() => {
          window.location.href = UPI_PAYMENT_LINK
        }, 1000)
      } else {
        setShowPaymentInfo(true)
        setIsSubmitting(false)
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment initiation failed')
      setIsSubmitting(false)
    }
  }

  const handleFinalSubmit = async () => {
    if (!user) {
      toast.error('Please login to register')
      return
    }

    if (hasRegistered) {
      toast.error('You have already registered for this event!')
      return
    }

    // Double-check localStorage
    const registeredEmails = JSON.parse(localStorage.getItem('devagents_registrations') || '[]')
    if (registeredEmails.includes(formData.email)) {
      setHasRegistered(true)
      toast.error('You have already registered for this event!')
      return
    }

    if (!screenshotPreview) {
      toast.error('Please upload payment screenshot')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        action: 'register',
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        year: formData.year,
        branch: formData.branch,
        city: formData.city,
        github: formData.github || '',
        linkedIn: formData.linkedIn || '',
        experienceLevel: formData.experienceLevel,
        whyAttend: formData.whyAttend,
        paymentScreenshot: screenshotPreview,
        transactionCode: transactionCode // Add for reference
      }

      toast.info('Submitting registration details...')

      // Send to the Next.js API proxy route instead of directly to GAS to handle responses properly
      const response = await fetch('/api/devagents/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit registration')
      }

      // Add email to local storage to prevent duplicate registrations
      const updatedList = [...registeredEmails, formData.email]
      localStorage.setItem('devagents_registrations', JSON.stringify(updatedList))
      setHasRegistered(true)

      toast.success(`🎉 Registration Successful! Entry ID: ${result.entryNumber}. Confirmation email sent.`)
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Registration failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (isFileDialogOpen) {
      e.stopPropagation()
      return
    }
    onClose()
  }

  if (hasRegistered) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#0b0f19] border border-purple-500/30 text-center text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
            <FaTimes size={20} />
          </button>
          <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-3">Already Registered</h3>
          <p className="text-gray-400 leading-relaxed">
            You have already submitted your registration for DevAgents 1.0! Please check your email inbox (and spam folder) for confirmation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={handleModalBackdropClick}
    >
      <div 
        className="w-full max-w-2xl bg-[#0b0f19] border border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl relative my-8 text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              DevAgents 1.0 Registration
            </h2>
            <p className="text-xs text-gray-400 font-light mt-1">
              Secure your pass for {ticket.name} (₹{ticket.price})
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Form / Payment content */}
        {!showPaymentInfo ? (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full py-3 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={!!user?.email}
                    className="w-full py-3 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm readonly:opacity-80"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full py-3 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm"
                    placeholder="10-digit number"
                    required
                  />
                </div>
              </div>

              {/* College */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  College Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaUniversity className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full py-3 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm"
                    placeholder="College or university name"
                    required
                  />
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Year of Study <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full py-3 pl-12 pr-4 bg-[#111827] border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm appearance-none"
                    required
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Branch / Department <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaCodeBranch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full py-3 pl-12 pr-4 bg-[#111827] border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm appearance-none"
                    required
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="AIML">Artificial Intelligence (AI/ML)</option>
                    <option value="DS">Data Science (DS)</option>
                    <option value="ECE">Electronics & Communication (ECE)</option>
                    <option value="EEE">Electrical & Electronics (EEE)</option>
                    <option value="MECH">Mechanical Eng (MECH)</option>
                    <option value="CIVIL">Civil Eng (CIVIL)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  City <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full py-3 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm"
                    placeholder="Enter your current city"
                    required
                  />
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Experience with AI/Coding <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaCode className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full py-3 pl-12 pr-4 bg-[#111827] border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm appearance-none"
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner (No experience)</option>
                    <option value="Intermediate">Intermediate (Built basic projects)</option>
                    <option value="Advanced">Advanced (Experienced builder)</option>
                  </select>
                </div>
              </div>

              {/* GitHub */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  GitHub Profile <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <FaGithub className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="w-full py-3 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  LinkedIn Profile <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <FaLinkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="url"
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleChange}
                    className="w-full py-3 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>

            {/* Why Attend */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Why do you want to attend DevAgents 1.0? <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaQuestionCircle className="absolute left-4 top-4 text-gray-500" />
                <textarea
                  name="whyAttend"
                  value={formData.whyAttend}
                  onChange={handleChange}
                  rows={3}
                  className="w-full py-3 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none transition text-sm"
                  placeholder="Explain why you are interested in autonomous AI agents and what you hope to achieve..."
                  required
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Payment Step */
          <div className="p-8 space-y-6">
            <div className="text-center max-w-md mx-auto space-y-3">
              <h3 className="text-lg font-bold">Complete Your Payment</h3>
              <p className="text-sm text-gray-400">
                Please scan the QR code using any UPI app (PhonePe, GPay, Paytm) or copy the UPI ID below to complete your registration.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl max-w-xl mx-auto">
              {/* QR Code */}
              <div className="p-4 bg-white rounded-xl border-4 border-purple-500">
                <QRCodeSVG value={UPI_PAYMENT_LINK} size={180} />
              </div>

              {/* Payment Details */}
              <div className="space-y-4 flex-1 text-center md:text-left w-full">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Amount</p>
                  <p className="text-2xl font-bold text-white">₹{ticket.price}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">UPI ID</p>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10 max-w-xs mx-auto md:mx-0">
                    <span className="text-sm font-mono truncate text-cyan-300">{UPI_ID}</span>
                    <button 
                      onClick={copyUpiId}
                      className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition"
                    >
                      <FaCopy size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Transaction Code</p>
                  <p className="text-sm font-mono text-purple-400">{transactionCode}</p>
                </div>
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Upload Payment Screenshot <span className="text-red-400">*</span>
                </p>
                <p className="text-xs text-gray-500 mb-4">Maximum size 5MB. Format: JPG, PNG, JPEG</p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleScreenshotChange}
                accept="image/*"
                className="hidden"
              />

              {!screenshotPreview ? (
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="w-full py-8 border-2 border-dashed border-white/20 hover:border-cyan-500/50 rounded-2xl bg-white/5 flex flex-col items-center justify-center gap-3 transition group"
                >
                  <FaUpload className="text-3xl text-gray-500 group-hover:text-cyan-400 transition" />
                  <span className="text-sm text-gray-400 group-hover:text-white transition">
                    Click to select payment screenshot
                  </span>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-white/15 max-w-xs mx-auto aspect-video flex items-center justify-center bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={screenshotPreview} 
                    alt="Payment screenshot preview" 
                    className="max-h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentScreenshot(null)
                      setScreenshotPreview(null)
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Final Action buttons */}
            <div className="flex gap-4 pt-4 border-t border-white/5 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setShowPaymentInfo(false)}
                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition text-sm"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting || !screenshotPreview}
                onClick={handleFinalSubmit}
                className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
