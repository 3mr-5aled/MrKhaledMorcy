/**
 * Auto-publish cron job endpoint
 * Updates answers from SCHEDULED to PUBLISHED when their publishAt time has passed
 *
 * This endpoint should be called by a scheduled task (e.g., Netlify scheduled function)
 * every 10-15 minutes to check for answers that need to be published.
 *
 * Security: Protected by API key in Authorization header
 */

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Verify authorization - cron job should include a secret API key
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.NEXTAUTH_SECRET;

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 },
      );
    }

    const now = new Date();

    // Find all scheduled answers where publishAt time has passed
    const answersToPublish = await db.answer.findMany({
      where: {
        status: "SCHEDULED",
        publishAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        title: true,
        publishAt: true,
      },
    });

    if (answersToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No answers to publish",
        published: 0,
        timestamp: now.toISOString(),
      });
    }

    // Update all eligible answers to PUBLISHED status
    const result = await db.answer.updateMany({
      where: {
        id: {
          in: answersToPublish.map((a) => a.id),
        },
      },
      data: {
        status: "PUBLISHED",
      },
    });

    // Log the auto-publish action for each answer
    // Note: We use a system user for cron jobs
    // If you want detailed activity logs, you'd need to create a system user account
    console.log(`[CRON] Auto-published ${result.count} answers:`, {
      answers: answersToPublish.map((a) => ({
        id: a.id,
        title: a.title,
        publishAt: a.publishAt,
      })),
      timestamp: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Successfully published ${result.count} answer(s)`,
      published: result.count,
      answers: answersToPublish.map((a) => ({
        id: a.id,
        title: a.title,
      })),
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Error in auto-publish job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Support POST as well for flexibility with different cron services
export async function POST(request: Request) {
  return GET(request);
}
