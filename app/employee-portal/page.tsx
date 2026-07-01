'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaUser, 
  FaLock, 
  FaSignOutAlt, 
  FaCalendarCheck, 
  FaChartLine, 
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaPlane,
  FaBriefcase,
  FaUmbrellaBeach,
  FaSpinner,
  FaIdCard,
  FaCalendarAlt,
  FaBars,
  FaTimes,
  FaExclamationTriangle,
  FaUserShield,
  FaTasks,
  FaComments,
  FaChevronDown,
  FaPlus,
  FaTrash,
  FaListAlt,
  FaQrcode,
  FaVideo,
  FaSun,
  FaMoon,
  FaUserCircle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa'
import { HiCalendarDays } from "react-icons/hi2"
import { EmployeeAuthProvider, useEmployeeAuth, isAdminOrSubAdmin } from '@/lib/employeePortalContext'
import ProfilePhotoUpload from '@/components/employee-portal/ProfilePhotoUpload'
import { registerServiceWorker, subscribeToPush } from '@/lib/serviceWorkerRegistration'
import { createGlobalNotification } from '@/lib/notificationUtils'
import { PortalThemeContext, usePortalTheme } from '@/lib/portalThemeContext'
import { db } from '@/lib/firebaseConfig'
import { collection, doc, setDoc, getDocs, query, where, Timestamp, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { toast, Toaster } from 'sonner'
import Link from 'next/link'

// Import modular components
import Calendar from '@/components/employee-portal/Calendar'
import Attendance from '@/components/employee-portal/Attendance'
import Tasks from '@/components/employee-portal/Tasks'
import Discussions from '@/components/employee-portal/Discussions'
import Meetings from '@/components/employee-portal/Meetings'
import AdminPanel from '@/components/employee-portal/AdminPanel'
import NotificationBell from '@/components/employee-portal/NotificationBell'
import EventQRScanner from '@/components/employee-portal/EventQRScanner'
import JobPostings from '@/components/employee-portal/JobPostings'
import { ProfileInfo, employeeToProfileData, getLocalProfileImage } from '@/components/employee-portal/ui'

// ============================================
// THEME CONTEXT
// ============================================

// ============================================
// THEME - use shared context
// ============================================

const useTheme = usePortalTheme

// Default avatar placeholder
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff&size=200'

// Simple helper to get profile image (uses centralized getLocalProfileImage)
const getProfileImageUrl = (url: string | undefined, name?: string, employeeId?: string): string => {
  const localImage = getLocalProfileImage(url, employeeId)
  if (localImage) return localImage
  if (name) {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=7c3aed&color=fff&size=200`
  }
  return DEFAULT_AVATAR
}

// ============================================
// LOGIN COMPONENT
// ============================================

function LoginForm() {
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useEmployeeAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId || !password) {
      toast.error('Please enter both Employee ID and Password')
      return
    }
    
    setLoading(true)
    try {
      await signIn(employeeId, password)
      toast.success('Welcome back!')
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.message === 'Employee ID not found') {
        toast.error('Employee ID not found. Please contact administrator.')
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Invalid password. Please try again.')
      } else {
        toast.error('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(167,139,250,0.15) 0%, transparent 50%), #050507' }}>
      {/* iOS 26 ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <motion.img 
              src="/logos/logo-dark.png" 
              alt="matriXO" 
              className="h-12 mx-auto mb-4"
              whileHover={{ scale: 1.05 }}
            />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Employee Portal</h1>
          <p className="text-neutral-400">Access your attendance dashboard</p>
        </div>

        <div className="rounded-3xl p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                <FaIdCard className="text-primary-400" />
                Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g., M-01 or M-A001"
                className="w-full py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-white placeholder-neutral-400"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                <FaLock className="text-primary-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-white placeholder-neutral-400 pr-12"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-2 flex items-start gap-1">
                <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
                If you forget your password, please contact the system administrator.
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <FaUser />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-neutral-400 hover:text-primary-400 transition-colors">
              ? Back to matriXO Website
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <FaLock className="text-green-500" /> Secure Login
          </span>
          <span>.</span>
          <span>256-bit Encryption</span>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// NAVIGATION ITEMS
// ============================================

const navigationItems = [
  { id: 'attendance', label: 'Attendance', icon: FaCalendarCheck, adminHidden: true },
  { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
  { id: 'history', label: 'History', icon: FaHistory },
  { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
  { id: 'tasks', label: 'Tasks', icon: FaTasks },
  { id: 'meetings', label: 'Meetings', icon: FaVideo },
  { id: 'discussions', label: 'Discussions', icon: FaComments },
  { id: 'event-checkin', label: 'Event QR', icon: FaQrcode },
  { id: 'profile', label: 'My Profile', icon: FaUserCircle },
  { id: 'job-postings', label: 'Careers', icon: FaBriefcase, adminOnly: true },
]

// ============================================
// TOP NAVIGATION BAR
// ============================================

function TopNavbar({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab: string
  setActiveTab: (tab: string) => void
}) {
  const { employee, logout } = useEmployeeAuth()
  const { darkMode, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, right: 0, isMobile: false })
  const [mounted, setMounted] = useState(false)
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuDropdownRef = useRef<HTMLDivElement>(null)
  const isAdmin = isAdminOrSubAdmin(employee?.role)

  // Track pending application count for Careers badge (admin only)
  const [pendingAppCount, setPendingAppCount] = useState(0)
  useEffect(() => {
    if (!isAdmin) return
    const q = query(collection(db, 'applications'), where('status', '==', 'pending'))
    const unsub = onSnapshot(q, (snap) => {
      setPendingAppCount(snap.docs.length)
    }, () => {})
    return () => unsub()
  }, [isAdmin])

  // Ensure mounted for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close user menu on ESC and outside click
  useEffect(() => {
    if (!userMenuOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        userMenuButtonRef.current && !userMenuButtonRef.current.contains(target) &&
        userMenuDropdownRef.current && !userMenuDropdownRef.current.contains(target)
      ) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    // Delay adding click listener to avoid closing on same click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
      clearTimeout(timer)
    }
  }, [userMenuOpen])

  // Handle user menu click
  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!userMenuOpen && userMenuButtonRef.current) {
      const rect = userMenuButtonRef.current.getBoundingClientRect()
      const isMobile = window.innerWidth < 640
      setUserMenuPosition({
        top: rect.bottom + 8,
        right: isMobile ? 8 : window.innerWidth - rect.right,
        isMobile
      })
    }
    setUserMenuOpen(prev => !prev)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 overflow-x-hidden"
      style={{
        zIndex: 9000,
        paddingTop: 'env(safe-area-inset-top)',
        background: darkMode
          ? 'rgba(10,10,15,0.65)'
          : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderBottom: darkMode
          ? '1px solid rgba(255,255,255,0.07)'
          : '1px solid rgba(0,0,0,0.08)',
        boxShadow: darkMode
          ? '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600" />
      
      <div className="max-w-[100vw] px-3 sm:px-4 md:px-6 mx-auto">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-2 md:gap-4 overflow-hidden">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
            <img src={darkMode ? "/logos/logo-dark.png" : "/logos/logo-light.png"} onError={(e) => { (e.target as HTMLImageElement).src = '/logos/logo-dark.png' }} alt="matriXO" className="h-7 sm:h-8 md:h-9 w-auto group-hover:scale-105 transition-transform" />
            <div className="hidden sm:flex flex-col">
              <span className={`font-bold text-sm leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Employee</span>
              <span className="text-primary-500 text-xs font-medium leading-tight">Portal</span>
            </div>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-0.5">
              {navigationItems.filter(item => !item.adminOnly && !(item.adminHidden && employee?.role === 'admin')).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 font-medium text-xs whitespace-nowrap
                    ${activeTab === item.id 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30' 
                      : darkMode
                        ? 'text-neutral-400 hover:text-white hover:bg-white/8'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-black/6'
                    }
                  `}
                >
                  <item.icon className="text-xs shrink-0" />
                  <span>{item.label}</span>
                </button>
              ))}
              
              {isAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab('job-postings')}
                    className={`
                      relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 font-medium text-xs whitespace-nowrap
                      ${activeTab === 'job-postings'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                        : darkMode
                          ? 'text-neutral-400 hover:text-white hover:bg-white/8'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-black/6'
                      }
                    `}
                  >
                    <FaBriefcase className="text-xs shrink-0" />
                    <span>Careers</span>
                    {pendingAppCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {pendingAppCount > 99 ? '99+' : pendingAppCount}
                      </span>
                    )}
                  </button>
                  <div className="w-px h-5 bg-white/10 mx-0.5" />
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 font-medium text-xs whitespace-nowrap
                      ${activeTab === 'admin'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/30'
                        : 'text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/10'
                      }
                    `}
                  >
                    <FaUserShield className="text-xs shrink-0" />
                    <span>Admin</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Notification Bell */}
            <NotificationBell onNavigate={setActiveTab} darkMode={darkMode} />

            {/* Theme Toggle Button */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className="relative p-1.5 sm:p-2.5 rounded-xl transition-all duration-300 overflow-hidden"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                background: darkMode
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.06)',
                border: darkMode
                  ? '1px solid rgba(255,255,255,0.12)'
                  : '1px solid rgba(0,0,0,0.1)',
                boxShadow: darkMode
                  ? '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : '0 2px 10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaSun className="text-amber-400" size={14} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaMoon className="text-indigo-600" size={14} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* User Menu */}
            <div className="relative">
              <button
                ref={userMenuButtonRef}
                onClick={handleUserMenuClick}
                type="button"
                className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                  border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.09)',
                }}
              >
                <img
                  src={getProfileImageUrl(employee?.profileImage, employee?.name, employee?.employeeId)}
                  alt={employee?.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/50"
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR }}
                />
                <span className={`font-medium hidden md:block text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{employee?.name?.split(' ')[0]}</span>
                <FaChevronDown className={`text-xs hidden md:block transition-transform ${darkMode ? 'text-neutral-400' : 'text-gray-500'} ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown - Rendered via Portal */}
              {mounted && userMenuOpen && createPortal(
                <div
                  ref={userMenuDropdownRef}
                  style={{ 
                    position: 'fixed',
                    top: userMenuPosition.top,
                    right: userMenuPosition.isMobile ? 8 : userMenuPosition.right,
                    left: userMenuPosition.isMobile ? 8 : 'auto',
                    zIndex: 999999
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className={`rounded-2xl shadow-2xl ${userMenuPosition.isMobile ? 'w-auto' : 'w-64'}`}
                    style={{
                      background: darkMode ? 'rgba(15,15,20,0.85)' : 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(40px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                      border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                      boxShadow: darkMode ? '0 24px 48px rgba(0,0,0,0.6)' : '0 24px 48px rgba(0,0,0,0.12)',
                    }}
                  >
                    <div className="p-4 border-b rounded-t-2xl" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, transparent 100%)' }}>
                      <div className="flex items-center gap-3">
                        <img
                          src={getProfileImageUrl(employee?.profileImage, employee?.name, employee?.employeeId)}
                          alt={employee?.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary-500/50"
                        />
                        <div className="min-w-0">
                          <p className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{employee?.name}</p>
                          <p className="text-xs text-primary-500">{employee?.department}</p>
                          <p className={`text-xs font-mono ${darkMode ? 'text-neutral-500' : 'text-gray-400'}`}>{employee?.employeeId}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setActiveTab('profile'); setUserMenuOpen(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${darkMode ? 'text-neutral-300 hover:bg-white/8' : 'text-gray-700 hover:bg-black/5'}`}
                      >
                        <FaUserCircle />
                        <span>My Profile</span>
                      </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                </div>,
                document.body
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`lg:hidden p-2 rounded-xl transition-all ${darkMode ? 'text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 bg-black/5 hover:bg-black/10'}`}
            >
              {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden py-3 sm:py-4"
              style={{ borderTop: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)' }}
            >
              <div className="grid grid-cols-2 gap-2">
                {navigationItems.filter(item => (!item.adminOnly || isAdmin) && !(item.adminHidden && employee?.role === 'admin')).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false) }}
                    className={`
                      relative flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all font-medium text-sm
                      ${activeTab === item.id 
                        ? 'bg-primary-500/20 text-primary-500 border border-primary-500/20' 
                        : darkMode
                          ? 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-black/5 border border-transparent'
                      }
                    `}
                  >
                    <item.icon />
                    {item.label}
                    {item.id === 'job-postings' && pendingAppCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {pendingAppCount > 99 ? '99+' : pendingAppCount}
                      </span>
                    )}
                  </button>
                ))}
                
                {isAdmin && (
                  <button
                    onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false) }}
                    className={`
                      flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all font-medium text-sm col-span-2
                      ${activeTab === 'admin' 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' 
                        : darkMode
                          ? 'text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent'
                          : 'text-amber-600/80 hover:text-amber-600 hover:bg-amber-500/10 border border-transparent'
                      }
                    `}
                  >
                    <FaUserShield />
                    Admin Panel
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

// ============================================
// DASHBOARD OVERVIEW (for Dashboard tab)
// ============================================

function DashboardOverview({ onTaskClick, onShowMyTasks }: { onTaskClick?: (taskId: string) => void; onShowMyTasks?: () => void }) {
  const { employee, getAttendanceRecords, getMonthlyAttendanceStats, tasks = [], personalTodos = [], addPersonalTodo, updatePersonalTodo, deletePersonalTodo } = useEmployeeAuth()
  const { darkMode } = useTheme()
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [addingTodo, setAddingTodo] = useState(false)

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true)
      try {
        // Fetch current month's attendance records
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date()

        const records = await getAttendanceRecords(startDate, endDate)
        setAttendanceRecords(records || [])
      } catch (error) {
        console.error('Error fetching attendance:', error)
        setAttendanceRecords([])
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [getAttendanceRecords])

  // Monthly attendance calculation
  const monthlyStats = getMonthlyAttendanceStats(attendanceRecords)
  const attendancePercentage = monthlyStats.attendanceRate
  const presentDays = monthlyStats.presentDays
  const absentDays = monthlyStats.absentDays

  // Safely filter tasks - handle both array and string for assignedTo
  const myTasks = (tasks || []).filter(t => {
    if (!t || !employee?.employeeId) return false
    const assignedTo = t.assignedTo
    if (Array.isArray(assignedTo)) {
      return assignedTo.includes(employee.employeeId) && t.status !== 'completed'
    }
    if (typeof assignedTo === 'string') {
      return assignedTo === employee.employeeId && t.status !== 'completed'
    }
    return false
  })

  // Helpers for todo list
  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return
    setAddingTodo(true)
    try {
      await addPersonalTodo(newTodoTitle.trim())
      setNewTodoTitle('')
      toast.success('Todo added')
    } catch (error: any) {
      console.error('Todo add error:', error)
      toast.error(error?.message || 'Failed to add todo')
    } finally {
      setAddingTodo(false)
    }
  }

  const handleToggleTodo = async (id: string, currentStatus: 'pending' | 'completed') => {
    try {
      await updatePersonalTodo(id, { status: currentStatus === 'pending' ? 'completed' : 'pending' })
    } catch (error) {
      toast.error('Failed to update todo')
    }
  }

  const handleDeleteTodo = async (id: string) => {
    try {
      await deletePersonalTodo(id)
      toast.success('Todo deleted')
    } catch (error) {
      toast.error('Failed to delete todo')
    }
  }

  // Filter: pending first, then completed
  const sortedTodos = [...personalTodos].sort((a, b) => {
    if (a.status === 'pending' && b.status === 'completed') return -1
    if (a.status === 'completed' && b.status === 'pending') return 1
    return 0
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-4 sm:p-6"
        style={{
          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
          boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)' : '0 8px 24px rgba(124,58,237,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={getProfileImageUrl(employee?.profileImage, employee?.name, employee?.employeeId)}
            alt={employee?.name}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-primary-500"
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR }}
          />
            <div className="min-w-0 flex-1">
            <h2 className={`text-lg sm:text-2xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome back, {employee?.name?.split(' ')[0]}!
              </h2>
              <p className={`text-sm sm:text-base truncate ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                {employee?.department} . {employee?.designation}
              </p>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${attendancePercentage}%`}
          icon={FaChartLine}
          color={attendancePercentage >= 80 ? 'bg-green-500' : attendancePercentage >= 60 ? 'bg-amber-500' : 'bg-red-500'}
        />
        <StatCard
          title="Present Days"
          value={presentDays}
          icon={FaCheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Absent Days"
          value={absentDays}
          icon={FaTimesCircle}
          color="bg-red-500"
        />
        <StatCard
          title="Working Days"
          value={monthlyStats.totalWorkingDays}
          icon={FaTasks}
          color="bg-indigo-500"
        />
      </div>

      {/* My Tasks & Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-xl sm:rounded-2xl p-4 sm:p-6"
          style={{
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 24px rgba(124,58,237,0.06)',
          }}
        >
          <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <FaTasks className="text-primary-500" />
            My Pending Tasks
          </h3>
          {myTasks.length === 0 ? (
            <p className={`text-center py-4 text-sm sm:text-base ${darkMode ? 'text-neutral-500' : 'text-gray-400'}`}>No pending tasks</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {myTasks.slice(0, 4).map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer transition-colors gap-2 ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/4 hover:bg-black/8'}`}
                  style={{ border: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)' }}
                  onClick={() => onTaskClick?.(task.id!)}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-sm sm:text-base truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{task.title}</p>
                    <p className={`text-xs ${darkMode ? 'text-neutral-500' : 'text-gray-400'}`}>
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                  <span className={`
                    px-2 py-1 text-xs rounded-full font-medium flex-shrink-0
                    ${task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      task.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-neutral-500/20 text-neutral-400'}
                  `}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="rounded-xl sm:rounded-2xl p-4 sm:p-6"
          style={{
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(30px) saturate(180%)',
            WebkitBackdropFilter: 'blur(30px) saturate(180%)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 24px rgba(124,58,237,0.06)',
          }}
        >
          <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <FaListAlt className="text-primary-500" />
            My Todo List
          </h3>
          
          {/* Add Todo Input */}
          <div className="flex gap-2 mb-3 sm:mb-4">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              placeholder="Add a new todo..."
              className={`flex-1 px-3 py-2 rounded-lg sm:rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-w-0 transition-all ${darkMode ? 'placeholder-neutral-500 text-white' : 'placeholder-gray-400 text-gray-900'}`}
              style={{
                background: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.09)',
              }}
            />
            <button
              onClick={handleAddTodo}
              disabled={addingTodo || !newTodoTitle.trim()}
              className="px-3 py-2 bg-primary-500 hover:bg-primary-400 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl transition-colors flex-shrink-0"
            >
              {addingTodo ? <FaSpinner className="animate-spin" /> : <FaPlus />}
            </button>
          </div>

          {sortedTodos.length === 0 ? (
            <p className={`text-center py-4 ${darkMode ? 'text-neutral-500' : 'text-gray-400'}`}>No todos yet. Add one above!</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sortedTodos.slice(0, 6).map((todo) => (
                <div 
                  key={todo.id} 
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    todo.status === 'completed' 
                      ? darkMode ? 'bg-white/3' : 'bg-black/3'
                      : darkMode ? 'bg-white/7' : 'bg-black/5'
                  }`}
                  style={{ border: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)' }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => todo.id && handleToggleTodo(todo.id, todo.status)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        todo.status === 'completed' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : darkMode ? 'border-neutral-500 hover:border-primary-500' : 'border-gray-400 hover:border-primary-500'
                      }`}
                    >
                      {todo.status === 'completed' && <FaCheckCircle className="text-xs" />}
                    </button>
                    <span className={`text-sm truncate ${
                      todo.status === 'completed' 
                        ? darkMode ? 'text-neutral-500 line-through' : 'text-gray-400 line-through'
                        : darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {todo.title}
                    </span>
                  </div>
                  <button
                    onClick={() => todo.id && handleDeleteTodo(todo.id)}
                    className="text-neutral-500 hover:text-red-400 transition-colors ml-2"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attendance Warning */}
      {attendancePercentage < 80 && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
          <FaExclamationTriangle className="text-red-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-medium">Low Attendance Warning</p>
            <p className={`text-sm mt-1 ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
              Your attendance is below the minimum required 80%. Please improve your attendance to avoid any issues.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// HISTORY TAB
// ============================================

function HistoryTab() {
  const { getAttendanceRecords } = useEmployeeAuth()
  const { darkMode } = useTheme()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true)
      try {
        const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1)
        const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
        const data = await getAttendanceRecords(startDate, endDate)
        setRecords(data.sort((a, b) => {
          const aTime = b.timestamp?.toDate?.() || new Date(b.timestamp as any)
          const bTime = a.timestamp?.toDate?.() || new Date(a.timestamp as any)
          return aTime.getTime() - bTime.getTime()
        }))
      } catch (error) {
        console.error('Error fetching records:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [selectedMonth, getAttendanceRecords])

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    P: { label: 'Present', color: 'bg-green-500', icon: FaCheckCircle },
    A: { label: 'Absent', color: 'bg-red-500', icon: FaTimesCircle },
    L: { label: 'Leave', color: 'bg-yellow-500', icon: FaUmbrellaBeach },
    O: { label: 'On Duty', color: 'bg-blue-500', icon: FaBriefcase },
    H: { label: 'Holiday', color: 'bg-purple-500', icon: FaPlane }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div
        className="rounded-xl sm:rounded-2xl p-4 sm:p-6"
        style={{
          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
          boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 24px rgba(124,58,237,0.06)',
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <FaHistory className="text-primary-500" />
            Attendance History
          </h2>
          <input
            type="month"
            value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`}
            onChange={(e) => setSelectedMonth(new Date(e.target.value))}
            className={`w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            style={{
              background: darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
              border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.09)',
            }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin text-3xl text-primary-500" />
          </div>
        ) : records.length === 0 ? (
          <p className={`text-center py-8 ${darkMode ? 'text-neutral-500' : 'text-gray-400'}`}>No attendance records for this month</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {records.map((record) => {
              const config = statusConfig[record.status] || statusConfig.P
              const StatusIcon = config.icon
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl gap-3"
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className="text-white text-sm sm:text-base" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium text-sm sm:text-base truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {(() => {
                          const timestamp = record.timestamp?.toDate ? record.timestamp.toDate() : new Date(record.timestamp)
                          return timestamp.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })
                        })()}
                      </p>
                      <p className={`text-xs truncate ${darkMode ? 'text-neutral-500' : 'text-gray-400'}`}>
                        {(() => {
                          const timestamp = record.timestamp?.toDate ? record.timestamp.toDate() : new Date(record.timestamp)
                          return timestamp.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        })()}
                        {record.notes && <span className="hidden sm:inline"> . {record.notes}</span>}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${config.color}/20 text-white flex-shrink-0 flex items-center gap-1`}>
                    {config.label}
                    {record.status === 'P' && record.locationVerified && (
                      <FaCheckCircle className="text-xs" />
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// PROFILE TAB COMPONENT
// ============================================

function ProfileTab() {
  const { employee, refreshEmployee } = useEmployeeAuth()
  const { darkMode } = useTheme()
  const [localImageUrl, setLocalImageUrl] = useState<string>(employee?.profileImage || '')

  const handleImageUpdated = async (newUrl: string) => {
    setLocalImageUrl(newUrl)
    // Refresh context so all other portal areas (navbar avatar, dashboard banner) update
    await refreshEmployee()
  }

  if (!employee) return null

  const displayImage = localImageUrl || getLocalProfileImage(employee.profileImage, employee.employeeId)

  const infoRows = [
    { label: 'Employee ID', value: employee.employeeId },
    { label: 'Department', value: employee.department },
    { label: 'Designation', value: employee.designation },
    { label: 'Email', value: employee.email },
    { label: 'Role', value: employee.role },
    { label: 'Joining Date', value: employee.joiningDate },
  ]

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
          boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 24px rgba(124,58,237,0.08)',
        }}
      >
        {/* Avatar + name row */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-blue-500/40 bg-gradient-to-br from-blue-500 to-purple-600">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={employee.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent && !parent.querySelector('.initials-fb')) {
                      const fb = document.createElement('div')
                      fb.className = 'initials-fb absolute inset-0 flex items-center justify-center text-white text-4xl font-bold'
                      fb.textContent = employee.name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2)
                      parent.appendChild(fb)
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {employee.name.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
            </div>
          </div>

          {/* Name + role + upload button */}
          <div className="text-center sm:text-left flex-1">
            <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {employee.name}
            </h2>
            <p className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 font-medium text-base mb-1">
              {employee.designation || employee.role}
            </p>
            {employee.department && (
              <p className={`text-sm mb-4 ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                {employee.department}
              </p>
            )}
            <ProfilePhotoUpload
              employeeId={employee.employeeId}
              currentImageUrl={displayImage}
              employeeName={employee.name}
              darkMode={darkMode}
              onImageUpdated={handleImageUpdated}
            />
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {infoRows.map(({ label, value }) =>
            value ? (
              <div
                key={label}
                className="rounded-xl px-4 py-3"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <p className={`text-xs font-medium mb-0.5 ${darkMode ? 'text-neutral-500' : 'text-gray-400'}`}>
                  {label}
                </p>
                <p className={`text-sm font-medium break-all ${darkMode ? 'text-neutral-200' : 'text-gray-800'}`}>
                  {value}
                </p>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Photo guidelines note */}
      <div
        className="rounded-xl px-5 py-4 text-sm"
        style={{
          background: darkMode ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)',
          border: darkMode ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(59,130,246,0.15)',
        }}
      >
        <p className={`font-medium mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
          Profile Photo Guidelines
        </p>
        <ul className={`space-y-0.5 list-disc list-inside text-xs ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
          <li>Accepted formats: JPEG, PNG, WebP</li>
          <li>Maximum file size: 3MB</li>
          <li>Photos are automatically cropped to a square (512&times;512) and optimized</li>
          <li>Your photo appears on the public Team page and in the employee portal</li>
        </ul>
      </div>
    </div>
  )
}

// ============================================
// STAT CARD COMPONENT
// ============================================

function StatCard({ title, value, icon: Icon, color, onClick }: { 
  title: string
  value: string | number
  icon: any
  color: string
  onClick?: () => void
}) {
  const { darkMode } = useTheme()
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.8)',
        boxShadow: darkMode ? '0 8px 24px rgba(0,0,0,0.25)' : '0 6px 20px rgba(124,58,237,0.06)',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className={`text-xs sm:text-sm truncate ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-xl sm:text-3xl font-bold mt-1 sm:mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="text-lg sm:text-xl text-white" />
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

function Dashboard() {
  const { employee } = useEmployeeAuth()
  const [activeTab, setActiveTab] = useState('attendance')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ep-theme')
      return saved ? saved === 'dark' : true
    }
    return true
  })
  const isAdmin = isAdminOrSubAdmin(employee?.role)

  const toggleTheme = () => {
    setDarkMode(prev => {
      const next = !prev
      if (typeof window !== 'undefined') localStorage.setItem('ep-theme', next ? 'dark' : 'light')
      return next
    })
  }

  // Sync theme attribute to body for portals (dropdowns rendered via createPortal)
  useEffect(() => {
    document.body.setAttribute('data-portal-theme', darkMode ? 'dark' : 'light')
    return () => { document.body.removeAttribute('data-portal-theme') }
  }, [darkMode])

  // Handler for pending task click from Dashboard
  const handlePendingTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setActiveTab('tasks')
  }

  // Handler for clicking on Pending Tasks stat card
  const handleShowMyTasks = () => {
    setShowOnlyMyTasks(true)
    setActiveTab('tasks')
  }

  // Clear selected task when leaving tasks tab
  useEffect(() => {
    if (activeTab !== 'tasks') {
      setSelectedTaskId(null)
      setShowOnlyMyTasks(false)
    }
  }, [activeTab])

  // Auto-request notification permission and register push on first load
  useEffect(() => {
    const setupPushNotifications = async () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return
      if (!employee?.employeeId) return

      try {
        // Request notification permission if not yet decided
        if (Notification.permission === 'default') {
          await Notification.requestPermission()
        }

        // If permission granted, register SW and subscribe to push
        if (Notification.permission === 'granted') {
          await registerServiceWorker()
          await subscribeToPush(employee.employeeId)
          console.log('Push notifications set up successfully')
        }
      } catch (error) {
        console.error('Failed to set up push notifications:', error)
      }
    }
    setupPushNotifications()
  }, [employee?.employeeId])

  // Background sync: Meeting tasks -> Main Tasks collection
  // Runs once on portal load so meeting tasks appear on Tasks page regardless of which tab is active
  const meetingSyncRef = useRef(false)
  useEffect(() => {
    if (!employee?.employeeId || meetingSyncRef.current) return
    
    const syncMeetingTasksBackground = async () => {
      try {
        // 1. Fetch meetings from Fathom API
        const response = await fetch('/api/fathom?action=list')
        if (!response.ok) return
        const data = await response.json()
        const meetings = data.items || []
        if (meetings.length === 0) return

        // 2. Get all employees for assignee matching
        const empSnapshot = await getDocs(collection(db, 'Employees'))
        const allEmployees = empSnapshot.docs.map(d => ({ employeeId: d.id, ...d.data() })) as any[]

        // 3. Get custom tasks from Firestore
        const customTasksSnapshot = await getDocs(collection(db, 'meetingCustomTasks'))
        const customTasksMap = new Map<number, any[]>()
        customTasksSnapshot.docs.forEach(d => {
          const data = d.data()
          if (data.recordingId) {
            const existing = customTasksMap.get(data.recordingId) || []
            existing.push({ description: data.description, assignee: data.assignee, completed: false })
            customTasksMap.set(data.recordingId, existing)
          }
        })

        // 4. Get completed task IDs from meetingTaskStatus
        const taskStatusSnapshot = await getDocs(collection(db, 'meetingTaskStatus'))
        const completedIds = new Set<string>()
        taskStatusSnapshot.docs.forEach(d => {
          if (d.data().completed) completedIds.add(d.id)
        })

        // 5. Get removed meeting IDs
        const removedSnapshot = await getDocs(collection(db, 'removedMeetings'))
        const removedIds = new Set<number>()
        removedSnapshot.docs.forEach(d => removedIds.add(Number(d.data().recordingId || d.id)))

        // 6. Query existing meeting-sourced tasks
        const q = query(collection(db, 'tasks'), where('createdFrom', '==', 'meeting'))
        const existingSnapshot = await getDocs(q)
        const existingIds = new Set<string>()
        existingSnapshot.docs.forEach(d => existingIds.add(d.id))

        // 6.5 DEDUP: Merge existing duplicate meeting tasks (same meetingId + same title)
        const dupeGroups = new Map<string, { id: string, data: any }[]>()
        existingSnapshot.docs.forEach(d => {
          const data = d.data()
          const key = `${data.meetingId || ''}_${(data.title || '').trim().toLowerCase()}`
          const arr = dupeGroups.get(key) || []
          arr.push({ id: d.id, data })
          dupeGroups.set(key, arr)
        })
        const dupeEntries = Array.from(dupeGroups.values())
        for (const group of dupeEntries) {
          if (group.length <= 1) continue
          // Merge all assignees into the first task, delete the rest
          const primary = group[0]
          const mergedIds = new Set<string>(primary.data.assignedTo || [])
          const mergedNames = new Map<string, string>()
          ;(primary.data.assignedTo || []).forEach((id: string, idx: number) => {
            mergedNames.set(id, (primary.data.assignedToNames || [])[idx] || id)
          })
          for (let j = 1; j < group.length; j++) {
            const dup = group[j]
            ;(dup.data.assignedTo || []).forEach((id: string, idx: number) => {
              if (!mergedIds.has(id)) {
                mergedIds.add(id)
                mergedNames.set(id, (dup.data.assignedToNames || [])[idx] || id)
              }
            })
            // Delete duplicate
            await deleteDoc(doc(db, 'tasks', dup.id))
            existingIds.delete(dup.id)
          }
          // Update primary with merged assignees
          const finalIds = Array.from(mergedIds)
          const finalNames = finalIds.map(id => mergedNames.get(id) || id)
          if (finalIds.length !== (primary.data.assignedTo || []).length) {
            await updateDoc(doc(db, 'tasks', primary.id), {
              assignedTo: finalIds,
              assignedToNames: finalNames,
              updatedAt: Timestamp.now()
            })
          }
        }

        // 7. Sync missing tasks (group by description to combine assignees)
        let newTaskCount = 0
        for (const meeting of meetings) {
          if (removedIds.has(meeting.recording_id)) continue

          const fathomItems = (meeting.action_items || []).filter((a: any) => a)
          const meetingCustom = customTasksMap.get(meeting.recording_id) || []
          const allItems = [...fathomItems, ...meetingCustom]

          // Group items by description to combine multiple assignees into one task
          const groupedItems = new Map<string, { items: any[], indices: number[] }>()
          for (let i = 0; i < allItems.length; i++) {
            const item = allItems[i]
            if (!item?.description) continue
            const key = item.description.trim().toLowerCase()
            const existing = groupedItems.get(key) || { items: [], indices: [] }
            existing.items.push(item)
            existing.indices.push(i)
            groupedItems.set(key, existing)
          }

          const groupEntries = Array.from(groupedItems.values())
          for (const group of groupEntries) {
            const primaryItem = group.items[0]
            // Use a deterministic ID based on description content, not array index
            // Simple hash: sum of char codes to create a stable numeric ID
            const descHash = primaryItem.description.trim().toLowerCase().split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)
            const taskDocId = `meeting_${meeting.recording_id}_d${descHash}`

            // Also check old index-based IDs to avoid re-creating already-synced tasks
            const oldIdExists = group.indices.some(idx => existingIds.has(`meeting_${meeting.recording_id}_${idx}`))
            if (existingIds.has(taskDocId) || oldIdExists) continue

            // Collect all unique assignees from all items in this group
            const assigneeIds: string[] = []
            const assigneeNames: string[] = []
            const addedIds = new Set<string>()

            for (const item of group.items) {
              if (item.assignee) {
                const matched = allEmployees.find(
                  (emp: any) => (item.assignee.email && emp.email?.toLowerCase() === item.assignee.email.toLowerCase()) ||
                         (item.assignee.name && emp.name?.toLowerCase() === item.assignee.name.toLowerCase())
                )
                if (matched && !addedIds.has(matched.employeeId)) {
                  assigneeIds.push(matched.employeeId)
                  assigneeNames.push(matched.name)
                  addedIds.add(matched.employeeId)
                }
              }
            }

            // Fallback: recorder or current user
            if (assigneeIds.length === 0 && meeting.recorded_by) {
              const recorder = allEmployees.find(
                (emp: any) => emp.email?.toLowerCase() === (meeting.recorded_by?.email || '').toLowerCase() ||
                       emp.name?.toLowerCase() === (meeting.recorded_by?.name || '').toLowerCase()
              )
              if (recorder) {
                assigneeIds.push(recorder.employeeId)
                assigneeNames.push(recorder.name)
              }
            }
            if (assigneeIds.length === 0) {
              assigneeIds.push(employee.employeeId)
              assigneeNames.push(employee.name)
            }

            const isCompleted = group.items.every((item: any) => item.completed) ||
              group.indices.every(idx => completedIds.has(`${meeting.recording_id}_${idx}`))
            const meetingTitle = meeting.meeting_title || meeting.title || 'Meeting'

            await setDoc(doc(db, 'tasks', taskDocId), {
              title: primaryItem.description,
              description: `From meeting: ${meetingTitle}\n\n${primaryItem.description}`,
              status: isCompleted ? 'completed' : 'todo',
              priority: 'medium',
              assignedTo: assigneeIds,
              assignedToNames: assigneeNames,
              createdBy: employee.employeeId,
              createdByName: employee.name,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
              department: '',
              meetingId: meeting.recording_id,
              createdFrom: 'meeting',
              comments: [],
              tags: ['Meeting']
            })
            newTaskCount++
          }
        }

        if (newTaskCount > 0) {
          await createGlobalNotification({
            type: 'task',
            action: 'created',
            title: 'Meeting Tasks Synced',
            message: `${newTaskCount} new task${newTaskCount > 1 ? 's' : ''} from meetings added to Tasks.`,
            relatedEntityId: 'meeting-sync',
            targetUrl: '/employee-portal#tasks',
            createdBy: employee.employeeId,
            createdByName: employee.name,
            createdByRole: employee.role
          })
          toast.success(`${newTaskCount} meeting task(s) synced to Tasks`)
        }

        meetingSyncRef.current = true
      } catch (err) {
        console.error('Background meeting sync error:', err)
      }
    }

    // Small delay to not block initial render
    const timer = setTimeout(syncMeetingTasksBackground, 2000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee?.employeeId])

  return (
    <PortalThemeContext.Provider value={{ darkMode, toggleTheme }}>
    <div
      data-portal-theme={darkMode ? 'dark' : 'light'}
      className="min-h-screen overflow-x-hidden max-w-[100vw] transition-colors duration-500"
      style={{
        background: darkMode
          ? 'radial-gradient(ellipse at 20% 10%, rgba(124,58,237,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.12) 0%, transparent 50%), #06060a'
          : 'radial-gradient(ellipse at 20% 10%, rgba(167,139,250,0.12) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(196,181,253,0.1) 0%, transparent 50%), #f5f3ff',
      }}
    >
      {/* Top Navigation */}
      <TopNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content - pt-20 compensates for fixed navbar height */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pt-[calc(4.75rem+env(safe-area-inset-top))] sm:pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeTab === 'attendance' && employee?.role !== 'admin' && <Attendance />}
            {activeTab === 'dashboard' && <DashboardOverview onTaskClick={handlePendingTaskClick} onShowMyTasks={handleShowMyTasks} />}
            {activeTab === 'history' && <HistoryTab />}
            {activeTab === 'calendar' && <Calendar />}
            {activeTab === 'tasks' && <Tasks selectedTaskId={selectedTaskId} onTaskOpened={() => setSelectedTaskId(null)} showOnlyMyTasks={showOnlyMyTasks} />}
            {activeTab === 'discussions' && <Discussions />}
            {activeTab === 'meetings' && <Meetings />}
            {activeTab === 'event-checkin' && <EventQRScanner />}
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'job-postings' && isAdmin && <JobPostings />}
            {activeTab === 'admin' && isAdmin && <AdminPanel />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        className="py-4 sm:py-6 mt-auto px-4"
        style={{ borderTop: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}
      >
        <p className={`text-center text-sm ${darkMode ? 'text-neutral-500' : 'text-gray-400'}`}>
          &copy; {new Date().getFullYear()} matriXO Employee Portal. All rights reserved.
        </p>
      </footer>
    </div>
    </PortalThemeContext.Provider>
  )
}

// ============================================
// MAIN PAGE COMPONENT WITH AUTH CHECK
// ============================================

function EmployeePortalContent() {
  const { user, loading } = useEmployeeAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.2) 0%, transparent 60%), #06060a' }}>
        <div className="text-center p-10 rounded-3xl" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <FaSpinner className="animate-spin text-5xl text-primary-500 mx-auto mb-4" />
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <LoginForm />
}

// ============================================
// EXPORT PAGE WITH PROVIDER
// ============================================

export default function EmployeePortalPage() {
  return (
    <EmployeeAuthProvider>
      <EmployeePortalContent />
      <Toaster position="top-right" richColors />
    </EmployeeAuthProvider>
  )
}

