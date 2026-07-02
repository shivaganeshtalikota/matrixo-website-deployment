export const DEVAGENTS_GOOGLE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_DEVAGENTS_GOOGLE_SCRIPT_URL || ''

type DevAgentsGoogleScriptResult = {
  success: boolean
  message?: string
  error?: string
  [key: string]: unknown
}

export async function postToDevAgentsGoogleScript(
  payload: Record<string, unknown>,
): Promise<{
  status: number
  ok: boolean
  data: DevAgentsGoogleScriptResult | string
}> {
  if (!DEVAGENTS_GOOGLE_SCRIPT_URL) {
    return {
      status: 503,
      ok: false,
      data: {
        success: false,
        error: 'DevAgents Google Apps Script URL is not configured.',
      },
    }
  }

  const response = await fetch(DEVAGENTS_GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const raw = await response.text()

  try {
    return {
      status: response.status,
      ok: response.ok,
      data: raw ? (JSON.parse(raw) as DevAgentsGoogleScriptResult) : { success: response.ok },
    }
  } catch {
    return {
      status: response.status,
      ok: response.ok,
      data: raw,
    }
  }
}