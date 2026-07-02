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
      entryNumber,
      eventTitle = 'DevAgents 1.0',
      eventDate = '',
      price = 199,
    } = body

    if (!name || !email || !entryNumber) {
      return NextResponse.json(
        { error: 'Missing required approval details.' },
        { status: 400 }
      )
    }

    const qrCodeValue = String(body.qrCodeValue || entryNumber)
    const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrCodeValue)}`

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'matriXO Events <onboarding@resend.dev>',
      to: [email],
      subject: `✅ Approved: ${eventTitle} QR Code Inside`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background:#f8fafc; color:#0f172a;">
          <div style="background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899); padding: 28px; border-radius: 20px; color: white; text-align: center;">
            <h1 style="margin:0; font-size: 28px;">Your Entry Is Approved</h1>
            <p style="margin:10px 0 0; opacity: .95;">Show this QR code at the venue</p>
          </div>
          <div style="background: white; border-radius: 20px; margin-top: 18px; padding: 24px; border: 1px solid #e2e8f0; text-align:center;">
            <p style="font-size: 16px; line-height: 1.6; margin-top:0; text-align:left;">Hi ${name}, your registration for <strong>${eventTitle}</strong> has been approved.</p>
            <p style="text-align:left; font-size:14px; color:#334155;">Entry Number: <strong style="font-family: monospace;">${entryNumber}</strong></p>
            ${eventDate ? `<p style="text-align:left; font-size:14px; color:#334155;">Event Date: <strong>${eventDate}</strong></p>` : ''}
            <div style="display:inline-block; padding:16px; border-radius:18px; border: 1px solid #e2e8f0; background:#fff; margin: 10px 0 18px;">
              <img src="${qrImage}" alt="Approval QR Code" width="260" height="260" style="display:block; border-radius:12px;" />
            </div>
            <p style="font-size: 14px; color:#334155; line-height:1.7;">Our team will scan this QR code or verify your entry number at the venue. Please keep this email accessible on event day.</p>
            <div style="margin-top:18px; padding:16px; border-radius:16px; background:#eff6ff; border:1px solid #bfdbfe; text-align:left;">
              <p style="margin:0 0 8px; font-weight:700; color:#1d4ed8;">What to show at the venue</p>
              <p style="margin:0; font-family: monospace;">${entryNumber}</p>
            </div>
            <p style="font-size: 13px; color:#64748b; margin-top: 18px;">Ticket value: ₹${price}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'Approval email sent.' })
  } catch (error) {
    console.error('DevAgents approval email error:', error)
    return NextResponse.json(
      { error: 'Failed to send approval email.' },
      { status: 500 }
    )
  }
}
