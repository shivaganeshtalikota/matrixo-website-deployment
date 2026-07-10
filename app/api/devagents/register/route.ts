import { NextResponse } from "next/server";

// Check both names for compatibility — NEXT_PUBLIC_ is what Vercel/env has set
const DEVAGENTS_GOOGLE_SCRIPT_URL =
  process.env.DEVAGENTS_GOOGLE_SCRIPT_URL ||
  process.env.NEXT_PUBLIC_DEVAGENTS_GOOGLE_SCRIPT_URL ||
  "";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!DEVAGENTS_GOOGLE_SCRIPT_URL) {
      return NextResponse.json(
        { error: "DevAgents Google Apps Script URL is not configured." },
        { status: 503 },
      );
    }

    const body = await request.json();

    // ------------------------------------------------------------------
    // Destructure ONLY the 13 fields the Apps Script expects.
    // Any extra/legacy keys sent by old callers are ignored here and
    // never forwarded to the sheet.
    // ------------------------------------------------------------------
    const {
      fullName,
      email,
      phone,
      college,
      year,
      branch,
      city,
      github,
      linkedIn,
      experienceLevel,
      paymentScreenshot,
    } = body;

    // Validate required fields
    const missing = (
      [
        ["fullName", fullName],
        ["email", email],
        ["phone", phone],
        ["college", college],
        ["year", year],
        ["branch", branch],
        ["city", city],
        ["experienceLevel", experienceLevel],
        ["paymentScreenshot", paymentScreenshot],
      ] as [string, string | undefined][]
    )
      .filter(([, v]) => !v?.toString().trim())
      .map(([k]) => k);

    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missing.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (!String(paymentScreenshot).startsWith("data:image")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "paymentScreenshot must be a Base64 image Data URL (data:image/...)",
        },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------------
    // Build the EXACT payload — 13 keys, nothing more, nothing less.
    // ------------------------------------------------------------------
    const payload = {
      action: "register",
      fullName: String(fullName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      college: String(college).trim(),
      year: String(year),
      branch: String(branch).trim(),
      city: String(city).trim(),
      github: String(github || "").trim(),
      linkedIn: String(linkedIn || "").trim(),
      experienceLevel: String(experienceLevel),
      paymentScreenshot: String(paymentScreenshot), // Base64 Data URL → Apps Script uploads to Drive
    };

    console.log("[DevAgents] Forwarding registration for:", payload.email);

    let response: Response;
    try {
      response = await fetch(DEVAGENTS_GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (fetchError) {
      // Network-level failure reaching the Apps Script URL itself
      // (wrong URL, DNS failure, deployment removed, etc.)
      const msg =
        fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("[DevAgents] Could not reach Apps Script URL:", msg);
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not reach the DevAgents Google Apps Script. Verify the deployment URL and that it is redeployed with the latest code.",
          details: msg,
        },
        { status: 502 },
      );
    }

    const raw = await response.text();
    let data: unknown = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      // Apps Script returned plain text/HTML — wrap it
      data = { success: false, message: raw };
    }

    if (!response.ok) {
      console.error(
        "[DevAgents] Apps Script returned non-OK status:",
        response.status,
        raw.slice(0, 500),
      );
    } else {
      // Trigger background email processor immediately without waiting
      // We use the hostname of the current request if available
      try {
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const host = request.headers.get("host") || "localhost:3000";
        const cronSecret = process.env.CRON_SECRET || "";
        const cronUrl = `${protocol}://${host}/api/cron/process-emails${cronSecret ? `?secret=${cronSecret}` : ""}`;
        
        console.log(`[DevAgents] Triggering immediate email processing via ${cronUrl}`);
        fetch(cronUrl).catch((err) => {
          console.error("[DevAgents] Background email process trigger failed:", err);
        });
      } catch (err) {
        console.error("[DevAgents] Error generating cron trigger URL:", err);
      }
    }

    return NextResponse.json(
      typeof data === "object" && data !== null
        ? data
        : { success: response.ok, message: raw || "Registration forwarded." },
      { status: response.ok ? 200 : response.status },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[DevAgents] Registration proxy error:", msg);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process registration request.",
        details: msg,
      },
      { status: 500 },
    );
  }
}
