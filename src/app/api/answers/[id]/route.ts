import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { calculateStatus, formatEgyptDate, toUTC } from "@/lib/dateUtils";
import { db } from "@/lib/db";
import { deleteFile, getFileRecordByPath } from "@/lib/fileUtils";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const answerSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["PDF", "IMAGE", "YOUTUBE", "DRIVE"]).optional(),
  url: z.string().optional(),
  images: z.array(z.string()).optional(),
  thumbnails: z.array(z.string()).optional(),
  driveUrl: z.string().optional().nullable(),
  lessonId: z.string().optional().nullable(),
  unitId: z.string().optional().nullable(),
  gradeId: z.string().optional().nullable(),
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
        unit: {
          include: {
            grade: true,
          },
        },
        grade: true,
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

    // Clean up empty string fields to null
    const cleanedBody = {
      ...body,
      lessonId: body.lessonId === "" ? null : body.lessonId,
      unitId: body.unitId === "" ? null : body.unitId,
      gradeId: body.gradeId === "" ? null : body.gradeId,
      driveUrl: body.driveUrl === "" ? null : body.driveUrl,
      customTitle: body.customTitle === "" ? null : body.customTitle,
      description: body.description === "" ? null : body.description,
    };

    const validatedData = answerSchema.parse(cleanedBody);

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

    // If URL is being updated and it's a file, version the old file
    if (
      validatedData.url &&
      oldAnswer.url !== validatedData.url &&
      (oldAnswer.type === "PDF" || oldAnswer.type === "IMAGE")
    ) {
      const fileRecord = await getFileRecordByPath(oldAnswer.url);
      if (fileRecord) {
        await deleteFile(oldAnswer.url, {
          fileId: fileRecord.id,
          userId: session.user.id,
          changeReason: "File replaced with new upload",
        });
      } else {
        // No file record exists, delete without versioning
        await deleteFile(oldAnswer.url);
      }
    }

    // Check for removed images in the images array and mark them as orphaned
    if (validatedData.images && oldAnswer.images) {
      const removedImages = oldAnswer.images.filter(
        (img) => !validatedData.images?.includes(img),
      );
      for (const removedImage of removedImages) {
        const fileRecord = await getFileRecordByPath(removedImage);
        if (fileRecord) {
          await deleteFile(removedImage, {
            fileId: fileRecord.id,
            userId: session.user.id,
            changeReason: "Image removed from answer",
          });
        }
      }
    }

    // Check for removed thumbnails
    if (validatedData.thumbnails && oldAnswer.thumbnails) {
      const removedThumbnails = oldAnswer.thumbnails.filter(
        (thumb) => !validatedData.thumbnails?.includes(thumb),
      );
      for (const removedThumbnail of removedThumbnails) {
        const fileRecord = await getFileRecordByPath(removedThumbnail);
        if (fileRecord) {
          await deleteFile(removedThumbnail, {
            fileId: fileRecord.id,
            userId: session.user.id,
            changeReason: "Thumbnail removed from answer",
          });
        }
      }
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

    // If lessonId is being updated, automatically set unitId and gradeId from the lesson
    let updateData: any = { ...validatedData };

    if (validatedData.lessonId !== undefined) {
      if (validatedData.lessonId) {
        const lesson = await db.lesson.findUnique({
          where: { id: validatedData.lessonId },
          include: { unit: true },
        });
        if (lesson) {
          updateData.unitId = lesson.unitId;
          updateData.gradeId = lesson.unit.gradeId;
        }
      } else {
        // If lessonId is set to null, keep the manually set unitId and gradeId
        // (they should be in validatedData already)
      }
    }

    const answer = await db.answer.update({
      where: { id },
      data: {
        ...updateData,
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

    // Version and delete file if it's a PDF or IMAGE
    if (answer.type === "PDF" && answer.url) {
      const fileRecord = await getFileRecordByPath(answer.url);
      if (fileRecord) {
        await deleteFile(answer.url, {
          fileId: fileRecord.id,
          userId: session.user.id,
          changeReason: "Answer deleted",
        });
      } else {
        await deleteFile(answer.url);
      }
    }

    // Version and delete all images if type is IMAGE
    if (answer.type === "IMAGE" && answer.images && answer.images.length > 0) {
      for (const imagePath of answer.images) {
        const fileRecord = await getFileRecordByPath(imagePath);
        if (fileRecord) {
          await deleteFile(imagePath, {
            fileId: fileRecord.id,
            userId: session.user.id,
            changeReason: "Answer deleted",
          });
        } else {
          await deleteFile(imagePath);
        }
      }
    }

    // Version and delete all thumbnails if they exist
    if (answer.thumbnails && answer.thumbnails.length > 0) {
      for (const thumbnailPath of answer.thumbnails) {
        const fileRecord = await getFileRecordByPath(thumbnailPath);
        if (fileRecord) {
          await deleteFile(thumbnailPath, {
            fileId: fileRecord.id,
            userId: session.user.id,
            changeReason: "Answer deleted",
          });
        } else {
          await deleteFile(thumbnailPath);
        }
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
