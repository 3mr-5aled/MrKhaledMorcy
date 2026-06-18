import { formatEgyptDate } from "@/lib/dateUtils";
import { db } from "@/lib/db";
import { canRevealSessionLink, getLiveSessionStatus } from "@/lib/sessions";
import { NextResponse } from "next/server";
import { z } from "zod";

const redeemSchema = z.object({
  code: z.string().min(1, "اكتب الكود هنا"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = redeemSchema.parse(body);
    const normalizedCode = code.trim().toUpperCase();

    const sessionCode = await db.sessionCode.findUnique({
      where: { code: normalizedCode },
      include: {
        grade: true,
        session: {
          include: {
            grade: true,
          },
        },
      },
    });

    if (!sessionCode || !sessionCode.session) {
      return NextResponse.json(
        { error: "الكود غير صحيح" },
        { status: 404 },
      );
    }

    if (sessionCode.isRedeemed) {
      const liveSession = sessionCode.session;
      const status = getLiveSessionStatus(
        liveSession.sessionDateTime,
        liveSession.durationMinutes,
      );

      if (status === "Finished") {
        return NextResponse.json(
          { error: "الكود تم استخدامه قبل كده والحصة انتهت" },
          { status: 409 },
        );
      }

      const includeLink = canRevealSessionLink(
        liveSession.sessionDateTime,
        liveSession.durationMinutes,
      );

      return NextResponse.json({
        title: liveSession.title,
        description: liveSession.description,
        grade: liveSession.grade.name,
        sessionDateTime: liveSession.sessionDateTime,
        formattedSessionDateTime: formatEgyptDate(liveSession.sessionDateTime),
        status: status,
        sessionLink: includeLink ? liveSession.sessionLink : null,
      });
    }

    const redeemedCode = await db.$transaction(async (tx) => {
      const updateResult = await tx.sessionCode.updateMany({
        where: {
          id: sessionCode.id,
          isRedeemed: false,
        },
        data: {
          isRedeemed: true,
          redeemedAt: new Date(),
        },
      });

      if (updateResult.count !== 1) {
        return null;
      }

      await tx.sessionAttendance.create({
        data: {
          sessionId: sessionCode.sessionId,
          codeId: sessionCode.id,
        },
      });

      return tx.sessionCode.findUnique({
        where: { id: sessionCode.id },
        include: {
          session: {
            include: {
              grade: true,
            },
          },
        },
      });
    });

    if (!redeemedCode) {
      return NextResponse.json(
        { error: "الكود تم استخدامه قبل كده" },
        { status: 409 },
      );
    }

    const liveSession = redeemedCode.session;
    const includeLink = canRevealSessionLink(
      liveSession.sessionDateTime,
      liveSession.durationMinutes,
    );

    return NextResponse.json({
      title: liveSession.title,
      description: liveSession.description,
      grade: liveSession.grade.name,
      sessionDateTime: liveSession.sessionDateTime,
      formattedSessionDateTime: formatEgyptDate(liveSession.sessionDateTime),
      status: getLiveSessionStatus(
        liveSession.sessionDateTime,
        liveSession.durationMinutes,
      ),
      sessionLink: includeLink ? liveSession.sessionLink : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "اكتب الكود هنا", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error redeeming session code:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء دخول الحصة" },
      { status: 500 },
    );
  }
}
