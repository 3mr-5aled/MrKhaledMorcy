import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { calculateStatus, formatEgyptDate, toUTC } from "@/lib/dateUtils";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const answerSchema = z
  .object({
    title: z.string().min(1, "العنوان مطلوب"),
    description: z.string().optional(),
    type: z.enum(["PDF", "IMAGE", "YOUTUBE", "DRIVE"], {
      message: "نوع الإجابة غير صالح",
    }),
    url: z.string().optional().default(""),
    images: z.array(z.string()).optional().default([]),
    driveUrl: z.string().optional().nullable(),
    lessonId: z.string().min(1, "الدرس مطلوب").optional().nullable(),
    categoryType: z.enum(["LESSON", "UNIT_EXERCISE", "EXAM", "OTHER"], {
      message: "نوع الفئة غير صالح",
    }),
    customTitle: z.string().optional().nullable(),
    order: z.number().int().min(0).default(0),
    fileSize: z.number().int().optional().nullable(),
    publishAt: z.string().datetime().optional().nullable(),
    status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).optional(),
    isVisible: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // For DRIVE type, driveUrl is required
      if (data.type === "DRIVE") {
        return data.driveUrl && data.driveUrl.length > 0;
      }
      // For IMAGE type, either url or images array must have content
      if (data.type === "IMAGE") {
        return data.images.length > 0 || data.url.length > 0;
      }
      // For PDF and YOUTUBE, url is required
      return data.url.length > 0;
    },
    {
      message: "الرابط أو الملف مطلوب",
      path: ["url"],
    },
  );

export async function GET(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    const isAdmin = !!session?.user?.id;

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const unitId = searchParams.get("unitId");
    const gradeId = searchParams.get("gradeId");
    const categoryType = searchParams.get("categoryType");

    const answers = await db.answer.findMany({
      where: {
        ...(lessonId && { lessonId }),
        ...(categoryType && { categoryType: categoryType as any }),
        ...(unitId && {
          lesson: {
            unitId,
          },
        }),
        ...(gradeId && {
          lesson: {
            unit: {
              gradeId,
            },
          },
        }),
        // Only show published/visible answers to non-admin users
        ...(!isAdmin && {
          isVisible: true,
          status: "PUBLISHED",
        }),
      },
      orderBy: { order: "asc" },
      include: {
        lesson: {
          include: {
            unit: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(answers);
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإجابات" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = answerSchema.parse(body);

    // Convert Egypt time to UTC for storage
    const publishAtUTC = validatedData.publishAt
      ? toUTC(validatedData.publishAt)
      : null;

    // Auto-calculate status based on publishAt date
    const autoStatus = calculateStatus(publishAtUTC, validatedData.status);

    const answer = await db.answer.create({
      data: {
        ...validatedData,
        publishAt: publishAtUTC,
        status: validatedData.status || autoStatus,
      },
      include: {
        lesson: {
          include: {
            unit: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
    });

    // Log activity with appropriate action
    const activityAction = answer.publishAt ? "SCHEDULE" : "CREATE";
    await logActivity({
      action: activityAction,
      entityType: "answer",
      entityId: answer.id,
      entityName: answer.title,
      userId: session.user.id,
      metadata: answer.publishAt
        ? { publishAt: formatEgyptDate(answer.publishAt) }
        : undefined,
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error creating answer:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الإجابة" },
      { status: 500 },
    );
  }
}
