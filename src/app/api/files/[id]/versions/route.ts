import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { restoreFileVersion } from "@/lib/fileUtils";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * GET /api/files/[id]/versions - Get version history for a file
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const file = await db.file.findUnique({
      where: { id },
      include: {
        versions: {
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error("Error fetching file versions:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب إصدارات الملف" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/files/[id]/versions - Restore a specific version
 * Body:
 * - versionNumber: number - Version number to restore
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { versionNumber } = body;

    if (!versionNumber || typeof versionNumber !== "number") {
      return NextResponse.json(
        { error: "يجب تحديد رقم الإصدار" },
        { status: 400 },
      );
    }

    // Restore the version
    const result = await restoreFileVersion(id, versionNumber, session.user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "فشل استعادة الإصدار" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: `تم استعادة الإصدار ${versionNumber} بنجاح`,
    });
  } catch (error) {
    console.error("Error restoring file version:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء استعادة الإصدار" },
      { status: 500 },
    );
  }
}
