'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGoogle, FaArrowRight, FaShieldAlt, FaBolt, FaLock, FaCheckCircle, FaSignOutAlt, FaArrowLeft, FaEnvelope } from 'react-icons/fa'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { consumeRedirectAfterLogin, syncLegacyReturnUrl } from '@/lib/authRedirect'
import { toast } from 'sonner'
import HeadingHighlight from '@/components/HeadingHighlight'

type AuthStep = 'form' | 'otp'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [authStep, setAuthStep] = useState<AuthStep>('form')
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const hasRedirectedRef = useRef(false)
  
  const router = useRouter()
  const { user, signIn, signUp, signInWithGoogle, logout } = useAuth()

  useEffect(() => {
    syncLegacyReturnUrl(returnUrl)
  }, [returnUrl])

  const redirectToStoredDestination = useCallback(() => {
    if (hasRedirectedRef.current) {
      return
    }

    hasRedirectedRef.current = true
    router.replace(consumeRedirectAfterLogin() || '/')
  }, [router])

  // If user is already logged in, continue to their stored destination
  useEffect(() => {
    if (user) {
      redirectToStoredDestination()
    }
  }, [user, redirectToStoredDestination])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const sendOTP = async (email: string) => {
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'send' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
      return true
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code')
      return false
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'verify', otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      return true
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
        toast.success('Welcome back!')
        redirectToStoredDestination()
      } else {
        // Signup flow - validate first
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          setLoading(false)
          return
        }
        if (formData.password.length < 6) {
          toast.error('Password should be at least 6 characters')
          setLoading(false)
          return
        }

        // Send OTP before creating account
        const sent = await sendOTP(formData.email)
        if (sent) {
          setAuthStep('otp')
          setResendTimer(60)
          toast.success('Verification code sent to your email!')
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address')
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Invalid email or password')
      } else {
        toast.error(error.message || 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async () => {
    const otp = otpValues.join('')
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setOtpLoading(true)
    try {
      const verified = await verifyOTP(formData.email, otp)
      if (verified) {
        // OTP verified - now create the account
        await signUp(formData.email, formData.password, formData.name)
        toast.success('Account created successfully!')
        redirectToStoredDestination()
      }
    } catch (error: any) {
      console.error('OTP/Signup error:', error)
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Please sign in instead.')
        setAuthStep('form')
        setIsLogin(true)
      } else {
        toast.error(error.message || 'Failed to create account')
      }
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    setOtpLoading(true)
    const sent = await sendOTP(formData.email)
    if (sent) {
      setOtpValues(['', '', '', '', '', ''])
      setResendTimer(60)
      toast.success('New verification code sent!')
    }
    setOtpLoading(false)
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6)
      const newValues = [...otpValues]
      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newValues[index + i] = digits[i]
      }
      setOtpValues(newValues)
      const nextIdx = Math.min(index + digits.length, 5)
      otpRefs.current[nextIdx]?.focus()
      return
    }

    if (value && !/^\d$/.test(value)) return

    const newValues = [...otpValues]
    newValues[index] = value
    setOtpValues(newValues)

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter' && otpValues.join('').length === 6) {
      handleOTPSubmit()
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
      toast.success('Signed in successfully!')
      redirectToStoredDestination()
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      setLoading(false)
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Sign-in cancelled')
        return
      }
      
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked! Please allow popups.')
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('Domain not authorized in Firebase Console.')
      } else {
        toast.error('Google sign-in failed.')
      }
      return
    }
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-900 dark:text-white relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
          
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left space-y-6 hidden lg:block"
          >
            <div className="space-y-4">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  <HeadingHighlight text="Experience" />
                </h1>
                <h2 className="text-5xl font-bold pb-1 leading-tight">
                  <HeadingHighlight text="Personalized Learning" />
                </h2>
              </div>
              <p className="text-2xl font-light text-gray-600 dark:text-gray-300">
                Vision Platform for Next-Gen Education
              </p>
            </div>

            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                  <FaShieldAlt className="text-2xl text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    <HeadingHighlight text="Enterprise Security" />
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">End-to-end encryption & data protection</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
                  <FaBolt className="text-2xl text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    <HeadingHighlight text="Lightning Fast" />
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Instant access to all platform features</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
                  <FaLock className="text-2xl text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    <HeadingHighlight text="Privacy First" />
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Your data, your control, always</p>
                </div>
              </div>
            </div>

            <div className="pt-8 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
              <span>Trusted by 10,000+ students</span>
              <span>•</span>
              <span>500+ institutions</span>
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <div className="rounded-2xl bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-white/[0.08] shadow-sm p-6 lg:p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-8 flex justify-center relative h-12">
                {/* Light Mode Logo (Black) */}
                <img 
                  src="/logos/logo-light.png" 
                  alt="matriXO Logo" 
                  className="h-12 w-auto object-contain dark:hidden"
                />
                {/* Dark Mode Logo (White) */}
                <img 
                  src="/logos/logo-dark.png" 
                  alt="matriXO Logo" 
                  className="h-12 w-auto object-contain hidden dark:block"
                />
              </div>

              {/* Already Logged In State */}
              {user ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                    <FaCheckCircle className="text-3xl text-green-500" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        <HeadingHighlight
                          text="Welcome back!"
                          solidClassName="text-gray-900 dark:text-white"
                          gradientClassName="text-gray-900 dark:text-white"
                        />
                      </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      You&apos;re already signed in as
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">
                      {user.displayName || user.email}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Link href="/">
                      <button className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 group">
                        <span>Go to Home</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    <button
                      onClick={async () => { await logout(); toast.success('Signed out successfully') }}
                      className="w-full py-3 px-5 border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-2"
                    >
                      <FaSignOutAlt />
                      <span>Sign out & use another account</span>
                    </button>
                  </div>
                </div>
              ) : (
              <>

              {/* Tab Switcher */}
              {authStep === 'form' && (
              <div className="flex gap-2 mb-6 p-1 bg-transparent rounded-xl border border-gray-200 dark:border-white/[0.08]">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 px-5 rounded-lg font-medium transition-colors duration-200 ${
                    isLogin
                      ? 'bg-white text-blue-600 font-semibold'
                      : 'bg-transparent text-gray-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 px-5 rounded-lg font-medium transition-colors duration-200 ${
                    !isLogin
                      ? 'bg-white text-blue-600 font-semibold'
                      : 'bg-transparent text-gray-400'
                  }`}
                >
                  Sign Up
                </button>
              </div>
              )}

              {/* OTP Verification Step */}
              {authStep === 'otp' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <button
                    onClick={() => { setAuthStep('form'); setOtpValues(['', '', '', '', '', '']) }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <FaArrowLeft className="text-xs" /> Back
                  </button>

                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
                      <FaEnvelope className="text-2xl text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      <HeadingHighlight
                        text="Verify Your Email"
                        solidClassName="text-gray-900 dark:text-white"
                        gradientClassName="text-gray-900 dark:text-white"
                      />
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We&apos;ve sent a 6-digit verification code to
                    </p>
                    <p className="font-semibold text-blue-600">{formData.email}</p>
                  </div>

                  {/* OTP Input */}
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={val}
                        onChange={(e) => handleOTPChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(idx, e)}
                        onPaste={(e) => {
                          e.preventDefault()
                          const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                          handleOTPChange(0, paste)
                        }}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl bg-slate-100 text-gray-900 border border-transparent focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleOTPSubmit}
                    disabled={otpLoading || otpValues.join('').length !== 6}
                  className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {otpLoading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FaCheckCircle />
                        <span>Verify & Create Account</span>
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Didn&apos;t receive the code?{' '}
                      {resendTimer > 0 ? (
                        <span className="text-gray-400">Resend in {resendTimer}s</span>
                      ) : (
                        <button
                          onClick={handleResendOTP}
                          disabled={otpLoading}
                          className="text-blue-600 hover:underline font-medium transition-colors disabled:opacity-50"
                        >
                          Resend Code
                        </button>
                      )}
                    </p>
                  </div>
                </motion.div>
              ) : (
              <>

              {/* OAuth Buttons */}
              <div className="space-y-2.5 mb-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-5 bg-white text-gray-900 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaGoogle className="text-xl" />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200/30 dark:border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-[#0B1220] text-gray-500 dark:text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full py-3 px-5 rounded-xl bg-slate-100 text-gray-900 placeholder-gray-500 border border-transparent focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full py-3 px-5 rounded-xl bg-slate-100 text-gray-900 placeholder-gray-500 border border-transparent focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors"
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full py-3 px-5 rounded-xl bg-slate-100 text-gray-900 placeholder-gray-500 border border-transparent focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors"
                />

                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required={!isLogin}
                        className="w-full py-3 px-5 rounded-xl bg-slate-100 text-gray-900 placeholder-gray-500 border border-transparent focus:border-blue-600 focus:outline-none focus:ring-0 transition-colors"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLogin && (
                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-sm text-blue-400 hover:underline transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </div>
              </>
              )}
              </>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
