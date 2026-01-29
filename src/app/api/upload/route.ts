import { authOptions } from "@/lib/auth";
import {
  ALLOWED_FILE_TYPES,
  FILE_SIZE_LIMITS,
  getFileExtension,
  sanitizeFilename,
  validateFileSize,
  validateFileType,
} from "@/lib/fileUtils";
import {
  calculateSizeReduction,
  getWebPath,
  optimizeImage,
} from "@/lib/imageOptimization";
import { existsSync } from "fs";
import { mkdir, rmdir, unlink, writeFile } from "fs/promises";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(request: Request) {
  try {
    // SECURITY: Require authentication for file uploads
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const gradeId = formData.get("gradeId") as string;
    const unitId = formData.get("unitId") as string;
    const type = formData.get("type") as string; // "pdf" or "image"

    if (!file) {
      return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
    }

    if (!gradeId || !unitId) {
      return NextResponse.json(
        { error: "معرف المرحلة والوحدة مطلوبان" },
        { status: 400 },
      );
    }

    // Get file info
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = getFileExtension(file.name);

    // Validate file type
    const allowedTypes =
      type === "pdf" ? ALLOWED_FILE_TYPES.PDF : ALLOWED_FILE_TYPES.IMAGE;
    if (!validateFileType(file.name, allowedTypes)) {
      return NextResponse.json(
        {
          error: `نوع الملف غير مسموح. الأنواع المسموح بها: ${allowedTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate file size
    const maxSize =
      type === "pdf" ? FILE_SIZE_LIMITS.PDF : FILE_SIZE_LIMITS.IMAGE;
    if (!validateFileSize(buffer.length, maxSize)) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          error: `حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB}MB`,
        },
        { status: 400 },
      );
    }

    // Create directory structure
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "answers",
      gradeId,
      unitId,
    );
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = sanitizeFilename(
      file.name.replace(`.${fileExt}`, ""),
    );
    const filename = `${timestamp}-${sanitizedName}.${fileExt}`;
    const filePath = path.join(uploadDir, filename);

    // Write file
    await writeFile(filePath, buffer);

    // For images, optimize and generate thumbnails
    if (type === "image") {
      try {
        const optimizationResult = await optimizeImage(
          filePath,
          uploadDir,
          `${timestamp}-${sanitizedName}`,
        );

        // Convert to web paths
        const optimizedWebPath = getWebPath(optimizationResult.optimizedPath);
        const thumbnailWebPath = getWebPath(optimizationResult.thumbnailPath);

        const reduction = calculateSizeReduction(
          optimizationResult.originalSize,
          optimizationResult.optimizedSize,
        );

        console.log(
          `Image optimized: ${file.name} - Size reduced by ${reduction}% (${optimizationResult.originalSize} → ${optimizationResult.optimizedSize} bytes)`,
        );

        return NextResponse.json({
          path: optimizedWebPath,
          thumbnail: thumbnailWebPath,
          size: optimizationResult.optimizedSize,
          originalSize: optimizationResult.originalSize,
          thumbnailSize: optimizationResult.thumbnailSize,
          reduction: reduction,
          type: "webp",
        });
      } catch (optimizationError) {
        console.error("Error optimizing image:", optimizationError);
        // Fallback to original image if optimization fails
        await unlink(filePath); // Delete the temporary original
        throw optimizationError;
      }
    }

    // Return the web-accessible path (for PDFs)
    const webPath = `/answers/${gradeId}/${unitId}/${filename}`;

    return NextResponse.json({
      path: webPath,
      size: buffer.length,
      type: fileExt,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء رفع الملف" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // SECURITY: Require authentication for file deletion
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json({ error: "مسار الملف مطلوب" }, { status: 400 });
    }

    // SECURITY: Validate path to prevent path traversal attacks
    const normalizedPath = path.normalize(filePath);
    if (
      normalizedPath.includes("..") ||
      !normalizedPath.startsWith("/answers/") ||
      path.isAbsolute(normalizedPath.substring(1))
    ) {
      return NextResponse.json(
        { error: "مسار الملف غير صالح" },
        { status: 400 },
      );
    }

    // Convert web path to file system path
    const fullPath = path.join(process.cwd(), "public", filePath);

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
    }

    // Delete the file
    await unlink(fullPath);

    // If it's an image (webp), also try to delete the thumbnail
    if (fullPath.endsWith(".webp") && !fullPath.includes("-thumb.webp")) {
      const thumbnailPath = fullPath.replace(".webp", "-thumb.webp");
      if (existsSync(thumbnailPath)) {
        try {
          await unlink(thumbnailPath);
        } catch (err) {
          console.error("Error deleting thumbnail:", err);
          // Continue even if thumbnail deletion fails
        }
      }
    }

    // Try to remove empty parent directories (unitId folder)
    const parentDir = path.dirname(fullPath);
    try {
      const files = await import("fs/promises").then((fs) =>
        fs.readdir(parentDir),
      );
      if (files.length === 0) {
        await rmdir(parentDir);

        // Try to remove gradeId folder if empty
        const grandParentDir = path.dirname(parentDir);
        const grandParentFiles = await import("fs/promises").then((fs) =>
          fs.readdir(grandParentDir),
        );
        if (grandParentFiles.length === 0) {
          await rmdir(grandParentDir);
        }
      }
    } catch (err) {
      // Ignore errors when trying to remove directories
      // (they might not be empty or we might not have permissions)
    }

    return NextResponse.json({ message: "تم حذف الملف بنجاح" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الملف" },
      { status: 500 },
    );
  }
}
