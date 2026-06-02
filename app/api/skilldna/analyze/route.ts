// ============================================================
// SkillDNA™ AI Analysis API Route
// POST /api/skilldna/analyze
// Calls OpenRouter AI to generate SkillDNA profile
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { analyzeUserProfile, generateMockProfile } from '@/lib/skilldna/ai-engine';
import { AIAnalysisRequest } from '@/lib/skilldna/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Vercel Hobby plan max is 10s

// Rate limiting: simple in-memory store
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;            // Max requests per window
const RATE_WINDOW = 60 * 1000;   // 1 minute window

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Input sanitization to prevent prompt injection
function sanitizeInput(text: string): string {
  // Remove potential prompt injection patterns
  return text
    .replace(/```/g, '')
    .replace(/\bignore\b.*\binstructions?\b/gi, '[FILTERED]')
    .replace(/\bsystem\b.*\bprompt\b/gi, '[FILTERED]')
    .replace(/\bforget\b.*\babove\b/gi, '[FILTERED]')
    .slice(0, 5000); // Limit length
}

function sanitizeOnboardingData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid onboarding data');
  }

  return {
    ...data,
    pastExperience: sanitizeInput(String(data.pastExperience || '')),
    currentSituation: sanitizeInput(String(data.currentSituation || '')),
    futureAspiration: sanitizeInput(String(data.futureAspiration || '')),
    academic: {
      ...data.academic,
      degree: sanitizeInput(String(data.academic?.degree || '')),
      field: sanitizeInput(String(data.academic?.field || '')),
      institution: sanitizeInput(String(data.academic?.institution || '')),
      year: sanitizeInput(String(data.academic?.year || '')),
    },
    careerGoals: {
      ...data.careerGoals,
      shortTerm: sanitizeInput(String(data.careerGoals?.shortTerm || '')),
      midTerm: sanitizeInput(String(data.careerGoals?.midTerm || '')),
      longTerm: sanitizeInput(String(data.careerGoals?.longTerm || '')),
      dreamRole: sanitizeInput(String(data.careerGoals?.dreamRole || '')),
    },
    interests: Array.isArray(data.interests) 
      ? data.interests.map((i: any) => sanitizeInput(String(i))).slice(0, 20)
      : [],
    skills: Array.isArray(data.skills) 
      ? data.skills.slice(0, 30).map((s: any) => ({
          ...s,
          name: sanitizeInput(String(s.name || '')),
          category: sanitizeInput(String(s.category || '')),
        }))
      : [],
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY;

    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const clientIp = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || request.ip || 'guest';
    const rateLimitId = token ? token.slice(-16) : `guest_${clientIp}`;

    // Rate limit by token or IP (simple check)
    if (!checkRateLimit(rateLimitId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    
    if (!body.onboardingData) {
      return NextResponse.json(
        { error: 'Missing onboarding data' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedData = sanitizeOnboardingData(body.onboardingData);

    // If no API key, use local fallback profile generator
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not set — using fallback mock profile generator');
      const fallbackResult = generateMockProfile(sanitizedData);
      return NextResponse.json({
        success: true,
        data: fallbackResult,
        fallback: true,
        timestamp: new Date().toISOString(),
      });
    }

    const analysisRequest: AIAnalysisRequest = {
      onboardingData: sanitizedData,
      existingProfile: body.existingProfile || undefined,
      assessmentHistory: body.assessmentHistory || undefined,
    };

    // Call AI engine
    const result = await analyzeUserProfile(analysisRequest, apiKey);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('SkillDNA Analysis API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        message: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
