import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteFile } from "@/lib/fileUtils";
import { existsSync } from "fs";
import { readdir, stat } from "fs/promises";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import path from "path";

/**
 * GET /api/files - List and search files
 * Query params:
 * - page (default: 1)
 * - limit (default: 50)
 * - type (PDF, IMAGE, THUMBNAIL)
 * - usedIn (ANSWER, STUDENT, OTHER)
 * - isOrphaned (true, false)
 * - isActive (true, false)
 * - search (search by filename)
 * - sortBy (size, createdAt, updatedAt)
 * - sortOrder (asc, desc)
 */
export async function GET(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");
    const usedIn = searchParams.get("usedIn");
    const isOrphaned = searchParams.get("isOrphaned");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (usedIn) where.usedIn = usedIn;
    if (isOrphaned !== null) where.isOrphaned = isOrphaned === "true";
    if (isActive !== null) where.isActive = isActive === "true";
    if (search) {
      where.OR = [
        { path: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await db.file.count({ where });

    // Get files with pagination
    const files = await db.file.findMany({
      where,
      include: {
        uploader: {
          select: { id: true, name: true, email: true },
        },
        versions: {
          select: { id: true, versionNumber: true, createdAt: true },
          orderBy: { versionNumber: "desc" },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate storage statistics
    const stats = await db.file.aggregate({
      where: { isActive: true },
      _sum: { size: true },
      _count: true,
    });

    const orphanedStats = await db.file.aggregate({
      where: { isOrphaned: true, isActive: true },
      _sum: { size: true },
      _count: true,
    });

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalFiles: stats._count || 0,
        totalSize: stats._sum?.size || 0,
        orphanedFiles: orphanedStats._count || 0,
        orphanedSize: orphanedStats._sum?.size || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الملفات" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/files - Delete single or multiple files
 * Body:
 * - fileIds: string[] - Array of file IDs to delete
 * - reason: string - Reason for deletion
 */
export async function DELETE(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileIds, reason } = body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: "يجب تحديد ملف واحد على الأقل للحذف" },
        { status: 400 },
      );
    }

    const results = {
      success: [] as string[],
      failed: [] as { fileId: string; error: string }[],
    };

    for (const fileId of fileIds) {
      try {
        const file = await db.file.findUnique({
          where: { id: fileId },
        });

        if (!file) {
          results.failed.push({
            fileId,
            error: "File not found in database",
          });
          continue;
        }

        // Delete with versioning
        const deleteResult = await deleteFile(file.path, {
          fileId: file.id,
          userId: session.user.id,
          changeReason: reason || "Bulk delete from file manager",
        });

        if (deleteResult) {
          results.success.push(fileId);
        } else {
          results.failed.push({
            fileId,
            error: "Failed to delete file",
          });
        }
      } catch (error) {
        results.failed.push({
          fileId,
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      message: `تم حذف ${results.success.length} من ${fileIds.length} ملف بنجاح`,
      results,
    });
  } catch (error) {
    console.error("Error deleting files:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الملفات" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/files - Perform actions (scan for orphans, etc.)
 * Body:
 * - action: "scan" | "link"
 * - fileId: string (for link action)
 * - linkedRecordId: string (for link action)
 * - usedIn: string (for link action)
 */
export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, fileId, linkedRecordId, usedIn } = body;

    if (action === "scan") {
      // Scan for orphaned files
      return await scanForOrphans();
    } else if (action === "link") {
      // Link file to a record
      if (!fileId || !linkedRecordId || !usedIn) {
        return NextResponse.json(
          { error: "Missing required fields for link action" },
          { status: 400 },
        );
      }

      await db.file.update({
        where: { id: fileId },
        data: {
          linkedRecordId,
          usedIn,
          isOrphaned: false,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "تم ربط الملف بالسجل بنجاح",
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error performing file action:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تنفيذ العملية" },
      { status: 500 },
    );
  }
}

/**
 * Scan for orphaned files - compare File records with actual Answer/Student records
 */
async function scanForOrphans() {
  try {
    let orphanedCount = 0;
    let linkedCount = 0;
    let missingCount = 0;

    // Get all active files
    const allFiles = await db.file.findMany({
      where: { isActive: true },
    });

    // Check each file
    for (const file of allFiles) {
      // Check if file exists on disk
      const cleanPath = file.path.startsWith("/")
        ? file.path.substring(1)
        : file.path;
      const fullPath = path.join(process.cwd(), "public", cleanPath);

      if (!existsSync(fullPath)) {
        // File doesn't exist on disk - mark as orphaned
        await db.file.update({
          where: { id: file.id },
          data: { isOrphaned: true, isActive: false },
        });
        missingCount++;
        continue;
      }

      // Check if linked record still exists
      if (file.linkedRecordId) {
        let recordExists = false;

        if (file.usedIn === "ANSWER") {
          const answer = await db.answer.findUnique({
            where: { id: file.linkedRecordId },
            select: { url: true, images: true, thumbnails: true },
          });

          if (answer) {
            // Check if file path is still referenced in answer
            const isReferenced =
              answer.url === file.path ||
              answer.images?.includes(file.path) ||
              answer.thumbnails?.includes(file.path);

            if (isReferenced) {
              recordExists = true;
            }
          }
        } else if (file.usedIn === "STUDENT") {
          const student = await db.student.findUnique({
            where: { id: file.linkedRecordId },
            select: { image: true },
          });

          if (student && student.image === file.path) {
            recordExists = true;
          }
        }

        if (!recordExists) {
          // Mark as orphaned
          await db.file.update({
            where: { id: file.id },
            data: { isOrphaned: true, linkedRecordId: null },
          });
          orphanedCount++;
        } else {
          // Still linked - ensure not marked as orphaned
          if (file.isOrphaned) {
            await db.file.update({
              where: { id: file.id },
              data: { isOrphaned: false },
            });
            linkedCount++;
          }
        }
      }
    }

    // Scan disk for files not in database
    const untracked = await scanForUntrackedFiles();

    return NextResponse.json({
      message: "اكتمل فحص الملفات",
      results: {
        totalScanned: allFiles.length,
        newOrphans: orphanedCount,
        relinked: linkedCount,
        missingFiles: missingCount,
        untrackedFiles: untracked.length,
        untrackedPaths: untracked,
      },
    });
  } catch (error) {
    console.error("Error scanning for orphans:", error);
    throw error;
  }
}

/**
 * Scan disk for files that are not tracked in the database
 */
async function scanForUntrackedFiles(): Promise<string[]> {
  const untracked: string[] = [];
  const publicDir = path.join(process.cwd(), "public");

  async function scanDir(dir: string): Promise<void> {
    try {
      const items = await readdir(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          // Skip .versions directories
          if (item === ".versions") continue;
          await scanDir(fullPath);
        } else if (stats.isFile()) {
          // Convert to web path
          const webPath =
            "/" + path.relative(publicDir, fullPath).replace(/\\/g, "/");

          // Check if file is tracked
          if (
            webPath.startsWith("/answers/") ||
            webPath.startsWith("/images/students/")
          ) {
            const fileRecord = await db.file.findUnique({
              where: { path: webPath },
            });

            if (!fileRecord) {
              untracked.push(webPath);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }

  await scanDir(path.join(publicDir, "answers"));
  await scanDir(path.join(publicDir, "images", "students"));

  return untracked;
}
