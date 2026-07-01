'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGoogle, FaArrowRight, FaShieldAlt, FaBolt, FaLock, FaCheckCircle, FaSignOutAlt, FaEnvelope } from 'react-icons/fa'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { toast } from 'sonner'
import { signInWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth'
import { auth, firebaseReady } from '@/lib/firebaseConfig'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const [isLogin, setIsLogin] = useState(mode !== 'register')
  const requestedReturnUrl = searchParams.get('returnUrl')
  const returnUrl = requestedReturnUrl?.startsWith('/') ? requestedReturnUrl : '/'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  
  const router = useRouter()
  const { user, signIn, signUp, signInWithGoogle, logout } = useAuth()

  // Keep login/register mode in sync with URL aliases (/login, /register)
  useEffect(() => {
    setIsLogin(mode !== 'register')
  }, [mode])

  // If user is already logged in and came from a returnUrl, redirect them
  useEffect(() => {
    if (user && returnUrl !== '/') {
      router.push(returnUrl)
    }
  }, [user, returnUrl, router])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return
    setLoading(true)
    try {
      if (!firebaseReady || !auth) {
        toast.error('Authentication is not configured. Please try again later.')
        return
      }
      // Sign in temporarily to resend verification
      const userCredential = await signInWithEmailAndPassword(auth, verificationEmail, formData.password)
      await sendEmailVerification(userCredential.user)
      await signOut(auth)
      toast.success('Verification email resent! Check your inbox.')
      setResendCooldown(60)
    } catch (error: any) {
      toast.error('Failed to resend verification email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
        toast.success('Welcome back!')
        router.push(returnUrl)
      } else {
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
        await signUp(formData.email, formData.password, formData.name)
        setVerificationEmail(formData.email)
        setShowVerification(true)
        setResendCooldown(60)
        toast.success('Account created! Please check your email to verify.')
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
      } else if (error.code === 'auth/email-not-verified') {
        setVerificationEmail(formData.email)
        setShowVerification(true)
        setResendCooldown(60)
        toast.info('Please verify your email to continue.')
      } else {
        toast.error(error.message || 'Authentication failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      if (!firebaseReady) {
        toast.error('Authentication is not configured. Please try again later.')
        return
      }
      const signInMethod = await signInWithGoogle()
      if (signInMethod === 'redirect') {
        return
      }
      toast.success('Signed in successfully!')
      router.push(returnUrl)
    } catch (error: any) {
      const code = error?.code || 'unknown'
      const message = error?.message || 'Unknown Google auth error'
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'unknown-host'
      const isBetaHost = currentHost === 'beta.matrixo.in'

      console.error('Google Auth Error:', {
        code,
        message,
        currentHost,
        customData: error?.customData || null
      })
      
      if (code === 'auth/popup-closed-by-user') {
        toast.info('Sign-in cancelled')
        return
      }
      
      if (code === 'auth/popup-blocked') {
        toast.error('Popup blocked! Please allow popups.')
      } else if (code === 'auth/unauthorized-domain') {
        toast.error(`Domain "${currentHost}" is not authorized for Google sign-in.`)
      } else if (code === 'auth/operation-not-allowed') {
        toast.error('Google sign-in is not enabled in Firebase Authentication.')
      } else if (code === 'auth/invalid-api-key') {
        toast.error('Invalid Firebase API key. Check beta environment variables.')
      } else if (code === 'auth/network-request-failed') {
        toast.error('Network error during Google sign-in. Check HTTPS/connection and retry.')
      } else {
        const fallbackMessage = message.replace(/^Firebase:\s*/i, '').split(' (auth/')[0]
        toast.error(isBetaHost ? `${fallbackMessage} (${code})` : fallbackMessage)
      }
      return
    } finally {
      setLoading(false)
    }
  }



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-900 dark:text-white relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="relative z-10 flex items-start sm:items-center justify-center min-h-[100dvh] px-3 sm:px-6 lg:px-8 py-[max(1rem,env(safe-area-inset-top))] sm:py-20">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-start sm:items-center">
          
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
                  Experience
                </h1>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent pb-1 leading-tight">
                  Personalized Learning
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
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Enterprise Security</h3>
                  <p className="text-gray-600 dark:text-gray-400">End-to-end encryption & data protection</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 transition-colors">
                  <FaBolt className="text-2xl text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Lightning Fast</h3>
                  <p className="text-gray-600 dark:text-gray-400">Instant access to all platform features</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-colors">
                  <FaLock className="text-2xl text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy First</h3>
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
            <div className="glass-card-elevated p-4 sm:p-6 lg:p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-6 sm:mb-8 flex justify-center relative h-10 sm:h-12">
                {/* Light Mode Logo (Black) */}
                <img 
                  src="/logos/logo-light.png" 
                  alt="matriXO Logo" 
                  className="h-10 sm:h-12 w-auto object-contain dark:hidden"
                />
                {/* Dark Mode Logo (White) */}
                <img 
                  src="/logos/logo-dark.png" 
                  alt="matriXO Logo" 
                  className="h-10 sm:h-12 w-auto object-contain hidden dark:block"
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
                      Welcome back!
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
                      <button className="w-full py-3 px-5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
                        <span>Go to Home</span>
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                    <button
                      onClick={async () => { await logout(); toast.success('Signed out successfully') }}
                      className="w-full py-3 px-5 border border-gray-200/30 dark:border-white/[0.06] text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/40 dark:hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
                    >
                      <FaSignOutAlt />
                      <span>Sign out & use another account</span>
                    </button>
                  </div>
                </div>
              ) : showVerification ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
                    <FaEnvelope className="text-4xl text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Verify Your Email
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      We&apos;ve sent a verification link to
                    </p>
                    <p className="font-semibold text-blue-500 text-lg">
                      {verificationEmail}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Steps to verify:</strong>
                    </p>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-decimal list-inside">
                      <li>Check your inbox (and spam folder)</li>
                      <li>Click the verification link in the email</li>
                      <li>Come back here and sign in</li>
                    </ol>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleResendVerification}
                      disabled={loading || resendCooldown > 0}
                      className="w-full py-3 px-5 border border-gray-200/30 dark:border-white/[0.06] text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-white/40 dark:hover:bg-white/[0.06] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend Verification Email'}
                    </button>
                    <button
                      onClick={() => {
                        setShowVerification(false)
                        setIsLogin(true)
                      }}
                      className="w-full py-3 px-5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                    >
                      <span>Go to Sign In</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
              <>

              {/* Tab Switcher */}
              <div className="flex gap-2 mb-6 p-1 bg-white/40 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-white/[0.06]">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 px-5 rounded-lg font-medium transition-all ${
                    isLogin
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 px-5 rounded-lg font-medium transition-all ${
                    !isLogin
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-2.5 mb-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-5 bg-white/80 dark:bg-white/90 text-gray-900 rounded-xl font-semibold hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg backdrop-blur-sm"
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
                  <span className="px-4 bg-white/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-500">Or continue with</span>
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
                        className="w-full py-3 px-5 glass-input placeholder-gray-500 dark:placeholder-gray-500"
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
                  className="w-full py-3 px-5 glass-input placeholder-gray-500 dark:placeholder-gray-500"
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full py-3 px-5 glass-input placeholder-gray-500 dark:placeholder-gray-500"
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
                        className="w-full py-3 px-5 glass-input placeholder-gray-500 dark:placeholder-gray-500"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLogin && (
                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
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
                <Link href="/terms" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300">
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300">
                  Privacy Policy
                </Link>
              </div>
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
