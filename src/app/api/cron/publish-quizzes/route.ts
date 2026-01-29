/**
 * Auto-publish cron job endpoint for quizzes
 * Updates quizzes from SCHEDULED to PUBLISHED when their publishAt time has passed
 *
 * This endpoint should be called by a scheduled task (e.g., Netlify scheduled function)
 * every 10-15 minutes to check for quizzes that need to be published.
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

    // Find all scheduled quizzes where publishAt time has passed
    const quizzesToPublish = await db.quiz.findMany({
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

    if (quizzesToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No quizzes to publish",
        published: 0,
        timestamp: now.toISOString(),
      });
    }

    // Update all matching quizzes to PUBLISHED status
    const result = await db.quiz.updateMany({
      where: {
        id: {
          in: quizzesToPublish.map((q) => q.id),
        },
      },
      data: {
        status: "PUBLISHED",
      },
    });

    // Log each published quiz for debugging
    console.log("Published quizzes:", {
      count: result.count,
      quizzes: quizzesToPublish.map((q) => ({
        id: q.id,
        title: q.title,
        publishAt: q.publishAt,
      })),
      timestamp: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Published ${result.count} quiz(zes)`,
      published: result.count,
      quizzes: quizzesToPublish.map((q) => ({
        id: q.id,
        title: q.title,
      })),
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error in publish-quizzes cron job:", error);
    return NextResponse.json(
      {
        error: "Failed to publish quizzes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
