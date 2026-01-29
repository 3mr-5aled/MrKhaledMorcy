import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const unitSchema = z.object({
  name: z.string().min(1, "اسم الوحدة مطلوب"),
  slug: z.string().optional(),
  gradeId: z.string().min(1, "المرحلة الدراسية مطلوبة"),
  order: z.number().int().min(0).default(0),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId");

    const units = await db.unit.findMany({
      where: gradeId ? { gradeId } : undefined,
      orderBy: { order: "asc" },
      include: {
        grade: true,
        _count: {
          select: { lessons: true },
        },
      },
    });

    return NextResponse.json(units);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الوحدات" },
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
    const validatedData = unitSchema.parse(body);

    // Generate slug if not provided
    const slug = validatedData.slug || generateSlug(validatedData.name);

    const unit = await db.unit.create({
      data: {
        ...validatedData,
        slug,
      },
      include: { grade: true },
    });

    // Log activity
    await logActivity({
      action: "CREATE",
      entityType: "unit",
      entityId: unit.id,
      entityName: unit.name,
      userId: session.user.id,
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الوحدة" },
      { status: 500 },
    );
  }
}
