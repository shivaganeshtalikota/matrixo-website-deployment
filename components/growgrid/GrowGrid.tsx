'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaRocket,
  FaCode,
  FaPalette,
  FaChartLine,
  FaMicrophone,
  FaLock,
  FaCheckCircle,
  FaPlay,
  FaClock,
  FaStar,
  FaTrophy,
  FaCrown,
  FaRegCircle,
} from 'react-icons/fa'
import Link from 'next/link'
import { toast } from 'sonner'
import HeadingHighlight from '@/components/HeadingHighlight'
import { useAuth } from '@/lib/AuthContext'
import { GROWGRID_PATHS, totalModuleCount } from '@/lib/growgrid/content'
import {
  subscribeToProgress,
  getOrCreateProgress,
  setModuleProgress,
} from '@/lib/growgrid/firestore-service'
import { GrowGridProgressDoc, levelFromXP, xpIntoLevel, XP_PER_LEVEL } from '@/lib/growgrid/types'
import { subscribeToEntitlement } from '@/lib/entitlements/service'
import UpgradeModal from '@/components/premium/UpgradeModal'

const ICONS = { code: FaCode, palette: FaPalette, chart: FaChartLine, mic: FaMicrophone, rocket: FaRocket }
const difficultyColors = {
  beginner: 'bg-green-500',
  intermediate: 'bg-yellow-500',
  advanced: 'bg-red-500',
}

export default function GrowGrid() {
  const { user, loading: authLoading } = useAuth()
  const [selectedPath, setSelectedPath] = useState(GROWGRID_PATHS[0].id)
  const [progress, setProgress] = useState<GrowGridProgressDoc | null>(null)
  const [entitled, setEntitled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [busyModule, setBusyModule] = useState<string | null>(null)

  const currentPath = GROWGRID_PATHS.find((p) => p.id === selectedPath)!

  // Load persisted progress + entitlement (live).
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    let unsubProgress = () => {}
    let unsubEnt = () => {}
    getOrCreateProgress(user.uid)
      .then(() => {
        unsubProgress = subscribeToProgress(user.uid, (doc) => {
          setProgress(doc)
          setLoading(false)
        })
        unsubEnt = subscribeToEntitlement(user.uid, 'growgrid', ({ entitled }) => setEntitled(entitled))
      })
      .catch(() => {
        setLoading(false)
        toast.error('Could not load your learning progress.')
      })
    return () => {
      unsubProgress()
      unsubEnt()
    }
  }, [user, authLoading])

  const stats = useMemo(() => {
    const totalXP = progress?.totalXP ?? 0
    const completed = progress
      ? Object.values(progress.moduleProgress).filter((m) => m.status === 'completed').length
      : 0
    const hours = Math.round(((progress?.learningMinutes ?? 0) / 60) * 10) / 10
    return {
      totalXP,
      level: levelFromXP(totalXP),
      intoLevel: xpIntoLevel(totalXP),
      completed,
      hours,
    }
  }, [progress])

  const moduleState = (moduleId: string, tier: 'free' | 'premium') => {
    const mp = progress?.moduleProgress[moduleId]
    const locked = tier === 'premium' && !entitled
    return {
      locked,
      completed: mp?.status === 'completed',
      progress: mp?.progress ?? 0,
      checkedLessons: mp ? Math.round((mp.progress / 100) * 100) : 0,
    }
  }

  const handleLessonToggle = async (
    moduleId: string,
    lessonIndex: number,
    lessonCount: number,
    currentProgress: number
  ) => {
    if (!user) return
    const currentChecked = Math.round((currentProgress / 100) * lessonCount)
    // Sequential check/uncheck: clicking an already-checked lesson unchecks
    // down to it; clicking an unchecked lesson checks up to and including it.
    const nextChecked = lessonIndex < currentChecked ? lessonIndex : lessonIndex + 1
    const nextProgress = Math.round((nextChecked / lessonCount) * 100)
    setBusyModule(moduleId)
    try {
      await setModuleProgress(user.uid, moduleId, nextProgress)
      if (nextProgress >= 100) toast.success('Module complete! XP awarded 🎉')
    } catch {
      toast.error('Could not save progress.')
    } finally {
      setBusyModule(null)
    }
  }

  const handleModuleClick = (moduleId: string, locked: boolean) => {
    if (locked) {
      setShowUpgrade(true)
      return
    }
    setExpanded((prev) => (prev === moduleId ? null : moduleId))
  }

  // ---- Not signed in ----
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="glass-card max-w-md w-full p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-3xl">
            <FaRocket />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your learning journey awaits
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sign in to track progress, earn XP, and unlock adaptive learning paths.
          </p>
          <Link href="/auth" className="btn-primary inline-block">
            Sign in to start
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20 py-20">
      <div className="container-custom px-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full mb-4">
            <FaRocket className="animate-bounce" />
            <span className="font-bold">GrowGrid™ Learning Paths</span>
            {entitled && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                <FaCrown className="text-amber-300" /> Premium
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <HeadingHighlight text="Your Adaptive Learning Journey" />
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Personalized micro-modules that adapt to your pace and style
          </p>
        </motion.div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard delay={0.1} icon={<FaTrophy className="text-3xl text-yellow-500" />} value={`Level ${stats.level}`} label="Current Level">
            <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: `${(stats.intoLevel / XP_PER_LEVEL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats.intoLevel}/{XP_PER_LEVEL} XP to next level</p>
          </StatCard>
          <StatCard delay={0.2} icon={<FaStar className="text-3xl text-purple-500" />} value={loading ? '—' : String(stats.totalXP)} label="Total XP Earned" />
          <StatCard delay={0.3} icon={<FaCheckCircle className="text-3xl text-green-500" />} value={loading ? '—' : `${stats.completed}/${totalModuleCount()}`} label="Modules Completed" />
          <StatCard delay={0.4} icon={<FaClock className="text-3xl text-blue-500" />} value={loading ? '—' : `${stats.hours}h`} label="Learning Time" />
        </div>

        {/* Premium banner (only if not entitled) */}
        {!entitled && !loading && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowUpgrade(true)}
            className="group mb-12 w-full overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 p-6 text-left transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xl">
                  <FaCrown />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Unlock GrowGrid Premium</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Every path, every advanced module, and completion certificates.</p>
                </div>
              </div>
              <span className="btn-primary shrink-0 hidden sm:inline-flex">Upgrade ₹499</span>
            </div>
          </motion.button>
        )}

        {/* Learning Paths Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <HeadingHighlight text="Choose Your Path" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GROWGRID_PATHS.map((path, index) => {
              const Icon = ICONS[path.iconKey]
              const done = path.modules.filter((m) => progress?.moduleProgress[m.id]?.status === 'completed').length
              const pct = (done / path.modules.length) * 100
              return (
                <motion.button
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => setSelectedPath(path.id)}
                  className={`text-left p-6 rounded-2xl transition-all duration-300 ${
                    selectedPath === path.id
                      ? 'bg-white/70 dark:bg-white/[0.05] backdrop-blur-md shadow-2xl scale-[1.03] ring-2 ring-indigo-400/40'
                      : 'bg-white/50 dark:bg-gray-800/40 shadow-lg hover:shadow-xl hover:scale-[1.01]'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center text-white text-2xl mb-4`}>
                    <Icon />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    <HeadingHighlight text={path.name} />
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{path.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-bold text-gray-900 dark:text-white">{done}/{path.modules.length}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${path.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>⏱️ {path.estimatedTime}</span>
                      <span>⭐ {path.modules.reduce((s, m) => s + m.xp, 0)} XP</span>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Current Path Modules */}
        <motion.div
          key={selectedPath}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/50 dark:bg-white/[0.03] backdrop-blur-md rounded-3xl shadow-2xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            <HeadingHighlight text={`${currentPath.name} Modules`} />
          </h2>

          <div className="space-y-4">
            {currentPath.modules.map((module, index) => {
              const Icon = ICONS[currentPath.iconKey]
              const st = moduleState(module.id, module.tier)
              const isOpen = expanded === module.id
              const checkedCount = Math.round((st.progress / 100) * module.lessons.length)
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative rounded-2xl border-2 transition-all duration-300 ${
                    st.locked
                      ? 'border-amber-300/40 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/[0.04]'
                      : st.completed
                      ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                      : 'border-indigo-300 dark:border-indigo-700/60 bg-indigo-50 dark:bg-indigo-900/20 hover:shadow-xl'
                  }`}
                >
                  <button
                    onClick={() => handleModuleClick(module.id, st.locked)}
                    className="flex w-full items-start gap-4 p-6 text-left"
                  >
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl shrink-0 ${
                      st.locked ? 'bg-gradient-to-br from-amber-400 to-orange-500' : `bg-gradient-to-br ${currentPath.color}`
                    }`}>
                      {st.locked ? <FaLock /> : st.completed ? <FaCheckCircle /> : <Icon />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {module.title}
                          {module.tier === 'premium' && (
                            <FaCrown className="text-amber-500 text-sm" title="Premium" />
                          )}
                        </h3>
                        {!st.locked && !st.completed && (
                          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-full shrink-0">
                            <FaPlay />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{module.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1"><FaClock /> {module.duration}</span>
                        <span className={`px-2 py-1 rounded-full text-white text-xs font-bold ${difficultyColors[module.difficulty]}`}>
                          {module.difficulty}
                        </span>
                        <span className="flex items-center gap-1"><FaStar className="text-yellow-500" /> {module.xp} XP</span>
                      </div>

                      {!st.locked && st.progress > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span className="font-bold">{st.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div className={`h-full bg-gradient-to-r ${currentPath.color}`} initial={{ width: 0 }} animate={{ width: `${st.progress}%` }} transition={{ duration: 0.6 }} />
                          </div>
                        </div>
                      )}

                      {st.locked && (
                        <p className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400">
                          🔒 Premium module — tap to unlock
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Lesson checklist */}
                  <AnimatePresence>
                    {isOpen && !st.locked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-200/60 dark:border-white/10"
                      >
                        <div className="p-6 space-y-2">
                          {module.lessons.map((lesson, li) => {
                            const checked = li < checkedCount
                            return (
                              <button
                                key={lesson}
                                disabled={busyModule === module.id}
                                onClick={() => handleLessonToggle(module.id, li, module.lessons.length, st.progress)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/5 disabled:opacity-60"
                              >
                                {checked ? (
                                  <FaCheckCircle className="text-green-500 shrink-0" />
                                ) : (
                                  <FaRegCircle className="text-gray-400 shrink-0" />
                                )}
                                <span className={`text-sm ${checked ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                                  {lesson}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <UpgradeModal product="growgrid" open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  )
}

function StatCard({
  delay,
  icon,
  value,
  label,
  children,
}: {
  delay: number
  icon: React.ReactNode
  value: string
  label: string
  children?: React.ReactNode
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card p-6">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      {children}
    </motion.div>
  )
}
