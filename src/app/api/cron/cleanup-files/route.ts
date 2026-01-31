import { logActivity } from "@/lib/activity";
import { db } from "@/lib/db";
import { existsSync } from "fs";
import { readdir, rmdir, unlink } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

/**
 * Scheduled cleanup job for file management
 * - Deletes orphaned files older than 30 days
 * - Prunes old file versions (keeps last 5)
 * - Cleans up empty directories
 * - Logs cleanup actions
 *
 * Should be called via Netlify scheduled functions or cron
 * Authorization: Requires CRON_SECRET header for security
 */
export async function GET(request: Request) {
  try {
    // Security: Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🧹 Starting scheduled file cleanup...");

    const results = {
      orphanedFilesDeleted: 0,
      versionsDeleted: 0,
      emptyDirectoriesDeleted: 0,
      errors: [] as string[],
    };

    // 1. Delete orphaned files older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orphanedFiles = await db.file.findMany({
      where: {
        isOrphaned: true,
        isActive: false,
        updatedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`📋 Found ${orphanedFiles.length} orphaned files to delete`);

    for (const file of orphanedFiles) {
      try {
        // Delete physical file
        const cleanPath = file.path.startsWith("/")
          ? file.path.substring(1)
          : file.path;
        const fullPath = path.join(process.cwd(), "public", cleanPath);

        if (existsSync(fullPath)) {
          await unlink(fullPath);
          console.log(`🗑️  Deleted orphaned file: ${file.path}`);
        }

        // Delete all versions
        const versions = await db.fileVersion.findMany({
          where: { fileId: file.id },
        });

        for (const version of versions) {
          try {
            const versionCleanPath = version.path.startsWith("/")
              ? version.path.substring(1)
              : version.path;
            const versionFullPath = path.join(
              process.cwd(),
              "public",
              versionCleanPath,
            );

            if (existsSync(versionFullPath)) {
              await unlink(versionFullPath);
            }
          } catch (error) {
            console.error(`Error deleting version ${version.id}:`, error);
          }
        }

        // Delete database records
        await db.fileVersion.deleteMany({
          where: { fileId: file.id },
        });

        await db.file.delete({
          where: { id: file.id },
        });

        results.orphanedFilesDeleted++;
      } catch (error) {
        console.error(`Error deleting orphaned file ${file.id}:`, error);
        results.errors.push(`Failed to delete ${file.path}: ${error}`);
      }
    }

    // 2. Prune old versions (keep last 5 for each file)
    const filesWithVersions = await db.file.findMany({
      where: { isActive: true },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    console.log(
      `📚 Checking ${filesWithVersions.length} files for old versions`,
    );

    for (const file of filesWithVersions) {
      if (file.versions.length > 5) {
        const versionsToDelete = file.versions.slice(5); // Keep first 5, delete rest

        for (const version of versionsToDelete) {
          try {
            // Delete physical file
            const versionCleanPath = version.path.startsWith("/")
              ? version.path.substring(1)
              : version.path;
            const versionFullPath = path.join(
              process.cwd(),
              "public",
              versionCleanPath,
            );

            if (existsSync(versionFullPath)) {
              await unlink(versionFullPath);
            }

            // Delete database record
            await db.fileVersion.delete({
              where: { id: version.id },
            });

            results.versionsDeleted++;
          } catch (error) {
            console.error(
              `Error deleting version ${version.id} for file ${file.id}:`,
              error,
            );
            results.errors.push(
              `Failed to delete version ${version.versionNumber} of ${file.path}: ${error}`,
            );
          }
        }

        console.log(
          `🧹 Pruned ${versionsToDelete.length} old versions for file ${file.id}`,
        );
      }
    }

    // 3. Clean up empty directories
    const emptyDirsDeleted = await cleanupEmptyDirectories();
    results.emptyDirectoriesDeleted = emptyDirsDeleted;

    // 4. Log cleanup activity (use a system user or first admin)
    try {
      const adminUser = await db.user.findFirst({
        where: { role: "SUPER_ADMIN" },
      });

      if (adminUser) {
        await logActivity({
          action: "DELETE",
          entityType: "file",
          entityId: null,
          entityName: `Scheduled cleanup: ${results.orphanedFilesDeleted} orphaned files, ${results.versionsDeleted} old versions`,
          userId: adminUser.id,
        });
      }
    } catch (error) {
      console.error("Error logging cleanup activity:", error);
    }

    console.log("✅ Cleanup completed successfully");
    console.log("📊 Results:", results);

    return NextResponse.json({
      success: true,
      message: "Cleanup completed successfully",
      results,
    });
  } catch (error) {
    console.error("❌ Error during scheduled cleanup:", error);
    return NextResponse.json(
      {
        error: "Cleanup failed",
        details: String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Recursively clean up empty directories in answers and students folders
 */
async function cleanupEmptyDirectories(): Promise<number> {
  let deletedCount = 0;
  const publicDir = path.join(process.cwd(), "public");

  async function cleanDir(dir: string): Promise<boolean> {
    try {
      const items = await readdir(dir);
      let hasFiles = false;

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await import("fs/promises").then((fs) =>
          fs.stat(fullPath),
        );

        if (stat.isDirectory()) {
          // Skip .versions directories for now
          if (item === ".versions") {
            hasFiles = true;
            continue;
          }

          const subdirHasFiles = await cleanDir(fullPath);
          if (subdirHasFiles) {
            hasFiles = true;
          }
        } else {
          hasFiles = true;
        }
      }

      // If directory is empty, delete it
      if (!hasFiles) {
        await rmdir(dir);
        console.log(`🗑️  Deleted empty directory: ${dir}`);
        deletedCount++;
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error cleaning directory ${dir}:`, error);
      return true; // Assume has files to avoid cascading errors
    }
  }

  // Clean answers directories
  const answersDir = path.join(publicDir, "answers");
  if (existsSync(answersDir)) {
    await cleanDir(answersDir);
  }

  // Clean students directories
  const studentsDir = path.join(publicDir, "images", "students");
  if (existsSync(studentsDir)) {
    await cleanDir(studentsDir);
  }

  return deletedCount;
}
