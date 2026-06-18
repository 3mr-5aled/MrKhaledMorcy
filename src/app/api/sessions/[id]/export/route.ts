import { authOptions } from "@/lib/auth";
import { formatEgyptDate } from "@/lib/dateUtils";
import { db } from "@/lib/db";
import { getSessionAnalytics, getLiveSessionStatus } from "@/lib/sessions";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const liveSession = await db.liveSession.findUnique({
      where: { id },
      include: {
        grade: true,
        codes: {
          orderBy: { createdAt: "asc" },
          include: {
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

    const redeemed = liveSession.codes.filter((code) => code.isRedeemed).length;
    const analytics = getSessionAnalytics(liveSession.codes.length, redeemed);

    return NextResponse.json({
      session: {
        title: liveSession.title,
        description: liveSession.description,
        grade: liveSession.grade.name,
        sessionDateTime: formatEgyptDate(liveSession.sessionDateTime),
        durationMinutes: liveSession.durationMinutes,
        status: getLiveSessionStatus(
          liveSession.sessionDateTime,
          liveSession.durationMinutes,
        ),
      },
      analytics,
      codes: liveSession.codes.map((code) => ({
        code: code.code,
        isRedeemed: code.isRedeemed,
        redeemedAt: code.redeemedAt ? formatEgyptDate(code.redeemedAt) : "",
        enteredAt: code.attendance?.enteredAt
          ? formatEgyptDate(code.attendance.enteredAt)
          : "",
      })),
    });
  } catch (error) {
    console.error("Error exporting session:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تصدير بيانات الحصة" },
      { status: 500 },
    );
  }
}
