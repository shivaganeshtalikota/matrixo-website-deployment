'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBars, FaTimes, FaChevronDown, FaUser, FaSignOutAlt, FaIdBadge } from 'react-icons/fa'
import { FaSun, FaMoon } from 'react-icons/fa'
import { useAuth } from '@/lib/AuthContext'
import { useProfile } from '@/lib/ProfileContext'
import { toast } from 'sonner'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'

const navLinksBeforeFeatures = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Team', href: '/team' },
  { name: 'Services', href: '/services' },
]

const navLinksAfterFeatures = [
  { name: 'Events', href: '/events' },
]

const tabletMoreLinks = [
  { name: 'About', href: '/about' },
  { name: 'Team', href: '/team' },
  { name: 'Events', href: '/events' },
]

const betaLinks = [
  {
    name: 'Events',
    href: '/events',
    description: 'Browse workshops, hackathons, and featured programs',
  },
]

const talkWithUsClassName =
  'inline-flex items-center justify-center px-4 py-1.5 rounded-full font-medium whitespace-nowrap bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-all duration-300 hover:scale-105 flex-shrink-0'

// Employee Portal URL - external domain
const EMPLOYEE_PORTAL_URL = 'https://team-auth.matrixo.in/employee-portal'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isBeta, setIsBeta] = useState(false)
  const [showMoreDropdown, setShowMoreDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [isEmployee, setIsEmployee] = useState(false)
  const [showMobileFeaturesDropdown, setShowMobileFeaturesDropdown] = useState(false)

  const { user, logout } = useAuth()
  const { profile } = useProfile()
  const pathname = usePathname()

  const displayName = (profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'User').trim()
  const firstName = displayName ? displayName.split(' ')[0] : 'User'

  useEffect(() => {
    setMounted(true)
    setIsBeta(true)
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock / unlock body scroll when mobile menu opens / closes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }
    return () => {
      document.body.classList.remove('mobile-menu-open')
    }
  }, [isOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Check if user is an employee in Firebase
  useEffect(() => {
    const checkIfEmployee = async () => {
      if (!user?.email) {
        setIsEmployee(false)
        return
      }

      try {
        const db = getFirestore()
        const employeesRef = collection(db, 'Employees')
        const q = query(employeesRef, where('email', '==', user.email))
        const querySnapshot = await getDocs(q)

        setIsEmployee(!querySnapshot.empty)
      } catch (error) {
        console.error('Error checking employee status:', error)
        setIsEmployee(false)
      }
    }

    checkIfEmployee()
  }, [user])

  useEffect(() => {
    if (!mounted) return

    // Check current state from DOM
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode, mounted])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      setShowUserDropdown(false)
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const handleLoginClick = () => setIsOpen(false)

  const closeMobileMenu = () => {
    setIsOpen(false)
    setShowMobileFeaturesDropdown(false)
  }

  return (
    <nav
      className="fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ease-in-out"
    >
      {/* ─── Pill navbar container ─── */}
      <div
        className={`container-custom mx-auto mt-3 sm:mt-4 px-4 sm:px-6 lg:px-10 py-1.5 sm:py-2 h-14 sm:h-16 max-w-6xl w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] rounded-full navbar-floating transition-all duration-300 ease-in-out relative isolate overflow-visible before:content-[''] before:absolute before:inset-0 before:rounded-full before:blur-2xl before:transition-all before:duration-300 before:opacity-40 dark:before:opacity-55 before:bg-white/60 dark:before:bg-blue-500/20 before:scale-110 before:transform before:pointer-events-none hover:before:opacity-55 dark:hover:before:opacity-65 ${scrolled ? 'navbar-floating-scrolled' : ''}`}
      >
        <div className="flex items-center justify-between w-full min-w-0 gap-2">

          {/* ─── Logo ─── */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                window.location.reload()
              }}
              className="flex items-center gap-2 group hover:opacity-80 transition-opacity flex-shrink-0 whitespace-nowrap"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative h-8 sm:h-10 w-auto flex-shrink-0"
              >
                {/* Light Mode Logo (Black) */}
                <img
                  src="/logos/logo-light.png"
                  alt="matriXO Logo"
                  className="h-8 sm:h-10 w-auto object-contain dark:hidden cursor-pointer"
                />
                {/* Dark Mode Logo (White) */}
                <img
                  src="/logos/logo-dark.png"
                  alt="matriXO Logo"
                  className="h-8 sm:h-10 w-auto object-contain hidden dark:block cursor-pointer"
                />
              </motion.div>
            </button>
          </div>

          {/* ─── Desktop / Tablet Navigation ─── */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 whitespace-nowrap min-w-0 flex-1 justify-center">
            <div className="flex items-center gap-6 lg:gap-8 whitespace-nowrap min-w-0 overflow-hidden">
              {navLinksBeforeFeatures.map((link, index) => {
                const isActive = link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname.startsWith(link.href + '/')
                const isDesktopOnly = link.name === 'About' || link.name === 'Team'
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className={isDesktopOnly ? 'hidden lg:block' : ''}
                  >
                    <Link
                      href={link.href}
                      className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {navLinksAfterFeatures.map((link, index) => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: (navLinksBeforeFeatures.length + index) * 0.05,
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className="hidden lg:block"
                >
                  <Link
                    href={link.href}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              )
            })}

            <div
              className="relative lg:hidden flex-shrink-0"
              onMouseEnter={() => setShowMoreDropdown(true)}
              onMouseLeave={() => setShowMoreDropdown(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                           whitespace-nowrap transition-all duration-300 ease-out px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
              >
                More
                <FaChevronDown className={`text-xs transition-transform duration-300 ease-out ${showMoreDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showMoreDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute top-full right-0 mt-2 w-44 glass-card-elevated overflow-hidden"
                  >
                    {tabletMoreLinks.map((link) => {
                      const isActive = link.href === '/'
                        ? pathname === '/'
                        : pathname === link.href || pathname.startsWith(link.href + '/')
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setShowMoreDropdown(false)}
                          className={`block px-4 py-2.5 text-sm transition-colors ${isActive
                            ? 'text-gray-900 dark:text-white bg-white/40 dark:bg-white/[0.06]'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-white/[0.06]'
                            }`}
                        >
                          {link.name}
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ─── Desktop / Tablet Actions ─── */}
          <div className="hidden md:flex items-center gap-4 whitespace-nowrap flex-shrink-0">
            {mounted && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm text-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-yellow-400 dark:hover:bg-white/10"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FaSun
                    size={18}
                    className="text-yellow-400"
                  />
                ) : (
                  <FaMoon size={18} className="text-gray-800" />
                )}
              </button>
            )}

            {/* User Profile or Login Button */}
            {user ? (
              <div
                className="relative"
                onMouseEnter={() => setShowUserDropdown(true)}
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-x-2 px-2.5 py-1 glass-card-thin text-gray-700 dark:text-gray-300 
                           rounded-full font-semibold text-sm min-w-0 max-w-[170px] whitespace-nowrap hover:scale-[1.02] transition-all duration-300"
                >
                  {profile?.profilePhoto ? (
                    <div className="w-7 h-7 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={profile.profilePhoto} alt="" width={28} height={28} className="object-cover w-full h-full rounded-xl" unoptimized />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[110px] truncate">{firstName}</span>
                </motion.button>

                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                      className="absolute right-0 mt-3 w-72 rounded-2xl bg-[#0A0F2C]/70 backdrop-blur-2xl backdrop-saturate-150 backdrop-brightness-75 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4 z-[999] isolate"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-[#0A0F2C]/40 -z-10" />

                      <div className="text-white font-semibold truncate">{displayName}</div>
                      <div className="text-gray-400 text-sm mb-3 truncate">
                        @{profile?.username || 'username'}
                      </div>

                      <div className="space-y-1.5">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 text-white transition"
                        >
                          <FaUser className="text-sm" />
                          <span>Profile</span>
                        </Link>
                        {isEmployee && (
                          <a
                            href={EMPLOYEE_PORTAL_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 text-purple-300 transition"
                          >
                            <FaIdBadge />
                            <span>Employee Portal</span>
                          </a>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                        >
                          <FaSignOutAlt />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex-shrink-0"
              >
                <Link
                  href="/auth"
                  onClick={handleLoginClick}
                  className="inline-flex items-center gap-x-2 px-3 py-1.5 glass-card-thin text-gray-700 dark:text-gray-300 
                           rounded-full font-semibold text-sm whitespace-nowrap hover:scale-[1.02] transition-all duration-300 flex-shrink-0"
                >
                  <FaUser className="text-sm" />
                  Login
                </Link>
              </motion.div>
            )}

            <Link href="/contact" className={talkWithUsClassName}>
              Talk With Us
            </Link>
          </div>

          {/* ─── Mobile Controls (hidden on md+) ─── */}
          <div className="flex md:hidden items-center gap-x-2 flex-shrink-0">
            {mounted && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm text-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-yellow-400 dark:hover:bg-white/10 flex-shrink-0"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <FaSun
                    size={16}
                    className="text-yellow-400"
                  />
                ) : (
                  <FaMoon size={16} className="text-gray-800" />
                )}
              </button>
            )}

            {user ? (
              <Link
                href="/profile"
                className="flex items-center gap-x-2 flex-shrink-0 p-1.5 rounded-full glass-card-thin text-gray-700 dark:text-gray-300"
                aria-label="Profile"
              >
                {profile?.profilePhoto ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <Image src={profile.profilePhoto} alt="" width={24} height={24} className="object-cover w-full h-full" unoptimized />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                )}
              </Link>
            ) : (
              <Link
                href="/auth"
                onClick={handleLoginClick}
                className="flex items-center gap-x-2 flex-shrink-0 p-2 rounded-full glass-card-thin text-gray-700 dark:text-gray-300"
                aria-label="Login"
              >
                <FaUser className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-200 flex-shrink-0"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FaTimes className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FaBars className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu Overlay ───────────────────────────────────────────
          Rendered OUTSIDE the pill so it gets a proper opaque background.
          Desktop (md+) never sees this — AnimatePresence + md:hidden guard.
      ──────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-[1050] bg-black/40 backdrop-blur-sm"
              onClick={closeMobileMenu}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.div
              key="mobile-drawer"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden fixed left-0 right-0 z-[1100] mobile-menu-drawer"
              style={{ top: 'calc(env(safe-area-inset-top, 0px) + 72px)' }}
            >
              <div className="mobile-menu-inner mx-3 rounded-2xl overflow-hidden">
                <div className="overflow-y-auto max-h-[calc(100dvh-100px)] px-4 py-4 space-y-1">

                  {/* ── Nav Links ── */}
                  {[...navLinksBeforeFeatures, ...navLinksAfterFeatures].map((link, index) => {
                    const isActive = link.href === '/'
                      ? pathname === '/'
                      : pathname === link.href || pathname.startsWith(link.href + '/')
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.2 }}
                      >
                        <Link
                          href={link.href}
                          onClick={closeMobileMenu}
                          className={`mobile-nav-item flex items-center px-4 rounded-xl transition-all duration-200 ease-out font-medium text-base ${isActive
                            ? 'bg-blue-500/15 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-white/[0.06]'
                            }`}
                        >
                          {link.name}
                        </Link>
                      </motion.div>
                    )
                  })}

                  {/* ── Features Accordion ── */}
                  {isBeta && (
                    <div className="pt-1">
                      <button
                        onClick={() => setShowMobileFeaturesDropdown(!showMobileFeaturesDropdown)}
                        className="mobile-nav-item w-full flex items-center justify-between px-4 rounded-xl text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-100/80 dark:hover:bg-white/[0.06] transition-colors"
                      >
                        <span>Features</span>
                        <FaChevronDown className={`text-xs transition-transform duration-200 ${showMobileFeaturesDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showMobileFeaturesDropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1 space-y-1 pl-2">
                              {betaLinks.map((link) => (
                                <Link
                                  key={link.name}
                                  href={link.href}
                                  onClick={closeMobileMenu}
                                  className="block px-4 py-3 bg-gray-100/60 dark:bg-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.08] 
                                           rounded-xl transition-colors"
                                >
                                  <div className="font-bold text-gray-900 dark:text-white text-sm mb-0.5">
                                    {link.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {link.description}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* ── Divider ── */}
                  <div className="border-t border-gray-200/60 dark:border-white/[0.08] !mt-3 !mb-2" />

                  {/* ── Auth / Profile Section ── */}
                  {user ? (
                    <div className="space-y-2 pt-1">
                      {/* Profile Card */}
                      <div className="px-4 py-3 bg-gray-100/70 dark:bg-white/[0.05] rounded-xl flex items-center gap-3">
                        {profile?.profilePhoto ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={profile.profilePhoto} alt="" className="object-cover w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {profile?.fullName || user.displayName || 'User'}
                          </p>
                          {profile?.username && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{profile.username}</p>
                          )}
                        </div>
                      </div>

                      {/* Profile Button */}
                      <Link
                        href="/profile"
                        onClick={closeMobileMenu}
                        className="mobile-nav-item flex items-center justify-center gap-2 w-full rounded-full glass-card-thin text-gray-700 dark:text-gray-300 font-semibold hover:scale-[1.01] transition-all duration-200"
                      >
                        <FaUser className="text-sm" />
                        Profile
                      </Link>

                      {/* Employee Portal */}
                      {isEmployee && (
                        <a
                          href={EMPLOYEE_PORTAL_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={closeMobileMenu}
                          className="mobile-nav-item flex items-center justify-center gap-2 w-full border-2 border-purple-500 text-purple-600 dark:text-purple-400 
                                   rounded-full font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                        >
                          <FaIdBadge className="text-sm flex-shrink-0" />
                          <span>Employee Portal</span>
                        </a>
                      )}

                      {/* Logout */}
                      <button
                        onClick={() => {
                          handleLogout()
                          closeMobileMenu()
                        }}
                        className="mobile-nav-item flex items-center justify-center gap-2 w-full border-2 border-red-500 text-red-600 dark:text-red-400 
                                 rounded-full font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                      >
                        <FaSignOutAlt className="text-sm flex-shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <Link
                        href="/auth"
                        onClick={closeMobileMenu}
                        className="mobile-nav-item flex items-center justify-center gap-2 w-full border-2 border-purple-500 text-purple-600 dark:text-purple-400 
                                 rounded-full font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                      >
                        <FaUser className="text-sm" />
                        Login
                      </Link>
                    </div>
                  )}

                  {/* ── Get Started CTA ── */}
                  <Link
                    href="/contact"
                    onClick={closeMobileMenu}
                    className="mobile-nav-item flex items-center justify-center w-full btn-primary rounded-full font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Get Started
                  </Link>

                  {/* Safe area bottom padding */}
                  <div className="h-safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
