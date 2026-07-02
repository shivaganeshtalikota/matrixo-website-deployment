import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service is not configured yet.' },
        { status: 503 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const body = await request.json()

    const {
      name,
      email,
      phone,
      college,
      year,
      branch,
      city,
      github,
      linkedin,
      experienceLevel,
      whyAttend,
      transactionCode,
      entryNumber,
      eventTitle = 'DevAgents 1.0',
      price = 199,
    } = body

    if (!name || !email || !transactionCode) {
      return NextResponse.json(
        { error: 'Missing required registration details.' },
        { status: 400 }
      )
    }

    const organizerEmail = process.env.DEVAGENTS_ORGANIZER_EMAIL || 'events@matrixo.in'
    const displayEntry = entryNumber || transactionCode

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'matriXO Events <onboarding@resend.dev>',
      to: [email],
      subject: `✅ Registration Received: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background:#f8fafc; color:#0f172a;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899); padding: 28px; border-radius: 20px; color: white; text-align: center;">
            <h1 style="margin:0; font-size: 28px;">Registration Received</h1>
            <p style="margin:10px 0 0; opacity: .95;">${eventTitle}</p>
          </div>
          <div style="background: white; border-radius: 20px; margin-top: 18px; padding: 24px; border: 1px solid #e2e8f0;">
            <p style="font-size: 16px; line-height: 1.6; margin-top:0;">Hi ${name},</p>
            <p style="font-size: 14px; line-height: 1.7; color:#334155;">We have received your registration and payment screenshot. Your request is now pending verification. Once approved, we’ll send a second email containing your QR code and entry number.</p>
            <div style="margin: 20px 0; padding: 16px; border-radius: 16px; background: #eff6ff; border: 1px solid #bfdbfe;">
              <p style="margin: 0 0 8px; font-weight: 700; color:#1d4ed8;">Entry Number</p>
              <p style="margin: 0; font-size: 18px; font-family: monospace; color:#0f172a;">${displayEntry}</p>
            </div>
            <div style="display:grid; gap:8px; font-size: 14px; color:#334155;">
              <p style="margin:0;"><strong>Phone:</strong> ${phone || '—'}</p>
              <p style="margin:0;"><strong>College:</strong> ${college || '—'}</p>
              <p style="margin:0;"><strong>Year:</strong> ${year || '—'}</p>
              <p style="margin:0;"><strong>Branch:</strong> ${branch || '—'}</p>
              <p style="margin:0;"><strong>City:</strong> ${city || '—'}</p>
              <p style="margin:0;"><strong>Fee:</strong> ₹${price}</p>
            </div>
            <p style="font-size: 13px; line-height: 1.6; color:#475569; margin-top: 18px;">If anything needs to be corrected, reply to this email before approval. Keep this mail handy for reference.</p>
          </div>
        </div>
      `,
    })

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'matriXO Events <onboarding@resend.dev>',
      to: [organizerEmail],
      subject: `New DevAgents Registration: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background:#fff; color:#0f172a;">
          <h2 style="margin-top:0;">New DevAgents Registration</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Entry Number:</strong> ${displayEntry}</p>
          <p><strong>Transaction Code:</strong> ${transactionCode}</p>
          <p><strong>Experience Level:</strong> ${experienceLevel || '—'}</p>
          <p><strong>Why Attend:</strong> ${whyAttend || '—'}</p>
          <p style="color:#64748b; font-size:12px;">Please verify payment, then call the approval endpoint to send the QR email.</p>
        </div>
      `,
      replyTo: email,
    })

    return NextResponse.json({ success: true, message: 'Receipt email sent.' })
  } catch (error) {
    console.error('DevAgents registration email error:', error)
    return NextResponse.json(
      { error: 'Failed to send registration receipt email.' },
      { status: 500 }
    )
  }
}
