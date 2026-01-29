import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { calculateStatus, formatEgyptDate, toUTC } from "@/lib/dateUtils";
import { db } from "@/lib/db";
import { deleteFile } from "@/lib/fileUtils";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const answerSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["PDF", "IMAGE", "YOUTUBE", "DRIVE"]).optional(),
  url: z.string().optional(),
  images: z.array(z.string()).optional(),
  driveUrl: z.string().optional().nullable(),
  lessonId: z.string().optional().nullable(),
  categoryType: z.enum(["LESSON", "UNIT_EXERCISE", "EXAM", "OTHER"]).optional(),
  customTitle: z.string().optional().nullable(),
  order: z.number().int().min(0).optional(),
  fileSize: z.number().int().optional().nullable(),
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
    const answer = await db.answer.findUnique({
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
      },
    });

    if (!answer) {
      return NextResponse.json(
        { error: "الإجابة غير موجودة" },
        { status: 404 },
      );
    }

    return NextResponse.json(answer);
  } catch (error) {
    console.error("Error fetching answer:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإجابة" },
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
    const validatedData = answerSchema.parse(body);

    // Get old answer for comparison
    const oldAnswer = await db.answer.findUnique({
      where: { id },
    });

    if (!oldAnswer) {
      return NextResponse.json(
        { error: "الإجابة غير موجودة" },
        { status: 404 },
      );
    }

    // If URL is being updated and it's a file, delete the old file
    if (
      validatedData.url &&
      oldAnswer.url !== validatedData.url &&
      (oldAnswer.type === "PDF" || oldAnswer.type === "IMAGE")
    ) {
      await deleteFile(oldAnswer.url);
    }

    // Convert Egypt time to UTC for storage
    const publishAtUTC =
      validatedData.publishAt !== undefined
        ? validatedData.publishAt
          ? toUTC(validatedData.publishAt)
          : null
        : undefined;

    // Reschedule logic: If publishAt changes on a PUBLISHED answer, revert to SCHEDULED
    let newStatus = validatedData.status;
    let activityAction: "UPDATE" | "RESCHEDULE" = "UPDATE";

    if (publishAtUTC !== undefined && oldAnswer.status === "PUBLISHED") {
      const oldPublishAt = oldAnswer.publishAt?.toISOString();
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

    const answer = await db.answer.update({
      where: { id },
      data: {
        ...validatedData,
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
      },
    });

    // Log activity (only if not just updating order)
    if (
      validatedData.title ||
      validatedData.url ||
      validatedData.type ||
      validatedData.publishAt !== undefined
    ) {
      await logActivity({
        action: activityAction,
        entityType: "answer",
        entityId: answer.id,
        entityName: answer.title,
        userId: session.user.id,
        metadata:
          activityAction === "RESCHEDULE" && answer.publishAt
            ? { publishAt: formatEgyptDate(answer.publishAt) }
            : undefined,
      });
    }

    return NextResponse.json(answer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating answer:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الإجابة" },
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

    // Get answer details before deleting
    const answer = await db.answer.findUnique({
      where: { id },
    });

    if (!answer) {
      return NextResponse.json(
        { error: "الإجابة غير موجودة" },
        { status: 404 },
      );
    }

    // Delete file if it's a PDF or IMAGE
    if (answer.type === "PDF" && answer.url) {
      await deleteFile(answer.url);
    }

    // Delete all images if type is IMAGE
    if (answer.type === "IMAGE" && answer.images && answer.images.length > 0) {
      for (const imagePath of answer.images) {
        await deleteFile(imagePath);
      }
    }

    // Delete from database
    await db.answer.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      action: "DELETE",
      entityType: "answer",
      entityId: id,
      entityName: answer.title,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting answer:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الإجابة" },
      { status: 500 },
    );
  }
}
