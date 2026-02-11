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
import { getSupabaseClient, getSupabasePublicUrl } from "@/lib/supabase";
import { mkdir, unlink, writeFile } from "fs/promises";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    // Check if running in production/serverless (use Supabase) vs local development
    // FIX: Use NODE_ENV instead of just NETLIFY env var (which isn't always set)
    // This prevents "EROFS: read-only file system" errors in serverless environments
    const isProduction =
      process.env.NODE_ENV === "production" ||
      process.env.NETLIFY === "true" ||
      process.env.VERCEL === "1" ||
      !!process.env.AWS_LAMBDA_FUNCTION_NAME; // Generic serverless check

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

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = sanitizeFilename(
      file.name.replace(`.${fileExt}`, ""),
    );
    const baseName = `${timestamp}-${sanitizedName}`;

    if (isProduction) {
      // === PRODUCTION: Use Supabase Storage ===
      try {
        const supabase = getSupabaseClient();
        const storagePath = studentId
          ? `students/${studentId}`
          : "students/temp";

        // Optimize image using Sharp in memory
        const optimizedBuffer = await sharp(buffer)
          .webp({ quality: 85 })
          .toBuffer();

        console.log("Creating thumbnail...");
        const thumbnailBuffer = await sharp(buffer)
          .resize(200, 200, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();

        // Upload optimized image to Supabase
        const optimizedFileName = `${baseName}.webp`;

        const { data: optimizedData, error: optimizedError } =
          await supabase.storage
            .from("uploads")
            .upload(`${storagePath}/${optimizedFileName}`, optimizedBuffer, {
              contentType: "image/webp",
              upsert: false,
            });

        if (optimizedError) {
          console.error("Supabase optimized upload error:", optimizedError);
          throw new Error(
            `Failed to upload optimized image: ${optimizedError.message}`,
          );
        }

        // Upload thumbnail to Supabase
        const thumbnailFileName = `${baseName}-thumb.webp`;

        const { data: thumbnailData, error: thumbnailError } =
          await supabase.storage
            .from("uploads")
            .upload(`${storagePath}/${thumbnailFileName}`, thumbnailBuffer, {
              contentType: "image/webp",
              upsert: false,
            });

        if (thumbnailError) {
          console.error("Supabase thumbnail upload error:", thumbnailError);
          // Clean up optimized image if thumbnail fails
          await supabase.storage
            .from("uploads")
            .remove([`${storagePath}/${optimizedFileName}`]);
          throw new Error(
            `Failed to upload thumbnail: ${thumbnailError.message}`,
          );
        }

        // Get public URLs
        const optimizedUrl = getSupabasePublicUrl(
          "uploads",
          `${storagePath}/${optimizedFileName}`,
        );
        const thumbnailUrl = getSupabasePublicUrl(
          "uploads",
          `${storagePath}/${thumbnailFileName}`,
        );

        const reduction = calculateSizeReduction(
          buffer.length,
          optimizedBuffer.length,
        );

        console.log(
          `Student image uploaded to Supabase successfully: ${file.name} - Size reduced by ${reduction}% (${buffer.length} → ${optimizedBuffer.length} bytes)`,
        );

        return NextResponse.json({
          path: optimizedUrl,
          thumbnail: thumbnailUrl,
          size: optimizedBuffer.length,
          originalSize: buffer.length,
          thumbnailSize: thumbnailBuffer.length,
          reduction: reduction,
          type: "webp",
        });
      } catch (supabaseError) {
        console.error("=== Supabase upload error ===");
        console.error("Error:", supabaseError);
        console.error(
          "Error message:",
          supabaseError instanceof Error ? supabaseError.message : "Unknown",
        );
        console.error(
          "Error stack:",
          supabaseError instanceof Error ? supabaseError.stack : "No stack",
        );

        // Return more detailed error in production for debugging
        return NextResponse.json(
          {
            error: "حدث خطأ أثناء رفع الصورة إلى التخزين السحابي",
            details:
              supabaseError instanceof Error
                ? supabaseError.message
                : "Unknown error",
            hint: "تحقق من إعدادات Supabase Storage والصلاحيات",
          },
          { status: 500 },
        );
      }
    } else {
      // === DEVELOPMENT: Use local filesystem ===
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "images",
        "students",
        studentId || "temp",
      );
      await mkdir(uploadDir, { recursive: true });

      const filename = `${baseName}.${fileExt}`;
      const filePath = path.join(uploadDir, filename);

      // Write file
      await writeFile(filePath, buffer);

      // Optimize and generate thumbnails
      try {
        const optimizationResult = await optimizeImage(
          filePath,
          uploadDir,
          baseName,
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
    }
  } catch (error) {
    console.error("=== Error uploading student image ===");
    console.error("Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    console.error("Stack:", error instanceof Error ? error.stack : "No stack");

    // Log environment for debugging
    console.error("Environment:", {
      isProduction:
        process.env.NODE_ENV === "production" ||
        process.env.NETLIFY === "true" ||
        !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      nodeEnv: process.env.NODE_ENV,
      netlifyEnv: process.env.NETLIFY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    return NextResponse.json(
      {
        error: "حدث خطأ أثناء رفع صورة الطالب",
        details: errorMessage, // Always show details for debugging
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
      },
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
