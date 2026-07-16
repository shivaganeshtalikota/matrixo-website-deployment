import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/firebaseConfig'
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { randomInt } from 'crypto'
import { isValidEmail } from '@/lib/security/sanitize'
import { rateLimit, clientKey } from '@/lib/security/rateLimit'

export const dynamic = 'force-dynamic'

function generateOTP(): string {
  // Cryptographically secure 6-digit code (avoid Math.random for secrets)
  return randomInt(100000, 1000000).toString()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, action, otp: inputOtp } = body

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    // Rate limit both the sending and verifying paths. Sending is
    // capped hard per-IP AND per-target-email so the endpoint cannot
    // be used to bomb a victim's inbox or burn the Resend quota.
    const emailKey = email.toLowerCase()
    if (action !== 'verify') {
      const ipLimit = rateLimit(`otp-send-ip:${clientKey(request)}`, 5, 10 * 60 * 1000)
      const toLimit = rateLimit(`otp-send-to:${emailKey}`, 3, 10 * 60 * 1000)
      if (!ipLimit.allowed || !toLimit.allowed) {
        const retry = Math.max(ipLimit.retryAfterSeconds, toLimit.retryAfterSeconds)
        return NextResponse.json(
          { error: 'Too many verification requests. Please wait before requesting another code.' },
          { status: 429, headers: { 'Retry-After': String(retry) } }
        )
      }
    } else {
      const verifyLimit = rateLimit(`otp-verify:${clientKey(request)}`, 10, 10 * 60 * 1000)
      if (!verifyLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many attempts. Please wait and try again.' },
          { status: 429, headers: { 'Retry-After': String(verifyLimit.retryAfterSeconds) } }
        )
      }
    }

    // action can be 'send' or 'verify'
    if (action === 'verify') {
      // Get stored OTP from Firestore
      const otpRef = doc(db, 'EmailOTPs', email.toLowerCase())
      const otpDoc = await getDoc(otpRef)
      
      if (!otpDoc.exists()) {
        return NextResponse.json({ error: 'OTP expired or not found. Please request a new one.' }, { status: 400 })
      }

      const storedData = otpDoc.data()
      const now = Date.now()

      // Check expiry (10 minutes)
      if (now - storedData.createdAt > 10 * 60 * 1000) {
        await deleteDoc(otpRef)
        return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
      }

      // Check attempts (max 5)
      if (storedData.attempts >= 5) {
        await deleteDoc(otpRef)
        return NextResponse.json({ error: 'Too many failed attempts. Please request a new OTP.' }, { status: 400 })
      }

      if (storedData.otp !== inputOtp) {
        // Increment attempts
        await setDoc(otpRef, { ...storedData, attempts: storedData.attempts + 1 })
        return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 })
      }

      // OTP verified - delete it
      await deleteDoc(otpRef)
      return NextResponse.json({ success: true, verified: true })
    }

    // Default: send OTP
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const otp = generateOTP()

    // Store OTP in Firestore
    const otpRef = doc(db, 'EmailOTPs', email.toLowerCase())
    await setDoc(otpRef, {
      otp,
      email: email.toLowerCase(),
      createdAt: Date.now(),
      attempts: 0,
    })

    // Send OTP email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'matriXO <onboarding@resend.dev>',
      to: [email],
      subject: 'Your matriXO Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3b82f6; margin: 0;">matriXO</h1>
            <p style="color: #6b7280; margin-top: 5px;">Email Verification</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 3px; border-radius: 16px;">
            <div style="background: #1f2937; border-radius: 14px; padding: 30px; text-align: center;">
              <p style="color: #d1d5db; margin: 0 0 15px 0; font-size: 16px;">Your verification code is:</p>
              <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ffffff; background: #374151; padding: 15px 25px; border-radius: 12px; display: inline-block;">
                ${otp}
              </div>
              <p style="color: #9ca3af; margin: 20px 0 0 0; font-size: 13px;">
                This code expires in 10 minutes
              </p>
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })
  } catch (error) {
    console.error('OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to process OTP request' },
      { status: 500 }
    )
  }
}
