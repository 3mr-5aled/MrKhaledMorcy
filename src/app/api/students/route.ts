import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const studentSchema = z.object({
  name: z.string().min(1, "اسم الطالب مطلوب"),
  gradeId: z.string().min(1, "الصف الدراسي مطلوب"),
  studentGrade: z.number().int().min(0, "درجة الطالب يجب أن تكون رقم موجب"),
  testGrade: z.number().int().min(1, "درجة الاختبار يجب أن تكون أكبر من صفر"),
  position: z.enum(["FIRST", "SECOND", "THIRD", "NONE"]).default("NONE"),
  image: z.string().optional().nullable(),
  isVisible: z.boolean().default(true),
});

// Helper function to calculate percentage for sorting
function calculatePercentage(studentGrade: number, testGrade: number): number {
  if (testGrade === 0) return 0;
  return (studentGrade / testGrade) * 100;
}

// Helper function to get position priority for sorting
function getPositionPriority(position: string): number {
  const priorities: Record<string, number> = {
    FIRST: 1,
    SECOND: 2,
    THIRD: 3,
    NONE: 4,
  };
  return priorities[position] || 4;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visibleOnly = searchParams.get("visibleOnly") === "true";
    const gradeId = searchParams.get("gradeId");

    const where: any = {};
    if (visibleOnly) where.isVisible = true;
    if (gradeId) where.gradeId = gradeId;

    const students = await db.student.findMany({
      where,
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

    // Sort students: position (FIRST > SECOND > THIRD > NONE),
    // then by percentage (studentGrade/testGrade descending),
    // then by name (alphabetically)
    const sortedStudents = students.sort((a: any, b: any) => {
      // Priority 1: Position
      const positionA = getPositionPriority(a.position);
      const positionB = getPositionPriority(b.position);
      if (positionA !== positionB) {
        return positionA - positionB;
      }

      // Priority 2: Percentage (descending)
      const percentageA = calculatePercentage(a.studentGrade, a.testGrade);
      const percentageB = calculatePercentage(b.studentGrade, b.testGrade);
      if (percentageA !== percentageB) {
        return percentageB - percentageA;
      }

      // Priority 3: Name (ascending/alphabetically)
      return a.name.localeCompare(b.name, "ar");
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
