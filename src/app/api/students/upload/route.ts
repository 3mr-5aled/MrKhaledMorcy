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
import { mkdir, unlink, writeFile } from "fs/promises";
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
    const studentId = formData.get("studentId") as string;

    if (!file) {
      return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 });
    }

    // Get file info
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = getFileExtension(file.name);

    // Validate file type (images only)
    if (!validateFileType(file.name, ALLOWED_FILE_TYPES.IMAGE)) {
      return NextResponse.json(
        {
          error: `نوع الملف غير مسموح. الأنواع المسموح بها: ${ALLOWED_FILE_TYPES.IMAGE.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (!validateFileSize(buffer.length, FILE_SIZE_LIMITS.IMAGE)) {
      const maxSizeMB = FILE_SIZE_LIMITS.IMAGE / (1024 * 1024);
      return NextResponse.json(
        {
          error: `حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB}MB`,
        },
        { status: 400 },
      );
    }

    // Create directory structure for student images
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "images",
      "students",
      studentId || "temp",
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

    // Optimize and generate thumbnails
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
        `Student image optimized: ${file.name} - Size reduced by ${reduction}% (${optimizationResult.originalSize} → ${optimizationResult.optimizedSize} bytes)`,
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
      // Delete the temporary original file
      await unlink(filePath);
      throw optimizationError;
    }
  } catch (error) {
    console.error("Error uploading student image:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء رفع صورة الطالب" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get("path");

    if (!imagePath) {
      return NextResponse.json({ error: "مسار الصورة مطلوب" }, { status: 400 });
    }

    // Convert web path to file system path
    const filePath = path.join(process.cwd(), "public", imagePath);

    try {
      await unlink(filePath);
      console.log(`Deleted student image: ${imagePath}`);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      return NextResponse.json({ error: "فشل حذف الصورة" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الصورة" },
      { status: 500 },
    );
  }
}
