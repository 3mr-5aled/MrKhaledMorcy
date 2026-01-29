import fs from "fs/promises";
import path from "path";

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
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
