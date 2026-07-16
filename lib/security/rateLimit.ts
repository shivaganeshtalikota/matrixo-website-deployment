// ============================================================
// Lightweight in-memory rate limiter for API routes.
//
// NOTE: State lives in the module scope of a single serverless
// instance, so limits are per-warm-instance, not globally shared.
// This meaningfully raises the cost of abuse (email bombing, spam)
// without external infra. For strict global limits, back this with
// Upstash/Redis — the call sites do not need to change.
// ============================================================

import { NextRequest } from 'next/server'

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Opportunistic cleanup so the Map cannot grow unbounded on a
// long-lived instance. Runs at most once per eviction interval.
let lastSweep = 0
const SWEEP_INTERVAL = 5 * 60 * 1000

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * Records a hit against `key` and reports whether it is within the
 * allowed budget of `limit` requests per `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
  }

  bucket.count++
  return { allowed: true, remaining: limit - bucket.count, retryAfterSeconds: 0 }
}

/**
 * Best-effort client IP extraction from proxy headers (Vercel sets
 * x-forwarded-for). Falls back to a constant so a missing header
 * still shares a bucket rather than bypassing the limit entirely.
 */
export function clientKey(request: NextRequest | Request): string {
  const h = request.headers
  const fwd = h.get('x-forwarded-for') || ''
  const ip = fwd.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  return ip
}
