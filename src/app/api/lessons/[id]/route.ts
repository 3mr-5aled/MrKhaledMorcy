import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const lessonSchema = z.object({
  name: z.string().min(1).optional(),
  unitId: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            grade: true,
          },
        },
        answers: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الدرس" },
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
    const validatedData = lessonSchema.parse(body);

    const lesson = await db.lesson.update({
      where: { id },
      data: validatedData,
      include: {
        unit: {
          include: {
            grade: true,
          },
        },
      },
    });

    // Log activity (only if not just updating order)
    if (validatedData.name || validatedData.unitId) {
      await logActivity({
        action: "UPDATE",
        entityType: "lesson",
        entityId: lesson.id,
        entityName: lesson.name,
        userId: session.user.id,
      });
    }

    return NextResponse.json(lesson);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الدرس" },
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

    // Get lesson info before deleting
    const lesson = await db.lesson.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
    }

    await db.lesson.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      action: "DELETE",
      entityType: "lesson",
      entityId: id,
      entityName: lesson.name,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الدرس" },
      { status: 500 },
    );
  }
}
