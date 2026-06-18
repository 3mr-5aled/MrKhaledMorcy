import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { toUTC } from "@/lib/dateUtils";
import { db } from "@/lib/db";
import { mapSessionForResponse } from "@/lib/sessions";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const sessionSchema = z.object({
  title: z.string().min(1, "عنوان الحصة مطلوب"),
  slug: z.string().min(1, "رمز الحصة (Slug) مطلوب").max(20, "الرمز طويل جداً"),
  description: z.string().optional().nullable(),
  sessionLink: z.string().url("رابط الحصة غير صالح"),
  sessionDateTime: z.string().datetime("ميعاد الحصة غير صالح"),
  durationMinutes: z.number().int().min(1).max(600).default(120),
  gradeId: z.string().min(1, "الصف الدراسي مطلوب"),
});

type AuthSession = {
  user?: {
    id?: string;
  };
} | null;

export async function GET(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as AuthSession;
    const isAdmin = !!session?.user?.id;
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId");

    const sessions = await db.liveSession.findMany({
      where: {
        ...(gradeId && { gradeId }),
      },
      orderBy: { sessionDateTime: "desc" },
      include: {
        grade: true,
        _count: {
          select: {
            codes: true,
            attendance: true,
          },
        },
      },
    });

    return NextResponse.json(
      sessions.map((item) =>
        mapSessionForResponse(item, { includeLink: isAdmin }),
      ),
    );
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الحصص المباشرة" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as AuthSession;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sessionSchema.parse(body);
    const grade = await db.grade.findUnique({
      where: { id: validatedData.gradeId },
    });

    if (!grade) {
      return NextResponse.json(
        { error: "الصف الدراسي غير موجود" },
        { status: 404 },
      );
    }

    const liveSession = await db.liveSession.create({
      data: {
        ...validatedData,
        slug: validatedData.slug.trim().toUpperCase(),
        description: validatedData.description || null,
        sessionDateTime: toUTC(validatedData.sessionDateTime) || new Date(),
      },
      include: {
        grade: true,
        _count: {
          select: {
            codes: true,
            attendance: true,
          },
        },
      },
    });

    await logActivity({
      action: "CREATE",
      entityType: "session",
      entityId: liveSession.id,
      entityName: liveSession.title,
      userId: session.user.id,
    });

    return NextResponse.json(mapSessionForResponse(liveSession), {
      status: 201,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الحصة المباشرة" },
      { status: 500 },
    );
  }
}
