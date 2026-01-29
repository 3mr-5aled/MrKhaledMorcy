import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const gradeSchema = z.object({
  name: z.string().min(1, "اسم المرحلة مطلوب"),
  slug: z.string().optional(),
  stage: z.string().min(1, "المستوى الدراسي مطلوب"),
  color: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET all grades
export async function GET() {
  try {
    const grades = await db.grade.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { units: true },
        },
      },
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المراحل الدراسية" },
      { status: 500 },
    );
  }
}

// POST create new grade
export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = gradeSchema.parse(body);

    // Generate slug if not provided
    const slug = validatedData.slug || generateSlug(validatedData.name);

    const grade = await db.grade.create({
      data: {
        ...validatedData,
        slug,
      },
    });

    // Log activity
    await logActivity({
      action: "CREATE",
      entityType: "grade",
      entityId: grade.id,
      entityName: grade.name,
      userId: session.user.id,
    });

    return NextResponse.json(grade, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error creating grade:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء المرحلة الدراسية" },
      { status: 500 },
    );
  }
}
