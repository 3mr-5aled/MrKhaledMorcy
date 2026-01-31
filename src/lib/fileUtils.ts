import { FileType, FileUsage, PrismaClient } from "@prisma/client";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

const MAX_VERSIONS_TO_KEEP = 5;

/**
 * Create a versioned backup of a file before it's replaced or deleted
 * Moves the file to .versions/{timestamp}-{filename} subdirectory
 * Creates FileVersion record in database
 * Enforces retention policy (keeps last N versions)
 */
export async function createVersionedBackup(
  filePath: string,
  fileId: string,
  userId: string | null,
  changeReason: string,
): Promise<{ success: boolean; versionPath?: string; error?: string }> {
  try {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith("/")
      ? filePath.substring(1)
      : filePath;

    const fullPath = path.join(process.cwd(), "public", cleanPath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return { success: false, error: "File not found" };
    }

    // Get file stats
    const stats = await fs.stat(fullPath);

    // Create .versions directory in the same folder
    const fileDir = path.dirname(fullPath);
    const versionsDir = path.join(fileDir, ".versions");
    await fs.mkdir(versionsDir, { recursive: true });

    // Generate version filename with timestamp
    const timestamp = Date.now();
    const filename = path.basename(fullPath);
    const versionFilename = `${timestamp}-${filename}`;
    const versionFullPath = path.join(versionsDir, versionFilename);

    // Copy file to versions directory (don't delete original yet)
    await fs.copyFile(fullPath, versionFullPath);

    // Get next version number
    const existingVersions = await prisma.fileVersion.findMany({
      where: { fileId },
      orderBy: { versionNumber: "desc" },
      take: 1,
    });
    const nextVersionNumber =
      existingVersions.length > 0 ? existingVersions[0].versionNumber + 1 : 1;

    // Create version path relative to public directory
    const versionWebPath =
      "/" +
      path
        .relative(path.join(process.cwd(), "public"), versionFullPath)
        .replace(/\\/g, "/");

    // Create FileVersion record
    await prisma.fileVersion.create({
      data: {
        fileId,
        path: versionWebPath,
        versionNumber: nextVersionNumber,
        size: stats.size,
        createdBy: userId,
        changeReason,
      },
    });

    // Enforce retention policy - delete old versions if exceeding limit
    await pruneOldVersions(fileId);

    console.log(`✅ Created version ${nextVersionNumber} for ${filePath}`);
    return { success: true, versionPath: versionWebPath };
  } catch (error) {
    console.error(`❌ Error creating versioned backup for ${filePath}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Prune old versions to enforce retention policy
 * Keeps only the last MAX_VERSIONS_TO_KEEP versions
 */
async function pruneOldVersions(fileId: string): Promise<void> {
  try {
    const versions = await prisma.fileVersion.findMany({
      where: { fileId },
      orderBy: { versionNumber: "desc" },
    });

    if (versions.length > MAX_VERSIONS_TO_KEEP) {
      const versionsToDelete = versions.slice(MAX_VERSIONS_TO_KEEP);

      for (const version of versionsToDelete) {
        // Delete physical file
        const cleanPath = version.path.startsWith("/")
          ? version.path.substring(1)
          : version.path;
        const fullPath = path.join(process.cwd(), "public", cleanPath);

        try {
          await fs.unlink(fullPath);
          console.log(`🗑️  Deleted old version: ${version.path}`);
        } catch (error) {
          console.error(
            `⚠️  Could not delete old version file: ${version.path}`,
            error,
          );
        }

        // Delete database record
        await prisma.fileVersion.delete({
          where: { id: version.id },
        });
      }

      console.log(
        `🧹 Pruned ${versionsToDelete.length} old versions for file ${fileId}`,
      );
    }
  } catch (error) {
    console.error(`Error pruning old versions for file ${fileId}:`, error);
  }
}

/**
 * Restore a file from a specific version
 * Copies the versioned file back to the original location
 */
export async function restoreFileVersion(
  fileId: string,
  versionNumber: number,
  userId: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the version record
    const version = await prisma.fileVersion.findUnique({
      where: {
        fileId_versionNumber: {
          fileId,
          versionNumber,
        },
      },
    });

    if (!version) {
      return { success: false, error: "Version not found" };
    }

    // Get the file record
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return { success: false, error: "File record not found" };
    }

    // Get paths
    const versionPath = version.path.startsWith("/")
      ? version.path.substring(1)
      : version.path;
    const currentPath = file.path.startsWith("/")
      ? file.path.substring(1)
      : file.path;

    const versionFullPath = path.join(process.cwd(), "public", versionPath);
    const currentFullPath = path.join(process.cwd(), "public", currentPath);

    // Check if version file exists
    try {
      await fs.access(versionFullPath);
    } catch {
      return { success: false, error: "Version file not found on disk" };
    }

    // Create backup of current file before restoring
    if (file.isActive) {
      await createVersionedBackup(
        file.path,
        fileId,
        userId,
        `Backup before restoring version ${versionNumber}`,
      );
    }

    // Copy version file to current location
    await fs.copyFile(versionFullPath, currentFullPath);

    // Update file metadata
    const stats = await fs.stat(currentFullPath);
    await prisma.file.update({
      where: { id: fileId },
      data: {
        size: stats.size,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Restored file ${file.path} to version ${versionNumber}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error restoring file version:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Delete a file with versioning support
 * Creates a version before deletion if fileId is provided
 * Also cleans up thumbnails if the file is an image
 */
export async function deleteFile(
  filePath: string,
  options?: {
    fileId?: string;
    userId?: string | null;
    changeReason?: string;
    skipVersioning?: boolean;
  },
): Promise<boolean> {
  try {
    // Create versioned backup before deletion if fileId provided
    if (options?.fileId && !options?.skipVersioning) {
      const backupResult = await createVersionedBackup(
        filePath,
        options.fileId,
        options.userId || null,
        options.changeReason || "File deleted",
      );

      if (!backupResult.success) {
        console.warn(
          `⚠️  Could not create backup before deletion: ${backupResult.error}`,
        );
      }
    }

    // Remove leading slash if present
    const cleanPath = filePath.startsWith("/")
      ? filePath.substring(1)
      : filePath;

    // Build full path from public directory
    const fullPath = path.join(process.cwd(), "public", cleanPath);

    // Check if file exists
    await fs.access(fullPath);

    // Delete the file
    await fs.unlink(fullPath);

    // Mark file as inactive in database if fileId provided
    if (options?.fileId) {
      await prisma.file.update({
        where: { id: options.fileId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    }

    console.log(`File deleted successfully: ${fullPath}`);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
}

export function sanitizeFilename(filename: string): string {
  // Remove any path separators and special characters
  return filename
    .replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 200); // Limit filename length
}

export function getFileExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ext.startsWith(".") ? ext.substring(1) : ext;
}

export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

export function validateFileType(
  filename: string,
  allowedTypes: string[],
): boolean {
  const ext = getFileExtension(filename);
  return allowedTypes.includes(ext);
}

export const FILE_SIZE_LIMITS = {
  PDF: 10 * 1024 * 1024, // 10MB
  IMAGE: 5 * 1024 * 1024, // 5MB
};

export const ALLOWED_FILE_TYPES = {
  PDF: ["pdf"],
  IMAGE: ["jpg", "jpeg", "png", "gif", "webp"],
};

/**
 * Create a File record in database when uploading a new file
 */
export async function createFileRecord(
  filePath: string,
  fileType: FileType,
  fileSize: number,
  originalName: string,
  mimeType: string,
  usedIn: FileUsage,
  linkedRecordId: string | null,
  uploadedBy: string | null,
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  try {
    const file = await prisma.file.create({
      data: {
        path: filePath,
        type: fileType,
        size: fileSize,
        originalName,
        mimeType,
        usedIn,
        linkedRecordId,
        uploadedBy,
        isOrphaned: false,
        isActive: true,
      },
    });

    // Create initial version (version 1)
    await prisma.fileVersion.create({
      data: {
        fileId: file.id,
        path: filePath,
        versionNumber: 1,
        size: fileSize,
        createdBy: uploadedBy,
        changeReason: "Initial upload",
      },
    });

    console.log(`✅ Created file record: ${filePath}`);
    return { success: true, fileId: file.id };
  } catch (error) {
    console.error(`❌ Error creating file record for ${filePath}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get file record by path
 */
export async function getFileRecordByPath(
  filePath: string,
): Promise<{
  id: string;
  path: string;
  type: FileType;
  size: number;
  usedIn: FileUsage;
  linkedRecordId: string | null;
} | null> {
  try {
    const file = await prisma.file.findUnique({
      where: { path: filePath },
      select: {
        id: true,
        path: true,
        type: true,
        size: true,
        usedIn: true,
        linkedRecordId: true,
      },
    });
    return file;
  } catch (error) {
    console.error(`Error fetching file record for ${filePath}:`, error);
    return null;
  }
}

/**
 * Mark file as orphaned
 */
export async function markFileAsOrphaned(fileId: string): Promise<boolean> {
  try {
    await prisma.file.update({
      where: { id: fileId },
      data: {
        isOrphaned: true,
        linkedRecordId: null,
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Marked file as orphaned: ${fileId}`);
    return true;
  } catch (error) {
    console.error(`Error marking file as orphaned:`, error);
    return false;
  }
}
