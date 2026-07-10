import { NextResponse } from "next/server";
import { processRegistrations } from "@/lib/registrationProcessor";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Basic security check to ensure only authorized clients can trigger this
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processRegistrations();

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Cron API] Error processing emails:", msg);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
