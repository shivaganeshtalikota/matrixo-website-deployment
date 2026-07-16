// ============================================================
// HTML escaping for user-controlled values interpolated into
// server-generated HTML email bodies. Prevents HTML/script
// injection and email-based phishing via crafted form input.
// ============================================================

/**
 * Escapes the five HTML-significant characters so a user-supplied
 * string can be safely placed inside an HTML email template.
 * Never use raw form input in an HTML string without this.
 */
export function escapeHtml(value: unknown): string {
  const str = value == null ? '' : String(value)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Basic RFC-5322-ish email shape check. Used to reject malformed
 * addresses before they are handed to the email provider or echoed
 * into a reply-to header.
 */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false
  if (email.length > 254) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Trims and hard-caps a free-text field length to blunt abuse
 * (oversized payloads, storage bloat). Returns '' for non-strings.
 */
export function clampText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}
