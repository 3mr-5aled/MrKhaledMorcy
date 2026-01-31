import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const studentSchema = z.object({
  name: z.string().min(1, "اسم الطالب مطلوب"),
  grade: z.string().min(1, "الصف الدراسي مطلوب"),
  score: z.string().min(1, "الدرجة مطلوبة"),
  image: z.string().min(1, "صورة الطالب مطلوبة"),
  manualOrder: z.number().int().nullable().optional(),
  isVisible: z.boolean().default(true),
});

// Helper function to parse score string to number for sorting
function parseScore(score: string): number {
  return parseInt(score.replace("%", "")) || 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visibleOnly = searchParams.get("visibleOnly") === "true";

    const students = await db.student.findMany({
      where: visibleOnly ? { isVisible: true } : undefined,
    });

    // Sort students: manualOrder first (if set), then by score descending
    const sortedStudents = students.sort((a: any, b: any) => {
      // Priority 1: Manual order (if both have it)
      if (a.manualOrder !== null && b.manualOrder !== null) {
        return a.manualOrder - b.manualOrder;
      }
      // If only one has manual order, it comes first
      if (a.manualOrder !== null) return -1;
      if (b.manualOrder !== null) return 1;

      // Priority 2: Sort by score descending
      const scoreA = parseScore(a.score);
      const scoreB = parseScore(b.score);
      return scoreB - scoreA;
    });

    return NextResponse.json(sortedStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الطلاب" },
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
    const validatedData = studentSchema.parse(body);

    const student = await db.student.create({
      data: validatedData,
    });

    // Log activity
    await logActivity({
      action: "CREATE",
      entityType: "student",
      entityId: student.id,
      entityName: student.name,
      userId: session.user.id,
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إضافة الطالب" },
      { status: 500 },
    );
  }
}
