import { NextRequest, NextResponse } from 'next/server'
import webPush from 'web-push'
import { rateLimit, clientKey } from '@/lib/security/rateLimit'

export const dynamic = 'force-dynamic'

// Defense-in-depth caps. NOTE: this endpoint is still callable by any
// client because the notification flow invokes it from the browser with
// subscriptions in the body (see lib/notificationUtils.ts). The correct
// fix is to verify a Firebase ID token and resolve subscriptions
// server-side via the Admin SDK so callers cannot target arbitrary
// devices with arbitrary payloads. Until then these limits blunt abuse.
const MAX_SUBSCRIPTIONS = 500
const MAX_TITLE_LEN = 200
const MAX_BODY_LEN = 1000

// Configure VAPID details
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = 'mailto:admin@matrixo.in'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: {
    url?: string
    type?: string
    [key: string]: any
  }
}

interface SubscriptionDoc {
  employeeId: string
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  }
  endpoint: string
}

/**
 * POST /api/push/send
 * 
 * Sends push notifications to specified employee subscriptions.
 * Called internally by the notification creation flow.
 * 
 * Body: {
 *   subscriptions: SubscriptionDoc[]  - Array of push subscription docs from Firestore
 *   payload: PushPayload              - The notification content
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit per IP to cap fan-out abuse.
    const limit = rateLimit(`push-send:${clientKey(request)}`, 30, 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'VAPID keys not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { subscriptions, payload } = body as {
      subscriptions: SubscriptionDoc[]
      payload: PushPayload
    }

    if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No subscriptions provided' },
        { status: 400 }
      )
    }

    if (subscriptions.length > MAX_SUBSCRIPTIONS) {
      return NextResponse.json(
        { error: 'Too many subscriptions in a single request' },
        { status: 400 }
      )
    }

    if (!payload || typeof payload.title !== 'string' || !payload.title.trim()) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }

    // Cap free-text fields so a caller cannot ship huge payloads.
    payload.title = payload.title.slice(0, MAX_TITLE_LEN)
    if (typeof payload.body === 'string') {
      payload.body = payload.body.slice(0, MAX_BODY_LEN)
    }

    // Prepare the push payload
    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body || '',
      icon: payload.icon || '/logos/logo-dark.png',
      badge: payload.badge || '/logos/logo-dark.png',
      tag: payload.tag || `notification-${Date.now()}`,
      data: {
        url: payload.data?.url || '/employee-portal',
        ...payload.data
      }
    })

    const pushOptions: webPush.RequestOptions = {
      TTL: 60 * 60, // 1 hour TTL
      urgency: 'high' as const
    }

    // Send to all subscriptions, track results
    const results = await Promise.allSettled(
      subscriptions.map(async (subDoc) => {
        const pushSubscription = {
          endpoint: subDoc.subscription.endpoint,
          keys: subDoc.subscription.keys
        }

        try {
          await webPush.sendNotification(pushSubscription, pushPayload, pushOptions)
          return { success: true, employeeId: subDoc.employeeId }
        } catch (error: any) {
          // 410 Gone or 404 means subscription is expired/invalid
          if (error?.statusCode === 410 || error?.statusCode === 404) {
            console.log(`[Push] Subscription expired for ${subDoc.employeeId}, should be cleaned up`)
            return { success: false, employeeId: subDoc.employeeId, expired: true, error: error?.message }
          }
          console.error(`[Push] Failed to send to ${subDoc.employeeId}:`, error?.message)
          return { success: false, employeeId: subDoc.employeeId, error: error?.message }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length
    const failed = results.length - successful
    const expired = results.filter(r => r.status === 'fulfilled' && (r.value as any).expired).length

    // Collect expired subscription doc IDs for cleanup
    const expiredEmployees = results
      .filter(r => r.status === 'fulfilled' && (r.value as any).expired)
      .map(r => (r as PromiseFulfilledResult<any>).value.employeeId)

    console.log(`[Push] Sent: ${successful}, Failed: ${failed}, Expired: ${expired}`)

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      expired,
      expiredEmployees
    })

  } catch (error: any) {
    console.error('[Push API] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
