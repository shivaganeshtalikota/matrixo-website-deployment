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

    const { name, email, entryNumber } = body

    if (!name || !email || !entryNumber) {
      return NextResponse.json(
        { error: 'Missing required approval details.' },
        { status: 400 }
      )
    }

    const response = await fetch(DEVAGENTS_GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'approveRegistration',
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
        : { success: response.ok, message: raw || 'Approval forwarded to Google Apps Script.' },
      { status: response.ok ? 200 : response.status }
    )
  } catch (error) {
    console.error('DevAgents approval proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to forward approval to Google Apps Script.' },
      { status: 500 }
    )
  }
}
