import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml, isValidEmail, clampText } from '@/lib/security/sanitize'
import { rateLimit, clientKey } from '@/lib/security/rateLimit'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Rate limit: 5 submissions per minute per IP (anti-spam)
    const limit = rateLimit(`contact:${clientKey(request)}`, 5, 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured. Please contact us directly at hello@matrixo.in' },
        { status: 503 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const body = await request.json()

    // Validate + clamp before use
    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 }
      )
    }
    const name = clampText(body.name, 120)
    const email = body.email.trim()
    const phone = clampText(body.phone, 30)
    const subject = clampText(body.subject, 160)
    const message = clampText(body.message, 5000)

    // Validate required fields
    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Send email using Resend
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'matriXO Contact Form <onboarding@resend.dev>',
      to: ['hello@matrixo.in'],
      subject: `New Contact Form: ${subject || 'No Subject'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ''}
            <p><strong>Subject:</strong> ${escapeHtml(subject || 'No Subject')}</p>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; color: #4b5563;">${escapeHtml(message)}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This email was sent from the matriXO website contact form.</p>
            <p>Reply directly to this email to contact: ${escapeHtml(email)}</p>
          </div>
        </div>
      `,
      replyTo: email,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
