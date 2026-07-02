import { NextResponse } from "next/server";

// Server-side only — NOT prefixed with NEXT_PUBLIC_
const DEVAGENTS_GOOGLE_SCRIPT_URL =
  process.env.DEVAGENTS_GOOGLE_SCRIPT_URL || "";

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
      whyAttend,
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
        ["whyAttend", whyAttend],
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
      whyAttend: String(whyAttend).trim(),
      paymentScreenshot: String(paymentScreenshot), // Base64 Data URL → Apps Script uploads to Drive
    };

    console.log("[DevAgents] Forwarding registration for:", payload.email);

    const response = await fetch(DEVAGENTS_GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let data: unknown = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      // Apps Script returned plain text — wrap it
      data = { success: response.ok, message: raw };
    }

    return NextResponse.json(
      typeof data === "object" && data !== null
        ? data
        : { success: response.ok, message: raw || "Registration forwarded." },
      { status: response.ok ? 200 : response.status },
    );
  } catch (error) {
    console.error("[DevAgents] Registration proxy error:", error);
    return NextResponse.json(
      { error: "Failed to forward registration to Google Apps Script." },
      { status: 500 },
    );
  }
}
