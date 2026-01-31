import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const studentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  gradeId: z.string().min(1).optional(),
  studentGrade: z.number().int().min(0).optional(),
  testGrade: z.number().int().min(1).optional(),
  position: z.enum(["FIRST", "SECOND", "THIRD", "NONE"]).optional(),
  image: z.string().min(1).optional(),
  isVisible: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const student = await db.student.findUnique({
      where: { id },
      include: {
        grade: {
          select: {
            id: true,
            name: true,
            slug: true,
            stage: true,
            color: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات الطالب" },
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
    const validatedData = studentUpdateSchema.parse(body);

    const student = await db.student.update({
      where: { id },
      data: validatedData,
      include: {
        grade: {
          select: {
            id: true,
            name: true,
            slug: true,
            stage: true,
            color: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      action: "UPDATE",
      entityType: "student",
      entityId: student.id,
      entityName: student.name,
      userId: session.user.id,
    });

    return NextResponse.json(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث بيانات الطالب" },
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

    // Get student info before deleting
    const student = await db.student.findUnique({
      where: { id },
      select: { name: true, image: true },
    });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    await db.student.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      action: "DELETE",
      entityType: "student",
      entityId: id,
      entityName: student.name,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الطالب" },
      { status: 500 },
    );
  }
}
