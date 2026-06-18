import { logActivity } from "@/lib/activity";
import { authOptions } from "@/lib/auth";
import { toUTC } from "@/lib/dateUtils";
import { db } from "@/lib/db";
import { mapSessionForResponse } from "@/lib/sessions";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const sessionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  sessionLink: z.string().url().optional(),
  sessionDateTime: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(1).max(600).optional(),
  gradeId: z.string().min(1).optional(),
});

type AuthSession = {
  user?: {
    id?: string;
  };
} | null;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = (await getServerSession(authOptions)) as AuthSession;
    const isAdmin = !!session?.user?.id;
    const liveSession = await db.liveSession.findUnique({
      where: { id },
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

    if (!liveSession) {
      return NextResponse.json(
        { error: "الحصة المباشرة غير موجودة" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      mapSessionForResponse(liveSession, { includeLink: isAdmin }),
    );
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الحصة المباشرة" },
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
    const session = (await getServerSession(authOptions)) as AuthSession;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sessionSchema.parse(body);
    const oldSession = await db.liveSession.findUnique({ where: { id } });

    if (!oldSession) {
      return NextResponse.json(
        { error: "الحصة المباشرة غير موجودة" },
        { status: 404 },
      );
    }

    if (validatedData.gradeId) {
      const grade = await db.grade.findUnique({
        where: { id: validatedData.gradeId },
      });

      if (!grade) {
        return NextResponse.json(
          { error: "الصف الدراسي غير موجود" },
          { status: 404 },
        );
      }
    }

    const liveSession = await db.liveSession.update({
      where: { id },
      data: {
        ...validatedData,
        ...(validatedData.description !== undefined && {
          description: validatedData.description || null,
        }),
        ...(validatedData.sessionDateTime !== undefined && {
          sessionDateTime:
            toUTC(validatedData.sessionDateTime) || oldSession.sessionDateTime,
        }),
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
      action: "UPDATE",
      entityType: "session",
      entityId: liveSession.id,
      entityName: liveSession.title,
      userId: session.user.id,
    });

    return NextResponse.json(mapSessionForResponse(liveSession));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الحصة المباشرة" },
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
    const session = (await getServerSession(authOptions)) as AuthSession;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const liveSession = await db.liveSession.findUnique({ where: { id } });

    if (!liveSession) {
      return NextResponse.json(
        { error: "الحصة المباشرة غير موجودة" },
        { status: 404 },
      );
    }

    await db.liveSession.delete({ where: { id } });

    await logActivity({
      action: "DELETE",
      entityType: "session",
      entityId: id,
      entityName: liveSession.title,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الحصة المباشرة" },
      { status: 500 },
    );
  }
}
