'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaUniversity, FaGraduationCap, FaMapMarkerAlt, FaBus, FaInfoCircle, FaTimes, FaUpload } from 'react-icons/fa'
import { toast } from 'sonner'
import Image from 'next/image'

interface EventRegistrationFormProps {
  event: any
  ticket: any
  onClose: (success?: boolean) => void
}

export default function EventRegistrationForm({ event, ticket, onClose }: EventRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const closeTimerRef = useRef<number | null>(null)
  const isSubmittingRef = useRef(false)

  const [formData, setFormData] = useState({
    fullName: '',
    contactNumber: '',
    email: '',
    studentId: '',
    collegeName: '',
    department: '',
    year: '',
    graduationYear: '',
    emergencyContact: '',
    city: '',
    state: '',
    wantCertificate: 'no',
    wantTransport: 'no',
    hearAboutEvent: ''
  })

  // UPI Payment Link for TEDxKPRIT
  const UPI_PAYMENT_LINK = 'upi://pay?pa=bhuvaneshwaripothuraju2005@oksbi'

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    isSubmittingRef.current = isSubmitting
  }, [isSubmitting])

  const requestClose = useCallback((success: boolean = false) => {
    if (isSubmittingRef.current) return

    setIsOpen(false)

    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
    }

    closeTimerRef.current = window.setTimeout(() => {
      onClose(success)
    }, 220)
  }, [onClose])

  useEffect(() => {
    setMounted(true)
    setIsOpen(true)

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      overscrollBehavior: document.body.style.overscrollBehavior,
    }
    const previousDocumentStyles = {
      overflow: document.documentElement.style.overflow,
      overscrollBehavior: document.documentElement.style.overscrollBehavior,
    }

    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.overscrollBehavior = 'none'

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      document.body.style.overflow = previousBodyStyles.overflow
      document.body.style.paddingRight = previousBodyStyles.paddingRight
      document.body.style.overscrollBehavior = previousBodyStyles.overscrollBehavior
      document.documentElement.style.overflow = previousDocumentStyles.overflow
      document.documentElement.style.overscrollBehavior = previousDocumentStyles.overscrollBehavior
    }
  }, [requestClose])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setPaymentScreenshot(file)
      toast.success('Screenshot uploaded successfully')
    }
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const sendToGoogleSheet = async (data: any) => {
    try {
      const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL

      console.log('🔍 DEBUG: Starting submission')
      console.log('🔍 Script URL:', GOOGLE_SCRIPT_URL)

      if (!GOOGLE_SCRIPT_URL) {
        console.error('❌ Google Script URL is missing!')
        throw new Error('Google Script URL not configured. Please check .env.local file.')
      }

      // First, check if event is sold out
      console.log('🔍 Checking ticket availability...')
      console.log('🔍 Event ID:', data.eventId)

      try {
        const checkResponse = await fetch(`${GOOGLE_SCRIPT_URL}?action=getTicketCount&eventId=${data.eventId}`, {
          method: 'GET',
          cache: 'no-store',
        })
        const checkData = await checkResponse.json()

        console.log('📊 Ticket check response:', checkData)

        if (checkData.success) {
          const eventIdLower = data.eventId.toLowerCase()
          const soldOutLimit = eventIdLower.includes('tedxkprit') ? 100 : 2000
          console.log(`🎫 Event ID check: "${eventIdLower}" includes "tedxkprit"? ${eventIdLower.includes('tedxkprit')}`)
          console.log(`🎫 Current tickets: ${checkData.ticketsSold}/${soldOutLimit}`)

          if (checkData.ticketsSold >= soldOutLimit) {
            console.log('🚫 EVENT IS SOLD OUT!')
            throw new Error('Event is sold out')
          }
          console.log(`✅ Tickets available: ${checkData.ticketsSold}/${soldOutLimit}`)
        }
      } catch (checkError: any) {
        console.error('❌ Ticket check error:', checkError)
        if (checkError.message && checkError.message.includes('sold out')) {
          throw checkError
        }
        console.warn('⚠️ Could not verify ticket count, proceeding with submission')
      }

      console.log('📊 Data to send:', data)
      console.log('🚀 Sending request to Google Apps Script...')

      // Send to Google Apps Script
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('✅ Request sent successfully')
      console.log('⏳ Waiting for Google Script to process...')

      // Wait for Google Script to process
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('✅ Data sent to Google Sheet successfully')
      return true
    } catch (error: any) {
      console.error('❌ ERROR in sendToGoogleSheet:', error)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error stack:', error.stack)

      // Re-throw the error as-is so we can handle it properly in handleSubmit
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🚀 Form submission started')

    // Validate payment screenshot for paid events
    if (ticket.price > 0 && !paymentScreenshot) {
      console.error('❌ No payment screenshot uploaded')
      toast.error('Please upload payment screenshot before submitting')
      return
    }

    setIsSubmitting(true)

    try {
      let base64Image = ''

      if (paymentScreenshot) {
        // Convert screenshot to base64
        console.log('🔄 Converting screenshot to base64...')
        toast.info('Processing payment screenshot...')
        base64Image = await convertFileToBase64(paymentScreenshot)
        console.log('✅ Screenshot converted to base64')
      }

      // Prepare data to send to Google Sheet
      console.log('📝 Preparing registration data...')
      const registrationData = {
        timestamp: new Date().toISOString(),
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        ticketType: ticket.name,
        ticketPrice: ticket.price,
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        studentId: formData.studentId,
        collegeName: formData.collegeName,
        department: formData.department,
        year: formData.year,
        emergencyContact: formData.emergencyContact,
        city: formData.city,
        state: formData.state,
        paymentScreenshot: base64Image,
        screenshotFileName: paymentScreenshot?.name || '',
        wantCertificate: formData.wantCertificate,
        wantTransport: formData.wantTransport,
        hearAboutEvent: formData.hearAboutEvent,
        status: ''
      }

      console.log('✅ Registration data prepared')

      // Send data to Google Apps Script
      console.log('📤 Sending to Google Apps Script...')
      toast.info('Submitting registration...')

      await sendToGoogleSheet(registrationData)

      console.log('🎉 Registration submitted successfully!')

      // Success message
      toast.success('✅ Registration submitted successfully! We will verify your payment and send confirmation via email.')

      // Reset form
      setFormData({
        fullName: '',
        contactNumber: '',
        email: '',
        studentId: '',
        collegeName: '',
        department: '',
        year: '',
        graduationYear: '',
        emergencyContact: '',
        city: '',
        state: '',
        wantCertificate: 'no',
        wantTransport: 'no',
        hearAboutEvent: ''
      })
      setPaymentScreenshot(null)

      // Close the form after a short delay and signal success
      setTimeout(() => {
        console.log('✅ Closing form with success=true...')
        requestClose(true) // Pass true to indicate successful registration
      }, 2000)

    } catch (error: any) {
      console.error('❌❌❌ REGISTRATION ERROR:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })

      // Check if it's a sold out error
      if (error.message && error.message.includes('sold out')) {
        toast.error('🎫 SOLD OUT! This event has reached its maximum capacity of 144 registrations per day.', {
          duration: 5000,
        })
      } else {
        toast.error(`Failed to submit: ${error.message || 'Please try again'}`)
      }
    } finally {
      setIsSubmitting(false)
      console.log('Form submission process completed')
    }
  }

  const handlePaymentClick = () => {
    window.location.href = UPI_PAYMENT_LINK
    toast.info('Complete payment and upload screenshot below')
  }

  if (!mounted) {
    return null
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose(false)
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isOpen ? 1 : 0, scale: isOpen ? 1 : 0.95 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-[700px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <button
            onClick={() => requestClose(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="text-2xl" />
          </button>
          <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
          <p className="text-white/90">Complete your registration</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaUser className="text-blue-500" />
              Personal Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email ID *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emergency Contact Number *
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Emergency contact number"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your state"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaGraduationCap className="text-purple-500" />
              Academic Information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student ID / Roll Number *
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your roll number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  College Name *
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your college name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              {/* Graduation Year - Only show if Graduate is selected */}
              {formData.year === 'Graduate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year of Graduation *
                  </label>
                  <input
                    type="text"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    placeholder="e.g. 2023"
                    maxLength={4}
                    required={formData.year === 'Graduate'}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaInfoCircle className="text-green-500" />
              Preferences
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Hide certificate option for TEDxKPRIT */}
              {event.id !== 'tedxkprit-2025' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Do you prefer a certificate? *
                  </label>
                  <select
                    name="wantCertificate"
                    value={formData.wantCertificate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes (₹50)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Do you want transport? *
                </label>
                <select
                  name="wantTransport"
                  value={formData.wantTransport}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How did you know about this event? *
                </label>
                <select
                  name="hearAboutEvent"
                  value={formData.hearAboutEvent}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Facebook">Facebook</option>
                  <option value="matriXO">matriXO</option>
                  <option value="Friend">Friend/Word of mouth</option>
                  <option value="College">College/Professor</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaInfoCircle className="text-orange-500" />
              Payment
            </h3>

            <div className="glass-card p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200 dark:border-orange-700">
              <div className="space-y-4">
                {/* Mobile: Show Both QR Code and Pay Now Button */}
                {isMobile ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full">
                      <p className="text-lg font-bold text-gray-900 dark:text-white text-center">Ticket Price: ₹{ticket.price}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Choose your payment method</p>
                    </div>

                    {/* Pay Now Button */}
                    <button
                      type="button"
                      onClick={handlePaymentClick}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600
                               text-white rounded-lg font-semibold shadow-lg text-lg
                               hover:shadow-xl transform hover:scale-105 transition-all
                               flex items-center justify-center gap-2"
                    >
                      <span>💳</span> Pay Now ₹{ticket.price}
                    </button>

                    <div className="w-full text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        OR scan QR code below
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <Image
                        src="/payment-qr.jpg"
                        alt="Payment QR Code"
                        width={180}
                        height={180}
                        className="rounded-lg"
                        priority
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Scan with any UPI app
                      (Google Pay, PhonePe, Paytm, etc.)
                    </p>
                  </div>
                ) : (
                  /* Desktop: Show QR Code */
                  <div className="flex flex-col items-center space-y-4">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white text-center">Ticket Price: ₹{ticket.price}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Scan QR code to pay via UPI</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <Image
                        src="/payment-qr.jpg"
                        alt="Payment QR Code"
                        width={200}
                        height={200}
                        className="rounded-lg"
                        priority
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)
                    </p>
                  </div>
                )}

                <div className="border-t border-orange-300 dark:border-orange-700 pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Payment Screenshot (Transaction Number Should Be  Visible For Verification)*
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600
                               text-gray-700 dark:text-gray-300 rounded-lg font-medium
                               hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                               flex items-center gap-2"
                    >
                      <FaUpload />
                      Choose File
                    </button>
                    {paymentScreenshot && (
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                        ✓ {paymentScreenshot.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    After making payment, please upload the screenshot here (Max 5MB, image only)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => requestClose(false)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600
                       text-gray-700 dark:text-gray-300 rounded-lg font-semibold
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600
                       text-white rounded-lg font-semibold shadow-lg
                       hover:shadow-xl transform hover:scale-105 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
