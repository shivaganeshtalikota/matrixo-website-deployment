// ============================================================
// SkillDNA™ React Hook
// Client-side state management for SkillDNA operations
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebaseConfig';
import {
  SkillDNAProfile,
  SkillDNAUserDocument,
  OnboardingData,
  Assessment,
  ActivityType,
  SkillDNAVersion,
  AIAnalysisResponse,
} from '@/lib/skilldna/types';
import {
  getSkillDNAUser,
  hasCompletedOnboarding,
  createSkillDNAUser,
  saveOnboardingData,
  saveSkillDNAProfile,
  updateSkillDNAProfile,
  getSkillDNAProfile,
  getVersionHistory,
  saveAssessment,
  getAssessmentHistory,
  logActivity,
  getActivityLog,
} from '@/lib/skilldna/firestore-service';

interface UseSkillDNAReturn {
  // State
  userData: SkillDNAUserDocument | null;
  profile: SkillDNAProfile | null;
  loading: boolean;
  error: string | null;
  onboardingComplete: boolean;
  isGuest: boolean;

  // Onboarding
  initializeUser: () => Promise<void>;
  submitOnboarding: (data: OnboardingData) => Promise<AIAnalysisResponse>;

  // Profile
  refreshProfile: () => Promise<void>;
  triggerUpdate: (trigger: ActivityType, newData?: Record<string, any>) => Promise<void>;

  // Assessments
  submitAssessment: (assessment: Omit<Assessment, 'id' | 'userId'>) => Promise<void>;

  // History
  getHistory: () => Promise<SkillDNAVersion[]>;

  // Guest helpers
  updateGuestData: (updater: (data: SkillDNAUserDocument) => SkillDNAUserDocument) => Promise<void>;
}

const GUEST_SESSION_KEY = 'skilldna_guest_session';
const GUEST_DATA_KEY_PREFIX = 'skilldna_guest_data_';

function getGuestSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  let sessionId = window.sessionStorage.getItem(GUEST_SESSION_KEY);
  if (!sessionId) {
    const fallbackId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackId;
    window.sessionStorage.setItem(GUEST_SESSION_KEY, sessionId);
  }
  return sessionId;
}

function getGuestStorageKey(sessionId: string): string {
  return `${GUEST_DATA_KEY_PREFIX}${sessionId}`;
}

function getDefaultGuestData(): SkillDNAUserDocument {
  return {
    profile: {
      name: 'Guest',
      email: '',
      education: { degree: '', field: '', institution: '', year: '' },
      interests: [],
      goals: { shortTerm: '', midTerm: '', longTerm: '', dreamRole: '', targetIndustries: [] },
      role: 'student',
      createdAt: new Date().toISOString(),
      onboardingComplete: false,
    },
  };
}

function readGuestData(): SkillDNAUserDocument {
  const sessionId = getGuestSessionId();
  if (!sessionId) return getDefaultGuestData();
  const key = getGuestStorageKey(sessionId);
  const raw = window.sessionStorage.getItem(key);
  if (!raw) {
    const initial = getDefaultGuestData();
    window.sessionStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw) as SkillDNAUserDocument;
  } catch {
    const fallback = getDefaultGuestData();
    window.sessionStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeGuestData(data: SkillDNAUserDocument): void {
  const sessionId = getGuestSessionId();
  if (!sessionId) return;
  const key = getGuestStorageKey(sessionId);
  window.sessionStorage.setItem(key, JSON.stringify(data));
}

export function useSkillDNA(): UseSkillDNAReturn {
  const { user } = useAuth();
  const [userData, setUserData] = useState<SkillDNAUserDocument | null>(null);
  const [profile, setProfile] = useState<SkillDNAProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const isGuest = !user;

  // Get Firebase Auth token for API calls
  const getAuthToken = useCallback(async (): Promise<string> => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    return auth.currentUser.getIdToken();
  }, []);

  // Load user data on mount
  const loadUserData = useCallback(async () => {
    if (!user) {
      const guestData = readGuestData();
      setUserData(guestData);
      setProfile(guestData.skillDNA || null);
      setOnboardingComplete(guestData.profile?.onboardingComplete === true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getSkillDNAUser(user.uid);
      
      if (data) {
        setUserData(data);
        setProfile(data.skillDNA || null);
        setOnboardingComplete(data.profile?.onboardingComplete === true);
      } else {
        setUserData(null);
        setProfile(null);
        setOnboardingComplete(false);
      }
    } catch (err: any) {
      console.error('Error loading SkillDNA data:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Initialize user document in Firestore
  const initializeUser = useCallback(async () => {
    if (!user) {
      const guestData = readGuestData();
      setUserData(guestData);
      setProfile(guestData.skillDNA || null);
      setOnboardingComplete(guestData.profile?.onboardingComplete === true);
      return;
    }

    try {
      setError(null);
      await createSkillDNAUser(
        user.uid,
        user.displayName || 'User',
        user.email || '',
        'student'
      );
      await loadUserData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user, loadUserData]);

  // Submit onboarding data and get AI analysis
  const submitOnboarding = useCallback(async (data: OnboardingData): Promise<AIAnalysisResponse> => {
    if (!user) {
      try {
        setError(null);
        setLoading(true);

        const currentGuest = readGuestData();
        const updatedGuest: SkillDNAUserDocument = {
          ...currentGuest,
          onboardingData: data,
          profile: {
            ...currentGuest.profile,
            education: data.academic,
            interests: data.interests,
            goals: data.careerGoals,
            onboardingComplete: true,
            skillDNAVersion: 1,
          },
        };

        writeGuestData(updatedGuest);

        const response = await fetch('/api/skilldna/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ onboardingData: data }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Analysis failed');
        }

        const result = await response.json();
        const analysisData: AIAnalysisResponse = result.data;

        const { learningVelocityEstimate, ...profileFields } = analysisData;
        const skillDNAProfile: SkillDNAProfile = {
          ...profileFields,
          learningVelocity: learningVelocityEstimate,
          hiringReadiness: analysisData.hiringReadiness ?? 40,
          confidenceIndex: analysisData.confidenceIndex ?? 50,
          lastUpdated: new Date().toISOString(),
          version: 1,
        };

        const finalGuest: SkillDNAUserDocument = {
          ...updatedGuest,
          skillDNA: skillDNAProfile,
        };

        writeGuestData(finalGuest);
        setUserData(finalGuest);
        setProfile(skillDNAProfile);
        setOnboardingComplete(true);

        return analysisData;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }

    try {
      setError(null);
      setLoading(true);

      // Save onboarding data to Firestore
      await saveOnboardingData(user.uid, data);

      // Get auth token
      const token = await getAuthToken();

      // Call AI analysis API
      const response = await fetch('/api/skilldna/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ onboardingData: data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await response.json();
      const analysisData: AIAnalysisResponse = result.data;

      // Build full SkillDNA profile (exclude learningVelocityEstimate from spread)
      const { learningVelocityEstimate, ...profileFields } = analysisData;
      const skillDNAProfile: SkillDNAProfile = {
        ...profileFields,
        learningVelocity: learningVelocityEstimate,
        hiringReadiness: analysisData.hiringReadiness ?? 40,
        confidenceIndex: analysisData.confidenceIndex ?? 50,
        lastUpdated: new Date().toISOString(),
        version: 1,
      };

      // Save profile to Firestore
      await saveSkillDNAProfile(user.uid, skillDNAProfile);

      // Log activity
      await logActivity(user.uid, 'profile_updated', { trigger: 'initial_onboarding' });

      // Refresh local state
      await loadUserData();

      return analysisData;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, getAuthToken, loadUserData]);

  // Refresh profile from Firestore (silent — no loading spinner)
  const refreshProfile = useCallback(async () => {
    if (!user) {
      const guestData = readGuestData();
      setUserData(guestData);
      setProfile(guestData.skillDNA || null);
      setOnboardingComplete(guestData.profile?.onboardingComplete === true);
      return;
    }
    try {
      const data = await getSkillDNAUser(user.uid);
      if (data) {
        setUserData(data);
        setProfile(data.skillDNA || null);
        setOnboardingComplete(data.profile?.onboardingComplete === true);
      }
    } catch (err: any) {
      console.error('Silent refresh failed:', err);
    }
  }, [user]);

  // Trigger profile update (after assessment, skill add, etc.)
  const triggerUpdate = useCallback(async (
    trigger: ActivityType,
    newData: Record<string, any> = {}
  ) => {
    if (!user || !profile) throw new Error('No profile to update');

    try {
      setError(null);
      const token = await getAuthToken();

      const response = await fetch('/api/skilldna/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          currentProfile: profile,
          trigger,
          newData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }

      const result = await response.json();
      
      // Apply updates to Firestore
      if (result.data?.updatedFields) {
        await updateSkillDNAProfile(user.uid, result.data.updatedFields, trigger);
      }

      // Log activity
      await logActivity(user.uid, trigger, newData);

      // Refresh
      await loadUserData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user, profile, getAuthToken, loadUserData]);

  // Submit assessment and trigger recalculation
  const submitAssessment = useCallback(async (
    assessment: Omit<Assessment, 'id' | 'userId'>
  ) => {
    if (!user) {
      const currentGuest = readGuestData();
      const assessments = currentGuest.assessments ? { ...currentGuest.assessments } : {};
      const id = `guest_${Date.now()}`;
      const completedAt = assessment.completedAt ?? new Date().toISOString();
      assessments[id] = {
        id,
        userId: 'guest',
        ...assessment,
        completedAt,
      };
      const updatedGuest = {
        ...currentGuest,
        assessments,
      };
      writeGuestData(updatedGuest);
      setUserData(updatedGuest);
      return;
    }

    try {
      const assessmentId = await saveAssessment(user.uid, assessment);
      
      // Trigger profile update
      await triggerUpdate('assessment_completed', {
        assessmentId,
        assessment,
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [user, triggerUpdate]);

  // Get version history
  const getHistory = useCallback(async (): Promise<SkillDNAVersion[]> => {
    if (!user) return [];
    return getVersionHistory(user.uid);
  }, [user]);

  const updateGuestData = useCallback(async (
    updater: (data: SkillDNAUserDocument) => SkillDNAUserDocument
  ) => {
    if (!isGuest) return;
    const current = readGuestData();
    const updated = updater(current);
    writeGuestData(updated);
    setUserData(updated);
    setProfile(updated.skillDNA || null);
    setOnboardingComplete(updated.profile?.onboardingComplete === true);
  }, [isGuest]);

  return {
    userData,
    profile,
    loading,
    error,
    onboardingComplete,
    isGuest,
    initializeUser,
    submitOnboarding,
    refreshProfile,
    triggerUpdate,
    submitAssessment,
    getHistory,
    updateGuestData,
  };
}
