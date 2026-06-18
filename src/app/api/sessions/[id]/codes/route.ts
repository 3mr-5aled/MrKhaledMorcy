import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateCodeValue, getSessionAnalytics } from "@/lib/sessions";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";

const generateCodesSchema = z.object({
  count: z.number().int().min(1).max(500),
});

type AuthSession = {
  user?: {
    id?: string;
  };
} | null;

async function getSessionCodesPayload(sessionId: string) {
  const [session, codes, total, redeemed] = await Promise.all([
    db.liveSession.findUnique({
      where: { id: sessionId },
      include: { grade: true },
    }),
    db.sessionCode.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      include: {
        attendance: true,
        grade: true,
      },
    }),
    db.sessionCode.count({ where: { sessionId } }),
    db.sessionCode.count({ where: { sessionId, isRedeemed: true } }),
  ]);

  if (!session) return null;

  return {
    session,
    codes,
    analytics: getSessionAnalytics(total, redeemed),
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = (await getServerSession(authOptions)) as AuthSession;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await getSessionCodesPayload(id);

    if (!payload) {
      return NextResponse.json(
        { error: "الحصة المباشرة غير موجودة" },
        { status: 404 },
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching session codes:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب أكواد الحصة" },
      { status: 500 },
    );
  }
}

export async function POST(
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
    const { count } = generateCodesSchema.parse(body);
    const liveSession = await db.liveSession.findUnique({
      where: { id },
      include: { grade: true },
    });

    if (!liveSession) {
      return NextResponse.json(
        { error: "الحصة المباشرة غير موجودة" },
        { status: 404 },
      );
    }

    const createdCodes: Prisma.SessionCodeCreateManyInput[] = [];
    const reserved = new Set<string>();
    let attempts = 0;

    while (createdCodes.length < count && attempts < count * 20) {
      attempts += 1;
      const code = generateCodeValue(liveSession.grade.slug, liveSession.id);

      if (reserved.has(code)) continue;

      const exists = await db.sessionCode.findUnique({ where: { code } });
      if (exists) continue;

      reserved.add(code);
      createdCodes.push({
        sessionId: liveSession.id,
        gradeId: liveSession.gradeId,
        code,
      });
    }

    if (createdCodes.length !== count) {
      return NextResponse.json(
        { error: "تعذر إنشاء أكواد فريدة، حاول مرة أخرى" },
        { status: 409 },
      );
    }

    await db.sessionCode.createMany({ data: createdCodes });

    const payload = await getSessionCodesPayload(id);
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error generating session codes:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء أكواد الحصة" },
      { status: 500 },
    );
  }
}
