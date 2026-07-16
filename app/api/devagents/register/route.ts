import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientKey } from '@/lib/security/rateLimit'

export const dynamic = 'force-dynamic'

// Set DEVAGENTS_GOOGLE_SCRIPT_URL in your .env.local / Vercel environment variables
const DEVAGENTS_SCRIPT_URL = process.env.DEVAGENTS_GOOGLE_SCRIPT_URL || ''

// Max accepted size for the base64 payment screenshot data URL (~4MB
// of raw image once base64 overhead is accounted for). Guards against
// oversized-payload abuse of both this route and the Apps Script.
const MAX_SCREENSHOT_CHARS = 6 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 registrations per minute per IP.
    const limit = rateLimit(`devagents:${clientKey(request)}`, 5, 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const body = await request.json()

    // ----------------------------------------------------------------
    // Destructure ONLY the exact fields the Apps Script expects.
    // Any legacy / misnamed fields from old callers are intentionally
    // ignored here so they never pollute the sheet columns.
    // ----------------------------------------------------------------
    const {
      fullName,
      email,
      phone,
      college,
      year,
      branch,
      city,
      github,
      linkedIn,
      experienceLevel,
      whyAttend,
      paymentScreenshot, // must be a Base64 Data URL, e.g. "data:image/jpeg;base64,..."
    }: {
      fullName: string
      email: string
      phone: string
      college: string
      year: string
      branch: string
      city: string
      github?: string
      linkedIn?: string
      experienceLevel: string
      whyAttend: string
      paymentScreenshot: string
    } = body

    // ----------------------------------------------------------------
    // Validate required fields
    // ----------------------------------------------------------------
    const missing = (
      [
        ['fullName', fullName],
        ['email', email],
        ['phone', phone],
        ['college', college],
        ['year', year],
        ['branch', branch],
        ['city', city],
        ['experienceLevel', experienceLevel],
        ['whyAttend', whyAttend],
        ['paymentScreenshot', paymentScreenshot],
      ] as [string, string | undefined][]
    )
      .filter(([, v]) => !v?.trim())
      .map(([k]) => k)

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    if (!paymentScreenshot.startsWith('data:image')) {
      return NextResponse.json(
        { error: 'paymentScreenshot must be a Base64 image Data URL (data:image/...)' },
        { status: 400 }
      )
    }

    if (paymentScreenshot.length > MAX_SCREENSHOT_CHARS) {
      return NextResponse.json(
        { error: 'Payment screenshot is too large. Please upload an image under 4MB.' },
        { status: 413 }
      )
    }

    if (!DEVAGENTS_SCRIPT_URL) {
      console.error('DEVAGENTS_GOOGLE_SCRIPT_URL environment variable is not set')
      return NextResponse.json(
        { error: 'Registration service is not configured. Please contact hello@matrixo.in' },
        { status: 503 }
      )
    }

    // ----------------------------------------------------------------
    // Build the EXACT payload the Apps Script expects.
    // Field names must match Apps Script column mapping 1-to-1.
    // ----------------------------------------------------------------
    const payload = {
      action: 'register',      // tells the Apps Script this is a new registration
      fullName,
      email,
      phone,
      college,
      year,
      branch,
      city,
      github: github?.trim() || '',
      linkedIn: linkedIn?.trim() || '',
      experienceLevel,
      whyAttend,
      paymentScreenshot,       // Base64 Data URL — Apps Script uploads this to Drive
    }

    console.log('[DevAgents] Forwarding registration for:', email)

    const scriptResponse = await fetch(DEVAGENTS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // Google Apps Script always returns 200; success/failure is in the JSON body
    const result = await scriptResponse.json()

    if (!result.success) {
      console.error('[DevAgents] Apps Script error:', result.error)
      return NextResponse.json(
        { error: result.error || 'Registration failed. Please try again.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      entryNumber: result.entryNumber || result.registrationNumber || '',
      message: result.message || 'Registration successful! Check your email for confirmation.',
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[DevAgents] Registration error:', msg)
    return NextResponse.json(
      { error: 'Registration failed. Please try again later.' },
      { status: 500 }
    )
  }
}
