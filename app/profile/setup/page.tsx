'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaUniversity, FaGraduationCap, FaCodeBranch, FaArrowRight, FaSpinner, FaAt, FaCheck, FaTimes, FaCamera } from 'react-icons/fa'
import { useAuth } from '@/lib/AuthContext'
import { useProfile, DEFAULT_PRIVACY } from '@/lib/ProfileContext'
import { LocationSelection, LocationSelectionState } from '@/components/location/LocationSelection'
import { toast } from 'sonner'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { compressImage } from '@/lib/imageUtils'
import { storage } from '@/lib/firebaseConfig'
import Image from 'next/image'

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']
const BRANCH_OPTIONS = [
  'CSE', 'CSE (AIML)', 'CSE (DS)', 'CSE (CS)', 'CSE (IoT)',
  'AIML', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'Other'
]

export default function ProfileSetupPage() {
  const { user } = useAuth()
  const { createProfile, profileExists, checkUsernameAvailable } = useProfile()
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    username: '',
    rollNumber: '',
    phone: '',
    year: '',
    branch: '',
    graduationYear: '',
    bio: '',
  })
  const [location, setLocation] = useState<LocationSelectionState>({
    country: '',
    state: '',
    district: '',
    collegeId: '',
    collegeName: '',
  })
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [step, setStep] = useState(1)

  const redirectTarget = profileExists ? '/' : (!user ? '/auth' : null)

  useEffect(() => {
    if (redirectTarget) return

    const username = formData.username.trim().toLowerCase()
    if (!username || username.length < 3) {
      setUsernameStatus('idle')
      return
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailable(username)
      setUsernameStatus(available ? 'available' : 'taken')
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.username, checkUsernameAvailable, redirectTarget])

  useEffect(() => {
    if (!redirectTarget) return
    router.replace(redirectTarget)
  }, [redirectTarget, router])

  if (redirectTarget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-3xl text-purple-500" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">Redirecting...</p>
        </div>
      </div>
    )
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Photo must be less than 10MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    try {
      // Compress image client-side before storing
      const compressedBlob = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.85 })
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' })
      setProfilePhotoFile(compressedFile)
      const reader = new FileReader()
      reader.onloadend = () => setProfilePhotoPreview(reader.result as string)
      reader.readAsDataURL(compressedBlob)
    } catch {
      toast.error('Failed to process image. Please try another photo.')
    }
  }

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {}
    const username = formData.username.trim().toLowerCase()

    if (!username) newErrors.username = 'Username is required'
    else if (username.length < 3) newErrors.username = 'Username must be at least 3 characters'
    else if (!/^[a-z0-9_]+$/.test(username)) newErrors.username = 'Only lowercase letters, numbers, and underscores'
    else if (usernameStatus === 'taken') newErrors.username = 'Username is already taken'
    else if (usernameStatus === 'checking') newErrors.username = 'Please wait while we check availability'

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required'
    else if (formData.rollNumber.trim().length < 4) newErrors.rollNumber = 'Roll number is too short'

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) newErrors.phone = 'Enter a valid 10-digit phone number'

    if (!location.collegeId) newErrors.college = 'Please select your college'
    if (!formData.year) newErrors.year = 'Select your year'
    if (formData.year === 'Graduate' && !formData.graduationYear.trim()) {
      newErrors.graduationYear = 'Graduation year is required'
    } else if (formData.year === 'Graduate' && formData.graduationYear.trim()) {
      const year = parseInt(formData.graduationYear.trim())
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 1950 || year > currentYear) {
        newErrors.graduationYear = `Enter a valid year (1950-${currentYear})`
      }
    }
    if (!formData.branch) newErrors.branch = 'Select your branch'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
      setErrors({})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return

    setLoading(true)
    try {
      let profilePhotoUrl = ''

      if (profilePhotoFile && user) {
        const photoRef = ref(storage, `profile-photos/${user.uid}`)
        await uploadBytes(photoRef, profilePhotoFile, { contentType: 'image/jpeg' })
        profilePhotoUrl = await getDownloadURL(photoRef)
      }

      await createProfile({
        username: formData.username.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        phone: formData.phone.trim(),
        collegeId: location.collegeId,
        year: formData.year,
        branch: formData.branch,
        graduationYear: formData.year === 'Graduate' ? formData.graduationYear.trim() : '',
        bio: formData.bio.trim(),
        profilePhoto: profilePhotoUrl || undefined,
        privacy: DEFAULT_PRIVACY,
      })
      toast.success('Profile created successfully!')
      router.push('/')
    } catch (error: any) {
      console.error('Profile creation error:', error)
      toast.error(error.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const inputClass = (field: string) =>
    `w-full py-3 px-4 bg-white/5 dark:bg-white/[0.06] border ${errors[field] ? 'border-red-500' : 'border-white/10 dark:border-white/[0.1]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500`

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-950 dark:to-black flex items-center justify-center px-4 py-24">
      {/* BG decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-32 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="rounded-3xl p-5 sm:p-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          <div className="h-1 -mx-5 sm:-mx-8 -mt-5 sm:-mt-8 mb-5 sm:mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 dark:bg-white/[0.06] text-gray-500'}`}>1</div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-white/10 dark:bg-white/[0.08]'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 dark:bg-white/[0.06] text-gray-500'}`}>2</div>
          </div>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {step === 1 ? 'Create Your Identity' : 'Academic Details'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {step === 1 ? 'Choose your username and set up your profile' : 'Tell us about your education'}
            </p>
          </div>

          {step === 1 ? (
            <div className="space-y-5">
              {/* Profile Photo */}
              <div className="flex flex-col items-center mb-2">
                <label htmlFor="photo-upload" className="cursor-pointer group">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-white/20 dark:border-white/[0.12] group-hover:border-blue-400/50 dark:group-hover:border-blue-400/30 transition-colors">
                    {profilePhotoPreview ? (
                      <Image src={profilePhotoPreview} alt="Profile" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 dark:bg-white/[0.04] bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                        <FaCamera className="text-gray-400 text-lg mb-1" />
                        <span className="text-[10px] text-gray-400">Add Photo</span>
                      </div>
                    )}
                  </div>
                </label>
                <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
                <p className="text-xs text-gray-400 mt-2">Optional · Max 2MB</p>
              </div>

              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <FaAt className="text-blue-400 text-xs" /> Username
                </label>
                <div className="relative">
                  <input
                    type="text" name="username" value={formData.username} onChange={handleChange}
                    placeholder="choose_a_username"
                    className={`${inputClass('username')} pr-10 lowercase`}
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && <FaSpinner className="animate-spin text-gray-400 text-sm" />}
                    {usernameStatus === 'available' && <FaCheck className="text-green-500 text-sm" />}
                    {usernameStatus === 'taken' && <FaTimes className="text-red-500 text-sm" />}
                  </div>
                </div>
                {errors.username ? (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                ) : usernameStatus === 'available' ? (
                  <p className="text-green-500 text-xs mt-1">Username is available!</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">Lowercase letters, numbers, underscores. Min 3 characters.</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <FaUser className="text-blue-400 text-xs" /> Full Name
                </label>
                <input
                  type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                  placeholder="Enter your full name"
                  className={inputClass('fullName')}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* Bio */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <FaUser className="text-blue-400 text-xs" /> Bio <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </label>
                <textarea
                  name="bio" value={formData.bio} onChange={handleChange}
                  placeholder="A short bio about yourself..."
                  rows={2}
                  maxLength={200}
                  className={`${inputClass('bio')} resize-none`}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{formData.bio.length}/200</p>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <FaEnvelope className="text-blue-400 text-xs" /> Email
                </label>
                <input
                  type="email" value={user?.email || ''} readOnly
                  className="w-full py-3 px-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Linked to your account</p>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-2"
              >
                <span>Continue</span>
                <FaArrowRight className="text-sm" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Roll Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <FaIdCard className="text-blue-400 text-xs" /> Roll Number
                </label>
                <input
                  type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange}
                  placeholder="e.g. 22B81A0501"
                  className={`${inputClass('rollNumber')} uppercase`}
                />
                {errors.rollNumber && <p className="text-red-500 text-xs mt-1">{errors.rollNumber}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <FaPhone className="text-blue-400 text-xs" /> Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-white/5 dark:bg-white/[0.06] border border-r-0 border-white/10 dark:border-white/[0.1] rounded-l-xl text-gray-500 text-sm">+91</span>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="9876543210" maxLength={10}
                    className={`w-full py-3 px-4 bg-white/5 dark:bg-white/[0.06] border ${errors.phone ? 'border-red-500' : 'border-white/10 dark:border-white/[0.1]'} rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Location & College Selection */}
              <div>
                <LocationSelection
                  value={location}
                  onChange={setLocation}
                  disabled={loading}
                />
                {errors.college && <p className="text-red-500 text-xs mt-1">{errors.college}</p>}
              </div>

              {/* Year & Branch */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <FaGraduationCap className="text-blue-400 text-xs" /> Year
                  </label>
                  <select
                    name="year" value={formData.year} onChange={handleChange}
                    className={`${inputClass('year')} appearance-none`}
                  >
                    <option value="">Select</option>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <FaCodeBranch className="text-blue-400 text-xs" /> Branch
                  </label>
                  <select
                    name="branch" value={formData.branch} onChange={handleChange}
                    className={`${inputClass('branch')} appearance-none`}
                  >
                    <option value="">Select</option>
                    {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch}</p>}
                </div>
              </div>

              {/* Graduation Year */}
              {formData.year === 'Graduate' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <FaGraduationCap className="text-blue-400 text-xs" /> Year of Graduation
                  </label>
                  <input
                    type="text" name="graduationYear" value={formData.graduationYear} onChange={handleChange}
                    placeholder="e.g. 2023" maxLength={4}
                    className={inputClass('graduationYear')}
                  />
                  {errors.graduationYear && <p className="text-red-500 text-xs mt-1">{errors.graduationYear}</p>}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrors({}) }}
                  className="flex-1 py-3 px-4 border border-white/10 dark:border-white/[0.1] text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit" disabled={loading}
                  className="flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin text-xl" />
                  ) : (
                    <>
                      <span>Create Profile</span>
                      <FaArrowRight className="text-sm" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
