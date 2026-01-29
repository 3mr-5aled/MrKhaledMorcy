import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { calculateStatus, formatEgyptDate, toUTC } from "@/lib/dateUtils";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const quizSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  description: z.string().optional(),
  googleFormUrl: z
    .string()
    .url("يجب أن يكون رابط Google Form صالحًا")
    .min(1, "رابط Google Form مطلوب"),
  lessonId: z.string().min(1, "الدرس مطلوب").optional().nullable(),
  categoryType: z.enum(["LESSON", "UNIT_EXERCISE", "EXAM", "OTHER"], {
    message: "نوع الفئة غير صالح",
  }),
  customTitle: z.string().optional().nullable(),
  order: z.number().int().min(0).default(0),
  duration: z.number().int().min(0).optional().nullable(),
  publishAt: z.string().datetime().optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).optional(),
  isVisible: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    const isAdmin = !!session?.user?.id;

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const unitId = searchParams.get("unitId");
    const gradeId = searchParams.get("gradeId");
    const categoryType = searchParams.get("categoryType");

    const quizzes = await db.quiz.findMany({
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
        // Only show published/visible quizzes to non-admin users
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

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الاختبارات" },
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
    const validatedData = quizSchema.parse(body);

    // Convert Egypt time to UTC for storage
    const publishAtUTC = validatedData.publishAt
      ? toUTC(validatedData.publishAt)
      : null;

    // Auto-calculate status based on publishAt date
    const autoStatus = calculateStatus(publishAtUTC, validatedData.status);

    const quiz = await db.quiz.create({
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
    const activityAction = quiz.publishAt ? "SCHEDULE" : "CREATE";
    await logActivity({
      action: activityAction,
      entityType: "quiz",
      entityId: quiz.id,
      entityName: quiz.title,
      userId: session.user.id,
      metadata: quiz.publishAt
        ? { publishAt: formatEgyptDate(quiz.publishAt) }
        : undefined,
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الاختبار" },
      { status: 500 },
    );
  }
}
