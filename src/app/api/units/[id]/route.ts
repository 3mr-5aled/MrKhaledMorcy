import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const unitSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  gradeId: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const unit = await db.unit.findUnique({
      where: { id },
      include: {
        grade: true,
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!unit) {
      return NextResponse.json({ error: "الوحدة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error("Error fetching unit:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الوحدة" },
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
    const validatedData = unitSchema.parse(body);

    // Generate slug if name is being updated and slug is not provided
    const updateData: any = { ...validatedData };
    if (validatedData.name && !validatedData.slug) {
      updateData.slug = generateSlug(validatedData.name);
    }

    const unit = await db.unit.update({
      where: { id },
      data: updateData,
      include: { grade: true },
    });

    // Log activity (only if not just updating order)
    if (validatedData.name || validatedData.gradeId) {
      await logActivity({
        action: "UPDATE",
        entityType: "unit",
        entityId: unit.id,
        entityName: unit.name,
        userId: session.user.id,
      });
    }

    return NextResponse.json(unit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating unit:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الوحدة" },
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

    // Get unit info before deleting
    const unit = await db.unit.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!unit) {
      return NextResponse.json({ error: "الوحدة غير موجودة" }, { status: 404 });
    }

    await db.unit.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      action: "DELETE",
      entityType: "unit",
      entityId: id,
      entityName: unit.name,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الوحدة" },
      { status: 500 },
    );
  }
}
