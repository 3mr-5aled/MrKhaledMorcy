import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const lessonSchema = z.object({
  name: z.string().min(1, "اسم الدرس مطلوب"),
  unitId: z.string().min(1, "الوحدة مطلوبة"),
  order: z.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId");

    const lessons = await db.lesson.findMany({
      where: unitId ? { unitId } : undefined,
      orderBy: { order: "asc" },
      include: {
        unit: {
          include: {
            grade: true,
          },
        },
        _count: {
          select: { answers: true },
        },
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الدروس" },
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
    const validatedData = lessonSchema.parse(body);

    const lesson = await db.lesson.create({
      data: validatedData,
      include: {
        unit: {
          include: {
            grade: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      action: "CREATE",
      entityType: "lesson",
      entityId: lesson.id,
      entityName: lesson.name,
      userId: session.user.id,
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الدرس" },
      { status: 500 },
    );
  }
}
