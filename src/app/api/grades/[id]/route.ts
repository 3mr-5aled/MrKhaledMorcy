import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const gradeSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  stage: z.string().min(1).optional(),
  color: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET single grade
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const grade = await db.grade.findUnique({
      where: { id },
      include: {
        units: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "المرحلة الدراسية غير موجودة" },
        { status: 404 },
      );
    }

    return NextResponse.json(grade);
  } catch (error) {
    console.error("Error fetching grade:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المرحلة الدراسية" },
      { status: 500 },
    );
  }
}

// PUT update grade
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
    const validatedData = gradeSchema.parse(body);

    // Generate slug if name is being updated and slug is not provided
    const updateData: any = { ...validatedData };
    if (validatedData.name && !validatedData.slug) {
      updateData.slug = generateSlug(validatedData.name);
    }

    const grade = await db.grade.update({
      where: { id },
      data: updateData,
    });

    // Log activity (only if not just updating order)
    if (validatedData.name || validatedData.stage || validatedData.color) {
      await logActivity({
        action: "UPDATE",
        entityType: "grade",
        entityId: grade.id,
        entityName: grade.name,
        userId: session.user.id,
      });
    }

    return NextResponse.json(grade);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating grade:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث المرحلة الدراسية" },
      { status: 500 },
    );
  }
}

// DELETE grade
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

    // Get grade info before deleting
    const grade = await db.grade.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "المرحلة الدراسية غير موجودة" },
        { status: 404 },
      );
    }

    await db.grade.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      action: "DELETE",
      entityType: "grade",
      entityId: id,
      entityName: grade.name,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting grade:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف المرحلة الدراسية" },
      { status: 500 },
    );
  }
}
