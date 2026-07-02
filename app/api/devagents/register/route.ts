import { NextResponse } from 'next/server'

const DEVAGENTS_GOOGLE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_DEVAGENTS_GOOGLE_SCRIPT_URL || ''

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!DEVAGENTS_GOOGLE_SCRIPT_URL) {
      return NextResponse.json(
        { error: 'DevAgents Google Apps Script URL is not configured.' },
        { status: 503 }
      )
    }

    const body = await request.json()

    const { name, email, transactionCode } = body

    if (!name || !email || !transactionCode) {
      return NextResponse.json(
        { error: 'Missing required registration details.' },
        { status: 400 }
      )
    }

    const response = await fetch(DEVAGENTS_GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        ...body,
      }),
    })

    const raw = await response.text()
    let data: unknown = raw

    try {
      data = raw ? JSON.parse(raw) : {}
    } catch {
      // Keep raw response if the script returns plain text.
    }

    return NextResponse.json(
      typeof data === 'object' && data !== null
        ? data
        : { success: response.ok, message: raw || 'Registration forwarded to Google Apps Script.' },
      { status: response.ok ? 200 : response.status }
    )
  } catch (error) {
    console.error('DevAgents registration proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to forward registration to Google Apps Script.' },
      { status: 500 }
    )
  }
}
