'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaUser, FaIdCard, FaPhone, FaEnvelope, FaUniversity,
  FaGraduationCap, FaCodeBranch, FaEdit, FaSave, FaTimes, FaSpinner,
  FaArrowLeft, FaShieldAlt, FaShareAlt, FaCamera, FaCopy, FaCheck,
  FaLinkedin, FaGithub, FaGlobe, FaLink, FaEye, FaEyeSlash
} from 'react-icons/fa'
import { useAuth } from '@/lib/AuthContext'
import { useProfile, DEFAULT_PRIVACY, PrivacySettings } from '@/lib/ProfileContext'
import { toast } from 'sonner'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebaseConfig'
import Link from 'next/link'
import Image from 'next/image'
import ImageCropModal from '@/components/shared/ImageCropModal'
import { getCollegeName } from '@/lib/colleges'
import { LocationSelection, LocationSelectionState } from '@/components/location/LocationSelection'
import FeatureSidebar from '@/components/features/FeatureSidebar'
import { storeRedirectAfterLogin } from '@/lib/authRedirect'

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']
const BRANCH_OPTIONS = [
  'CSE', 'CSE (AIML)', 'CSE (DS)', 'CSE (CS)', 'CSE (IoT)',
  'AIML', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'Other'
]

type Tab = 'profile' | 'privacy' | 'share'

// Glass card styles matching employee portal
const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
}

const glassCardLight: React.CSSProperties = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  border: '1px solid rgba(0,0,0,0.06)',
  boxShadow: '0 16px 48px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, loading: profileLoading, profileExists, updateProfile, setUsername, checkUsernameAvailable } = useProfile()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [isDark, setIsDark] = useState(false)
  
  // Crop modal states
  const [photoCropModalOpen, setPhotoCropModalOpen] = useState(false)
  const [coverCropModalOpen, setCoverCropModalOpen] = useState(false)
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null)
  const [tempCoverUrl, setTempCoverUrl] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    fullName: '', phone: '', year: '', branch: '',
    graduationYear: '', bio: '', linkedin: '', github: '', portfolio: '',
  })
  const [location, setLocation] = useState<LocationSelectionState>({
    country: '',
    state: '',
    district: '',
    collegeId: '',
    collegeName: '',
  })
  const [privacyData, setPrivacyData] = useState<PrivacySettings>(DEFAULT_PRIVACY)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Username editing state
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [savingUsername, setSavingUsername] = useState(false)
  const wrapWithSidebar = (content: JSX.Element) => (
    <FeatureSidebar>{content}</FeatureSidebar>
  )

  // Detect dark mode
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (profile) {
      setEditData({
        fullName: profile.fullName, phone: profile.phone,
        year: profile.year, branch: profile.branch,
        graduationYear: profile.graduationYear || '', bio: profile.bio || '',
        linkedin: profile.linkedin || '', github: profile.github || '', portfolio: profile.portfolio || '',
      })
      setPrivacyData(profile.privacy || DEFAULT_PRIVACY)
      setNewUsername(profile.username || '')

      // Reverse-resolve college location for the LocationSelection component
      if (profile.collegeId) {
        fetch(`/api/locations/college-lookup?id=${profile.collegeId}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              setLocation({
                country: data.country || '',
                state: data.state || '',
                district: data.district || '',
                collegeId: data.id || profile.collegeId || '',
                collegeName: data.name || '',
              })
            }
          })
          .catch(() => {
            // Fallback: just set the collegeId without location hierarchy
            setLocation(prev => ({ ...prev, collegeId: profile.collegeId || '' }))
          })
      }
    }
  }, [profile])

  // Username availability check
  useEffect(() => {
    if (!editingUsername) return
    const uname = newUsername.trim().toLowerCase()
    if (!uname || uname.length < 3 || !/^[a-z0-9_]+$/.test(uname)) { setUsernameStatus('idle'); return }
    if (profile?.username && uname === profile.username.toLowerCase()) { setUsernameStatus('available'); return }
    setUsernameStatus('checking')
    const timer = setTimeout(async () => {
      const ok = await checkUsernameAvailable(uname)
      setUsernameStatus(ok ? 'available' : 'taken')
    }, 500)
    return () => clearTimeout(timer)
  }, [newUsername, editingUsername, checkUsernameAvailable, profile?.username])

  const handleSaveUsername = async () => {
    const uname = newUsername.trim().toLowerCase()
    if (!uname || uname.length < 3) { toast.error('Username must be at least 3 characters'); return }
    if (!/^[a-z0-9_]+$/.test(uname)) { toast.error('Only lowercase letters, numbers, and underscores'); return }
    if (usernameStatus !== 'available') { toast.error('Choose an available username'); return }
    if (profile?.username && uname === profile.username.toLowerCase()) { setEditingUsername(false); return }
    setSavingUsername(true)
    try {
      await setUsername(uname)
      toast.success('Username updated!')
      setEditingUsername(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to set username')
    } finally { setSavingUsername(false) }
  }

  if (!user) {
    return wrapWithSidebar(
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-2xl">
            <FaShieldAlt />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to view and edit your profile.</p>
          <Link
            href="/auth"
            onClick={() => storeRedirectAfterLogin('/profile')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all w-full"
          >
            <FaUser /> Continue to sign in
          </Link>
        </motion.div>
      </div>
    )
  }

  if (profileLoading) {
    return wrapWithSidebar(
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-400" />
      </div>
    )
  }

  if (!profileExists) {
    router.replace('/profile/setup')
    return wrapWithSidebar(
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-3xl text-purple-500" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">Redirecting to profile setup...</p>
        </div>
      </div>
    )
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!editData.fullName.trim()) e.fullName = 'Required'
    if (!editData.phone.trim()) e.phone = 'Required'
    else if (!/^[6-9]\d{9}$/.test(editData.phone.trim())) e.phone = 'Enter valid 10-digit number'
    if (!location.collegeId) e.college = 'Please select your college'
    if (!editData.year) e.year = 'Required'
    if (!editData.branch) e.branch = 'Required'
    if (editData.year === 'Graduate' && !editData.graduationYear.trim()) e.graduationYear = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await updateProfile({
        fullName: editData.fullName.trim(), phone: editData.phone.trim(),
        collegeId: location.collegeId, year: editData.year, branch: editData.branch,
        graduationYear: editData.year === 'Graduate' ? editData.graduationYear.trim() : '',
        bio: editData.bio.trim(), linkedin: editData.linkedin.trim(),
        github: editData.github.trim(), portfolio: editData.portfolio.trim(),
      })
      toast.success('Profile updated!')
      setIsEditing(false)
    } catch (err: any) { toast.error(err.message || 'Failed to update') } finally { setSaving(false) }
  }

  const handleSavePrivacy = async () => {
    setSaving(true)
    try {
      await updateProfile({ privacy: privacyData })
      toast.success('Privacy settings updated!')
    } catch (err: any) { toast.error(err.message || 'Failed') } finally { setSaving(false) }
  }

  const handleCancel = () => {
    if (profile) {
      setEditData({
        fullName: profile.fullName, phone: profile.phone,
        year: profile.year, branch: profile.branch, graduationYear: profile.graduationYear || '',
        bio: profile.bio || '', linkedin: profile.linkedin || '',
        github: profile.github || '', portfolio: profile.portfolio || '',
      })
      // Re-resolve location from profile
      if (profile.collegeId) {
        fetch(`/api/locations/college-lookup?id=${profile.collegeId}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              setLocation({
                country: data.country || '',
                state: data.state || '',
                district: data.district || '',
                collegeId: data.id || profile.collegeId || '',
                collegeName: data.name || '',
              })
            }
          })
          .catch(() => {})
      }
    }
    setErrors({})
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be <5MB'); return }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    
    // Open crop modal
    const objectUrl = URL.createObjectURL(file)
    setTempPhotoUrl(objectUrl)
    setPhotoCropModalOpen(true)
    
    // Reset input
    e.target.value = ''
  }

  const handlePhotoCropComplete = async (croppedBlob: Blob) => {
    if (!user) return
    setUploadingPhoto(true)
    try {
      const photoRef = ref(storage, `profile-photos/${user.uid}.jpg`)
      const metadata = { contentType: 'image/jpeg' }
      await uploadBytes(photoRef, croppedBlob, metadata)
      const url = await getDownloadURL(photoRef)
      await updateProfile({ profilePhoto: url })
      toast.success('Profile photo updated!')
    } catch (err) {
      console.error('Photo upload error:', err)
      toast.error('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
      if (tempPhotoUrl) URL.revokeObjectURL(tempPhotoUrl)
      setTempPhotoUrl(null)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Cover photo must be <5MB'); return }
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    
    // Open crop modal
    const objectUrl = URL.createObjectURL(file)
    setTempCoverUrl(objectUrl)
    setCoverCropModalOpen(true)
    
    // Reset input
    e.target.value = ''
  }

  const handleCoverCropComplete = async (croppedBlob: Blob) => {
    if (!user) return
    setUploadingCover(true)
    try {
      const coverRef = ref(storage, `cover-photos/${user.uid}.jpg`)
      const metadata = { contentType: 'image/jpeg' }
      await uploadBytes(coverRef, croppedBlob, metadata)
      const url = await getDownloadURL(coverRef)
      await updateProfile({ coverPhoto: url })
      toast.success('Cover photo updated!')
    } catch (err) {
      console.error('Cover upload error:', err)
      toast.error('Failed to upload cover photo')
    } finally {
      setUploadingCover(false)
      if (tempCoverUrl) URL.revokeObjectURL(tempCoverUrl)
      setTempCoverUrl(null)
    }
  }

  const handleCopyLink = () => {
    if (!profile?.username) { toast.error('Set a username first'); return }
    navigator.clipboard.writeText(`${window.location.origin}/u/${profile.username}`)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const profileUrl = profile?.username
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.username}` : ''

  const cardStyle = isDark ? glassCard : glassCardLight

  const inputCls = (f: string) =>
    `w-full py-3 px-4 bg-white/5 dark:bg-white/[0.06] border ${errors[f] ? 'border-red-500' : 'border-white/10 dark:border-white/[0.1]'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500`

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'privacy', label: 'Privacy', icon: FaShieldAlt },
    { id: 'share', label: 'Share', icon: FaShareAlt },
  ]

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-4 py-4 border-b border-white/[0.06] last:border-0">
      <div className="p-2.5 rounded-xl bg-blue-500/10"><Icon className="text-blue-400 text-sm" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-gray-900 dark:text-white font-medium mt-0.5 truncate">{value || '\u2014'}</p>
      </div>
    </div>
  )

  const PrivacyToggle = ({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-white/10'}`}>
        <span className={`absolute top-0.5 ${checked ? 'left-[22px]' : 'left-0.5'} w-5 h-5 bg-white rounded-full transition-all shadow-sm`} />
      </button>
    </div>
  )

  return wrapWithSidebar(
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-950 dark:to-black px-4 py-24">
      {/* BG decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -left-32 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-32 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
          <FaArrowLeft className="text-sm" /><span>Back</span>
        </Link>

        {/* Header Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl overflow-hidden mb-4" style={cardStyle}>
          {/* Cover Photo */}
          <div className="relative h-32 sm:h-40 overflow-hidden rounded-t-3xl group/cover">
            {profile?.coverPhoto ? (
              <Image src={profile.coverPhoto} alt="Cover" fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-500 to-indigo-600" />
            )}
            <div className="absolute inset-0 bg-black/10" />
            <label htmlFor="cover-upload-profile" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity cursor-pointer">
              {uploadingCover ? (
                <FaSpinner className="animate-spin text-white text-xl" />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium">
                  <FaCamera /> {profile?.coverPhoto ? 'Change Cover' : 'Add Cover Photo'}
                </div>
              )}
              <input id="cover-upload-profile" type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          </div>
          <div className="p-6 sm:p-8 -mt-10 relative">
            <div className="flex items-end gap-5 mb-4">
              {/* Photo - Square with rounded corners */}
              <div className="relative group flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white/5 dark:bg-white/[0.06] border border-white/10 dark:border-white/[0.1]">
                  {profile?.profilePhoto ? (
                    <Image src={profile.profilePhoto} alt={profile.fullName} fill className="object-cover rounded-xl" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-400 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                      {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <label htmlFor="photo-change" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  {uploadingPhoto ? <FaSpinner className="animate-spin text-white" /> : <FaCamera className="text-white" />}
                </label>
                <input id="photo-change" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>

              {/* Name + Username */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{profile?.fullName}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  {editingUsername ? (
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                          <input type="text" value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            className="w-full py-1.5 pl-7 pr-8 bg-white/10 dark:bg-white/[0.08] border border-white/20 dark:border-white/[0.15] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            placeholder="username" autoFocus />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {usernameStatus === 'checking' && <FaSpinner className="animate-spin text-gray-400 text-xs" />}
                            {usernameStatus === 'available' && <FaCheck className="text-green-400 text-xs" />}
                            {usernameStatus === 'taken' && <FaTimes className="text-red-400 text-xs" />}
                          </div>
                        </div>
                        <button onClick={handleSaveUsername} disabled={savingUsername || usernameStatus !== 'available'}
                          className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50">
                          {savingUsername ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                        </button>
                        <button onClick={() => { setEditingUsername(false); setNewUsername(profile?.username || '') }}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                      {usernameStatus === 'taken' && <p className="text-red-400 text-xs mt-1">Username taken</p>}
                      {usernameStatus === 'available' && newUsername !== profile?.username && <p className="text-green-400 text-xs mt-1">Available!</p>}
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-500 text-sm">{profile?.username ? `@${profile.username}` : 'No username set'}</p>
                      <button onClick={() => { setEditingUsername(true); setNewUsername(profile?.username || '') }}
                        className="p-1 rounded-md hover:bg-white/10 transition-colors" title={profile?.username ? 'Change username' : 'Set username'}>
                        <FaEdit className="text-gray-500 hover:text-blue-400 text-xs transition-colors" />
                      </button>
                    </>
                  )}
                </div>
                {profile?.bio && <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{profile.bio}</p>}
              </div>
            </div>

            {/* Social Links */}
            {(profile?.linkedin || profile?.github || profile?.portfolio) && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                {profile?.linkedin && <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 dark:bg-white/[0.06] rounded-lg hover:bg-white/10 transition-colors"><FaLinkedin className="text-blue-400 text-sm" /></a>}
                {profile?.github && <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 dark:bg-white/[0.06] rounded-lg hover:bg-white/10 transition-colors"><FaGithub className="text-gray-400 text-sm" /></a>}
                {profile?.portfolio && <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 dark:bg-white/[0.06] rounded-lg hover:bg-white/10 transition-colors"><FaGlobe className="text-green-400 text-sm" /></a>}
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-4" style={cardStyle}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsEditing(false) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/5'
                }`}>
              <tab.icon className="text-xs" />{tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="rounded-3xl overflow-hidden" style={cardStyle}>

            {activeTab === 'profile' && (
              <div className="p-4 sm:p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"><FaUser className="text-blue-400 text-xs" /> Full Name</label>
                      <input type="text" name="fullName" value={editData.fullName} onChange={handleChange} className={inputCls('fullName')} />
                      {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio <span className="text-gray-500 text-xs font-normal">(optional)</span></label>
                      <textarea name="bio" value={editData.bio} onChange={handleChange} placeholder="A short bio..." rows={2} maxLength={200} className={`${inputCls('bio')} resize-none`} />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"><FaIdCard className="text-blue-400 text-xs" /> Roll Number</label>
                      <input type="text" value={profile?.rollNumber || ''} readOnly className="w-full py-3 px-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-gray-500 cursor-not-allowed" />
                      <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"><FaPhone className="text-blue-400 text-xs" /> Phone</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-white/5 dark:bg-white/[0.06] border border-r-0 border-white/10 dark:border-white/[0.1] rounded-l-xl text-gray-500 text-sm">+91</span>
                        <input type="tel" name="phone" value={editData.phone} onChange={handleChange} maxLength={10}
                          className={`w-full py-3 px-4 bg-white/5 dark:bg-white/[0.06] border ${errors.phone ? 'border-red-500' : 'border-white/10 dark:border-white/[0.1]'} rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-gray-900 dark:text-white`} />
                      </div>
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"><FaEnvelope className="text-blue-400 text-xs" /> Email</label>
                      <input type="email" value={profile?.email || ''} readOnly className="w-full py-3 px-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <LocationSelection
                        value={location}
                        onChange={setLocation}
                        disabled={saving}
                      />
                      {errors.college && <p className="text-red-400 text-xs mt-1">{errors.college}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Year</label>
                        <select name="year" value={editData.year} onChange={handleChange} className={`${inputCls('year')} appearance-none`}>
                          <option value="">Select</option>
                          {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        {errors.year && <p className="text-red-400 text-xs mt-1">{errors.year}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Branch</label>
                        <select name="branch" value={editData.branch} onChange={handleChange} className={`${inputCls('branch')} appearance-none`}>
                          <option value="">Select</option>
                          {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        {errors.branch && <p className="text-red-400 text-xs mt-1">{errors.branch}</p>}
                      </div>
                    </div>
                    {editData.year === 'Graduate' && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Graduation Year</label>
                        <input type="text" name="graduationYear" value={editData.graduationYear} onChange={handleChange} placeholder="e.g. 2023" maxLength={4} className={inputCls('graduationYear')} />
                        {errors.graduationYear && <p className="text-red-400 text-xs mt-1">{errors.graduationYear}</p>}
                      </div>
                    )}
                    <div className="pt-2 border-t border-white/[0.06]">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Social Links</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2"><FaLinkedin className="text-blue-400 text-sm flex-shrink-0" /><input type="url" name="linkedin" value={editData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className={inputCls('linkedin')} /></div>
                        <div className="flex items-center gap-2"><FaGithub className="text-gray-400 text-sm flex-shrink-0" /><input type="url" name="github" value={editData.github} onChange={handleChange} placeholder="GitHub URL" className={inputCls('github')} /></div>
                        <div className="flex items-center gap-2"><FaGlobe className="text-green-400 text-sm flex-shrink-0" /><input type="url" name="portfolio" value={editData.portfolio} onChange={handleChange} placeholder="Portfolio URL" className={inputCls('portfolio')} /></div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={handleCancel} className="flex-1 py-3 px-4 border border-white/10 dark:border-white/[0.1] text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2"><FaTimes /> Cancel</button>
                      <button onClick={handleSave} disabled={saving} className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                        {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <InfoRow icon={FaUser} label="Full Name" value={profile?.fullName || ''} />
                    <InfoRow icon={FaIdCard} label="Roll Number" value={profile?.rollNumber || ''} />
                    <InfoRow icon={FaPhone} label="Phone" value={profile?.phone ? `+91 ${profile.phone}` : ''} />
                    <InfoRow icon={FaEnvelope} label="Email" value={profile?.email || ''} />
                    <InfoRow icon={FaUniversity} label="College" value={profile?.collegeId ? getCollegeName(profile.collegeId) : ''} />
                    <InfoRow icon={FaGraduationCap} label="Year" value={profile?.year || ''} />
                    <InfoRow icon={FaCodeBranch} label="Branch" value={profile?.branch || ''} />
                    <button onClick={() => setIsEditing(true)} className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"><FaEdit /> Edit Profile</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Privacy Settings</h2>
                  <p className="text-sm text-gray-500 mt-1">Control what others see on your public profile</p>
                </div>
                <div className="mb-6 p-4 rounded-xl bg-white/5 dark:bg-white/[0.04] border border-white/[0.06]">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Profile Visibility</p>
                  <div className="flex gap-2">
                    {(['public', 'private'] as const).map(opt => (
                      <button key={opt} onClick={() => setPrivacyData(p => ({ ...p, profileVisibility: opt }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${privacyData.profileVisibility === opt
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 dark:bg-white/[0.06] border border-white/10 dark:border-white/[0.08] text-gray-600 dark:text-gray-400'
                          }`}>
                        {opt === 'public' ? <FaEye className="text-xs" /> : <FaEyeSlash className="text-xs" />}
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <PrivacyToggle label="Email" description="Show your email" checked={privacyData.showEmail} onChange={v => setPrivacyData(p => ({ ...p, showEmail: v }))} />
                  <PrivacyToggle label="Phone" description="Show your phone number" checked={privacyData.showPhone} onChange={v => setPrivacyData(p => ({ ...p, showPhone: v }))} />
                  <PrivacyToggle label="College" description="Show your college" checked={privacyData.showCollege} onChange={v => setPrivacyData(p => ({ ...p, showCollege: v }))} />
                  <PrivacyToggle label="Year" description="Show your academic year" checked={privacyData.showYear} onChange={v => setPrivacyData(p => ({ ...p, showYear: v }))} />
                  <PrivacyToggle label="Branch" description="Show your branch" checked={privacyData.showBranch} onChange={v => setPrivacyData(p => ({ ...p, showBranch: v }))} />
                  <PrivacyToggle label="Roll Number" description="Show your roll number" checked={privacyData.showRollNumber} onChange={v => setPrivacyData(p => ({ ...p, showRollNumber: v }))} />
                  <PrivacyToggle label="SkillDNA" description="Share your SkillDNA" checked={privacyData.showSkillDNA} onChange={v => setPrivacyData(p => ({ ...p, showSkillDNA: v }))} />
                </div>
                <button onClick={handleSavePrivacy} disabled={saving}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                  {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save Privacy Settings</>}
                </button>
              </div>
            )}

            {activeTab === 'share' && (
              <div className="p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Share Your Profile</h2>
                  <p className="text-sm text-gray-500 mt-1">Share your matriXO profile with anyone</p>
                </div>
                {!profile?.username && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
                    <p className="text-sm text-amber-400 font-medium mb-2">Username Required</p>
                    <p className="text-xs text-amber-400/70 mb-3">Set a username to get a shareable profile link.</p>
                    <button onClick={() => { setEditingUsername(true); setActiveTab('profile') }} className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline">Set Username Now</button>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-white/5 dark:bg-white/[0.04] border border-white/[0.06] mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Your Profile Link</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 py-2.5 px-3 bg-white/5 dark:bg-white/[0.06] border border-white/10 dark:border-white/[0.08] rounded-lg text-sm text-gray-700 dark:text-gray-300 truncate font-mono">
                      {profileUrl || 'Set a username to get your link'}
                    </div>
                    <button onClick={handleCopyLink} disabled={!profile?.username}
                      className="p-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all flex-shrink-0 disabled:opacity-50 shadow-lg shadow-blue-500/20">
                      {copied ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>
                {/* Preview Button — prominent */}
                {profile?.username && (
                  <div className="mb-6">
                    <Link href={`/u/${profile.username}`}
                      className="group relative w-full py-4 px-5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 overflow-hidden bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <FaEye className="relative z-10 text-lg" />
                      <span className="relative z-10 text-base">Preview Your Profile</span>
                      <span className="relative z-10 text-xs opacity-75 ml-1">— See how others see you</span>
                    </Link>
                  </div>
                )}

                {/* Mini Preview Card */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Quick Preview</p>
                  <div className="p-5 rounded-2xl bg-white/5 dark:bg-white/[0.06] border border-white/[0.08]">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex-shrink-0">
                        {profile?.profilePhoto ? (
                          <Image src={profile.profilePhoto} alt={profile.fullName} width={56} height={56} className="object-cover w-full h-full rounded-lg" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400 rounded-lg">{profile?.fullName?.charAt(0)?.toUpperCase()}</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{profile?.fullName}</p>
                        <p className="text-sm text-gray-500">@{profile?.username || 'username'}</p>
                        {profile?.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{profile.bio}</p>}
                      </div>
                    </div>
                    {(privacyData.showCollege || privacyData.showBranch || privacyData.showYear) && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap gap-2">
                        {privacyData.showCollege && profile?.collegeId && <span className="text-xs bg-white/5 dark:bg-white/[0.08] text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full border border-white/[0.06]">{getCollegeName(profile.collegeId)}</span>}
                        {privacyData.showBranch && profile?.branch && <span className="text-xs bg-white/5 dark:bg-white/[0.08] text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full border border-white/[0.06]">{profile.branch}</span>}
                        {privacyData.showYear && profile?.year && <span className="text-xs bg-white/5 dark:bg-white/[0.08] text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full border border-white/[0.06]">{profile.year}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Open in new tab link */}
                {profile?.username && (
                  <Link href={`/u/${profile.username}`} target="_blank"
                    className="w-full mt-4 py-3 px-4 border border-white/10 dark:border-white/[0.1] text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    <FaLink className="text-sm" /> Open in New Tab
                  </Link>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Crop Modals */}
      {tempPhotoUrl && (
        <ImageCropModal
          isOpen={photoCropModalOpen}
          imageSrc={tempPhotoUrl}
          aspectRatio={1}
          onClose={() => {
            setPhotoCropModalOpen(false)
            if (tempPhotoUrl) URL.revokeObjectURL(tempPhotoUrl)
            setTempPhotoUrl(null)
          }}
          onComplete={handlePhotoCropComplete}
          title="Crop Profile Photo"
          cropShape="rect"
          darkMode={isDark}
        />
      )}

      {tempCoverUrl && (
        <ImageCropModal
          isOpen={coverCropModalOpen}
          imageSrc={tempCoverUrl}
          aspectRatio={820 / 360}
          onClose={() => {
            setCoverCropModalOpen(false)
            if (tempCoverUrl) URL.revokeObjectURL(tempCoverUrl)
            setTempCoverUrl(null)
          }}
          onComplete={handleCoverCropComplete}
          title="Crop Cover Photo (820x360)"
          cropShape="rect"
          darkMode={isDark}
        />
      )}
    </div>
  )
}