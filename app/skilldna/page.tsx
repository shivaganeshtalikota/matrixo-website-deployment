'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useSkillDNA } from '@/hooks/useSkillDNA'
import OnboardingFlow from '@/components/skilldna/OnboardingFlow'
import SkillDNADashboard from '@/components/skilldna/SkillDNADashboard'
import AnalyzingScreen from '@/components/skilldna/AnalyzingScreen'
import FeatureSidebar from '@/components/features/FeatureSidebar'
import { OnboardingData, SkillLevel, TechnicalSkill, AcademicBackground, CareerGoal } from '@/lib/skilldna/types'
import { updateSkillDNAProfile, updateAcademicBackground, updateInterests, updateCareerGoals, editSkill } from '@/lib/skilldna/firestore-service'
import { getAllVerifications } from '@/lib/skilldna/verification/firestore-service'
import { motion } from 'framer-motion'
import { FaDna, FaExclamationTriangle, FaRedo } from 'react-icons/fa'

export default function SkillDNAPage() {
  const { user, loading: authLoading } = useAuth()
  const { 
    profile, 
    loading: skillLoading, 
    error,
    userData,
    onboardingComplete,
    initializeUser,
    submitOnboarding,
    refreshProfile,
    isGuest,
    updateGuestData,
  } = useSkillDNA()
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const pendingDataRef = useRef<OnboardingData | null>(null)
  const [authToken, setAuthToken] = useState<string>('')
  const [guestStarted, setGuestStarted] = useState(false)
  const wrapWithSidebar = (content: JSX.Element) => (
    <FeatureSidebar>{content}</FeatureSidebar>
  )

  // Refresh auth token
  useEffect(() => {
    if (user) {
      user.getIdToken().then(setAuthToken).catch(console.error)
    } else {
      setAuthToken('')
    }
  }, [user])

  // Load verification data into skills after profile loads
  const loadVerifications = useCallback(async () => {
    if (!user || !profile) return
    try {
      const verifications = await getAllVerifications(user.uid)
      if (Object.keys(verifications).length === 0) return

      // Merge verification data into skills
      let hasChanges = false
      const updatedSkills = profile.technicalSkills.map((skill) => {
        const key = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        const v = verifications[key]
        if (v) { hasChanges = true; return { ...skill, verification: v } }
        return skill
      })
      if (hasChanges) {
        await updateSkillDNAProfile(user.uid, { technicalSkills: updatedSkills }, 'profile_updated')
        await refreshProfile()
      }
    } catch (err) {
      console.error('Failed to load verifications:', err)
    }
  }, [user, profile, refreshProfile])

  useEffect(() => {
    if (profile && user) { loadVerifications() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.technicalSkills.length, user?.uid])

  // Score mapping for skill levels
  const levelScoreMap: Record<SkillLevel, number> = {
    beginner: 30,
    intermediate: 55,
    advanced: 75,
    expert: 90,
  }

  // Add a skill manually -> save directly to Firestore, then refresh
  const handleAddSkill = async (skill: { name: string; level: SkillLevel; category: string }) => {
    if (!profile) throw new Error('No profile available')

    const trimmedName = skill.name.trim()
    // Prevent duplicates (case-insensitive)
    const alreadyExists = profile.technicalSkills.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (alreadyExists) throw new Error(`"${trimmedName}" is already in your skill list`)

    const newSkill: TechnicalSkill = {
      name: trimmedName,
      score: levelScoreMap[skill.level],
      category: skill.category,
      trend: 'rising',
      lastAssessed: new Date().toISOString(),
    }

    const updatedSkills = [...profile.technicalSkills, newSkill]
    if (user) {
      await updateSkillDNAProfile(user.uid, { technicalSkills: updatedSkills }, 'skill_added')
      await refreshProfile()
      return
    }
    if (isGuest) {
      const updatedProfile = {
        ...profile,
        technicalSkills: updatedSkills,
        lastUpdated: new Date().toISOString(),
        version: (profile.version || 0) + 1,
      }
      await updateGuestData((data) => ({
        ...data,
        skillDNA: updatedProfile,
      }))
    }
  }

  // Remove a skill -> update Firestore, then refresh
  const handleRemoveSkill = async (skillName: string) => {
    if (!profile) throw new Error('No profile available')
    const updatedSkills = profile.technicalSkills.filter(
      (s) => s.name.toLowerCase() !== skillName.toLowerCase()
    )
    if (user) {
      await updateSkillDNAProfile(user.uid, { technicalSkills: updatedSkills }, 'skill_added')
      await refreshProfile()
      return
    }
    if (isGuest) {
      const updatedProfile = {
        ...profile,
        technicalSkills: updatedSkills,
        lastUpdated: new Date().toISOString(),
        version: (profile.version || 0) + 1,
      }
      await updateGuestData((data) => ({
        ...data,
        skillDNA: updatedProfile,
      }))
    }
  }

  // Update academic background
  const handleUpdateAcademic = async (academic: AcademicBackground) => {
    if (user) {
      await updateAcademicBackground(user.uid, academic)
      await refreshProfile()
      return
    }
    if (isGuest) {
      await updateGuestData((data) => ({
        ...data,
        profile: {
          ...data.profile,
          education: academic,
        },
      }))
    }
  }

  // Update interests
  const handleUpdateInterests = async (interests: string[]) => {
    if (user) {
      await updateInterests(user.uid, interests)
      await refreshProfile()
      return
    }
    if (isGuest) {
      await updateGuestData((data) => ({
        ...data,
        profile: {
          ...data.profile,
          interests,
        },
      }))
    }
  }

  // Update career goals
  const handleUpdateCareerGoal = async (goal: CareerGoal) => {
    if (user) {
      await updateCareerGoals(user.uid, goal)
      await refreshProfile()
      return
    }
    if (isGuest) {
      await updateGuestData((data) => ({
        ...data,
        profile: {
          ...data.profile,
          goals: goal,
        },
      }))
    }
  }

  // Regenerate AI persona by re-submitting saved onboarding data
  // Preserves manually-managed skills so they are not overwritten by AI output
  const handleRegeneratePersona = async () => {
    if (!userData?.onboardingData) throw new Error('No onboarding data found')

    // Snapshot current skills before regeneration overwrites the profile
    const preservedSkills = profile ? [...profile.technicalSkills] : []

    setIsAnalyzing(true)
    try {
      await submitOnboarding(userData.onboardingData)

      // Restore the user's actual skills after AI regeneration
        if (preservedSkills.length > 0) {
          if (user) {
            await updateSkillDNAProfile(user.uid, { technicalSkills: preservedSkills }, 'skills_restored')
            await refreshProfile()
          } else if (isGuest && profile) {
            const updatedProfile = {
              ...profile,
              technicalSkills: preservedSkills,
              lastUpdated: new Date().toISOString(),
              version: (profile.version || 0) + 1,
            }
            await updateGuestData((data) => ({
              ...data,
              skillDNA: updatedProfile,
            }))
          }
        }
    } catch (err: any) {
      console.error('Regeneration failed:', err)
      throw err
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Edit a skill (rename, change level/category)
  const handleEditSkill = async (oldName: string, updates: { name?: string; level?: SkillLevel; category?: string }) => {
    if (user) {
      await editSkill(user.uid, oldName, updates)
      await refreshProfile()
      return
    }
    if (isGuest && profile) {
      const updatedSkills = profile.technicalSkills.map((skill) => {
        if (skill.name.toLowerCase() !== oldName.toLowerCase()) return skill
        const nextName = updates.name?.trim() || skill.name
        const nextLevel = updates.level
        const nextScore = nextLevel ? levelScoreMap[nextLevel] : skill.score
        return {
          ...skill,
          name: nextName,
          score: nextScore,
          category: updates.category || skill.category,
          lastAssessed: new Date().toISOString(),
        }
      })
      const updatedProfile = {
        ...profile,
        technicalSkills: updatedSkills,
        lastUpdated: new Date().toISOString(),
        version: (profile.version || 0) + 1,
      }
      await updateGuestData((data) => ({
        ...data,
        skillDNA: updatedProfile,
      }))
    }
  }

  // Initialize user document when authenticated
  useEffect(() => {
    if (user && !initialized) {
      initializeUser()
        .then(() => setInitialized(true))
        .catch(console.error)
    }
  }, [user, initialized, initializeUser])

  // Handle onboarding completion
  const handleOnboardingComplete = async (data: OnboardingData) => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    pendingDataRef.current = data
    try {
      await submitOnboarding(data)
    } catch (err: any) {
      console.error('Onboarding failed:', err)
      setAnalysisError(err.message || 'AI analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Retry analysis with saved onboarding data
  const handleRetry = async () => {
    if (pendingDataRef.current) {
      await handleOnboardingComplete(pendingDataRef.current)
    }
  }

  // Loading state
  if (authLoading || skillLoading) {
    return wrapWithSidebar(
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <FaDna className="text-5xl text-purple-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Loading SkillDNA™...</p>
        </motion.div>
      </div>
    )
  }

  // Guest landing (no auth required)
  if (!user && !guestStarted && !onboardingComplete && !profile) {
    return wrapWithSidebar(
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <FaDna className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">SkillDNA™</h1>
          <p className="text-gray-400 mb-6">
            Discover your unique skill genome. Our AI analyzes your strengths and creates a personalized growth roadmap—no sign-in required.
          </p>
          <button
            onClick={() => setGuestStarted(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full hover:shadow-xl hover:shadow-purple-500/30 transition-all"
          >
            <FaDna />
            Start SkillDNA Analysis
          </button>
        </motion.div>
      </div>
    )
  }

  // AI is analyzing
  if (isAnalyzing) {
    return wrapWithSidebar(<AnalyzingScreen />)
  }

  // Analysis failed - show error with retry
  if (analysisError) {
    return wrapWithSidebar(
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <FaExclamationTriangle className="text-3xl text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Analysis Failed</h1>
          <p className="text-gray-400 mb-2">
            Your answers have been saved but the AI analysis couldn&apos;t complete.
          </p>
          <p className="text-red-400/80 text-sm mb-6 bg-red-500/10 px-4 py-2 rounded-lg inline-block">
            {analysisError}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full hover:shadow-xl hover:shadow-purple-500/30 transition-all"
            >
              <FaRedo />
              Retry Analysis
            </button>
            <button
              onClick={() => { setAnalysisError(null); pendingDataRef.current = null }}
              className="inline-flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Start Over
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Onboarding saved but profile missing (recovery from previous failed attempt)
  if (onboardingComplete && !profile) {
    return wrapWithSidebar(
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-blue-950/20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <FaDna className="text-3xl text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Almost There!</h1>
          <p className="text-gray-400 mb-6">
            Your onboarding data is saved but the AI analysis hasn&apos;t completed yet. 
            Click below to generate your SkillDNA profile.
          </p>
          <button
            onClick={async () => {
              const savedData = userData?.onboardingData
              if (savedData) {
                await handleOnboardingComplete(savedData)
              } else {
                setAnalysisError('No onboarding data found. Please start over.')
              }
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full hover:shadow-xl hover:shadow-purple-500/30 transition-all"
          >
            <FaRedo />
            Generate SkillDNA™
          </button>
        </motion.div>
      </div>
    )
  }

  // Show dashboard if onboarding is complete and profile exists
  if (onboardingComplete && profile) {
    return wrapWithSidebar(
      <SkillDNADashboard
        profile={profile}
        userName={user?.displayName || userData?.profile?.name || undefined}
        onRefresh={refreshProfile}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
        onEditSkill={handleEditSkill}
        onUpdateAcademic={handleUpdateAcademic}
        onUpdateInterests={handleUpdateInterests}
        onUpdateCareerGoal={handleUpdateCareerGoal}
        onRegeneratePersona={handleRegeneratePersona}
        currentAcademic={userData?.profile?.education}
        currentInterests={userData?.profile?.interests}
        currentCareerGoal={userData?.profile?.goals}
        userId={user?.uid}
        authToken={authToken}
        onVerificationComplete={loadVerifications}
      />
    )
  }

  // Show onboarding flow
  return wrapWithSidebar(
    <OnboardingFlow
      onComplete={handleOnboardingComplete}
      userName={user?.displayName || userData?.profile?.name || undefined}
    />
  )
}
