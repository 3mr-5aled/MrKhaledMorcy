import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { calculateStatus, formatEgyptDate, toUTC } from "@/lib/dateUtils";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const quizSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  googleFormUrl: z.string().url().optional(),
  lessonId: z.string().optional().nullable(),
  unitId: z.string().optional().nullable(),
  gradeId: z.string().optional().nullable(),
  categoryType: z.enum(["LESSON", "UNIT_EXERCISE", "EXAM", "OTHER"]).optional(),
  customTitle: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
  duration: z.number().int().min(0).optional().nullable(),
  publishAt: z.string().datetime().optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).optional(),
  isVisible: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const quiz = await db.quiz.findUnique({
      where: { id },
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
        unit: {
          include: {
            grade: true,
          },
        },
        grade: true,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "الاختبار غير موجود" },
        { status: 404 },
      );
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الاختبار" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = quizSchema.parse(body);

    // Get old quiz for comparison
    const oldQuiz = await db.quiz.findUnique({
      where: { id },
    });

    if (!oldQuiz) {
      return NextResponse.json(
        { error: "الاختبار غير موجود" },
        { status: 404 },
      );
    }

    // If lessonId is being updated, auto-derive unitId and gradeId from it
    let unitId = validatedData.unitId;
    let gradeId = validatedData.gradeId;

    if (validatedData.lessonId !== undefined) {
      if (validatedData.lessonId) {
        const lesson = await db.lesson.findUnique({
          where: { id: validatedData.lessonId },
          include: {
            unit: {
              include: {
                grade: true,
              },
            },
          },
        });

        if (lesson) {
          unitId = lesson.unitId;
          gradeId = lesson.unit.gradeId;
        }
      } else {
        // If lessonId is being cleared, keep existing unitId/gradeId unless explicitly overridden
        unitId =
          validatedData.unitId !== undefined
            ? validatedData.unitId
            : oldQuiz.unitId;
        gradeId =
          validatedData.gradeId !== undefined
            ? validatedData.gradeId
            : oldQuiz.gradeId;
      }
    }

    // Convert Egypt time to UTC for storage
    const publishAtUTC =
      validatedData.publishAt !== undefined
        ? validatedData.publishAt
          ? toUTC(validatedData.publishAt)
          : null
        : undefined;

    // Reschedule logic: If publishAt changes on a PUBLISHED quiz, revert to SCHEDULED
    let newStatus = validatedData.status;
    let activityAction: "UPDATE" | "RESCHEDULE" = "UPDATE";

    if (publishAtUTC !== undefined && oldQuiz.status === "PUBLISHED") {
      const oldPublishAt = oldQuiz.publishAt?.toISOString();
      const newPublishAt = publishAtUTC?.toISOString();

      if (oldPublishAt !== newPublishAt) {
        newStatus = "SCHEDULED";
        activityAction = "RESCHEDULE";
      }
    }

    // Auto-calculate status if not explicitly provided
    if (!newStatus && publishAtUTC !== undefined) {
      newStatus = calculateStatus(publishAtUTC);
    }

    const quiz = await db.quiz.update({
      where: { id },
      data: {
        ...validatedData,
        ...(unitId !== undefined && { unitId }),
        ...(gradeId !== undefined && { gradeId }),
        ...(publishAtUTC !== undefined && { publishAt: publishAtUTC }),
        ...(newStatus && { status: newStatus }),
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
        unit: {
          include: {
            grade: true,
          },
        },
        grade: true,
      },
    });

    // Log activity (only if not just updating order)
    if (
      validatedData.title ||
      validatedData.googleFormUrl ||
      validatedData.publishAt !== undefined
    ) {
      await logActivity({
        action: activityAction,
        entityType: "quiz",
        entityId: quiz.id,
        entityName: quiz.title,
        userId: session.user.id,
        metadata:
          activityAction === "RESCHEDULE" && quiz.publishAt
            ? { publishAt: formatEgyptDate(quiz.publishAt) }
            : undefined,
      });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الاختبار" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get quiz details before deleting
    const quiz = await db.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "الاختبار غير موجود" },
        { status: 404 },
      );
    }

    // Delete from database
    await db.quiz.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      action: "DELETE",
      entityType: "quiz",
      entityId: id,
      entityName: quiz.title,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الاختبار" },
      { status: 500 },
    );
  }
}
