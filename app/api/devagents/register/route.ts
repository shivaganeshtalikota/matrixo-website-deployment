import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const scriptUrl = process.env.DEVAGENTS_GOOGLE_SCRIPT_URL

    if (!scriptUrl) {
      console.error('Error: DEVAGENTS_GOOGLE_SCRIPT_URL is not configured in environment variables.')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Registration service is currently undergoing maintenance. Please contact hello@matrixo.in.' 
        },
        { status: 503 }
      )
    }

    const body = await request.json()
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
      paymentScreenshot
    } = body

    // Validation
    if (!fullName || !email || !phone || !college || !year || !branch || !city || !experienceLevel || !whyAttend || !paymentScreenshot) {
      return NextResponse.json(
        { success: false, error: 'All fields including payment screenshot are required.' },
        { status: 400 }
      )
    }

    console.log(`Forwarding registration to Google Apps Script for email: ${email}`)

    // Forward registration payload to Google Apps Script
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
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
        paymentScreenshot
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Apps Script responded with error status:', response.status, errorText)
      throw new Error('Google Apps Script failed to process registration.')
    }

    const result = await response.json()
    console.log('Google Apps Script response:', result)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Google Sheet submission failed.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      entryNumber: result.entryNumber,
      message: 'Registration successful!'
    })

  } catch (error: any) {
    console.error('Proxy registration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected error occurred while processing registration. Please try again later.' 
      },
      { status: 500 }
    )
  }
}
