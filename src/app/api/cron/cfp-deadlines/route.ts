import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { checkCfpDeadlines } from "~/server/jobs/cfp-deadline-notifier";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron endpoint for checking CFP deadlines
 * Should be called daily by Vercel Cron or external scheduler
 *
 * Authorization: Bearer token in Authorization header matching CRON_SECRET env var
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET) {
      console.error("[CFP Cron] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (authHeader !== expectedAuth) {
      console.error("[CFP Cron] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[CFP Cron] Starting CFP deadline check");

    // Run the job
    await checkCfpDeadlines(db);

    console.log("[CFP Cron] CFP deadline check completed successfully");

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CFP Cron] Error checking CFP deadlines:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
