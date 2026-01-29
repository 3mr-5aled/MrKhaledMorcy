import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

export interface OptimizationResult {
  optimizedPath: string;
  thumbnailPath: string;
  originalSize: number;
  optimizedSize: number;
  thumbnailSize: number;
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 85,
  format: "webp",
  thumbnailWidth: 400,
  thumbnailHeight: 300,
};

/**
 * Optimize an image file by compressing, resizing, and converting to WebP format
 * Also generates a thumbnail version
 *
 * @param inputPath - Absolute file path to the original image
 * @param outputDir - Directory where optimized images will be saved
 * @param filename - Base filename (without extension)
 * @param options - Optimization options
 * @returns OptimizationResult with paths and sizes
 */
export async function optimizeImage(
  inputPath: string,
  outputDir: string,
  filename: string,
  options: OptimizationOptions = {},
): Promise<OptimizationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Get original file size
  const originalStats = await fs.stat(inputPath);
  const originalSize = originalStats.size;

  // Define output paths
  const optimizedFilename = `${filename}.${opts.format}`;
  const thumbnailFilename = `${filename}-thumb.${opts.format}`;
  const optimizedPath = path.join(outputDir, optimizedFilename);
  const thumbnailPath = path.join(outputDir, thumbnailFilename);

  // Process main optimized image
  await sharp(inputPath)
    .resize(opts.maxWidth, opts.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: opts.quality })
    .toFile(optimizedPath);

  // Process thumbnail
  await sharp(inputPath)
    .resize(opts.thumbnailWidth, opts.thumbnailHeight, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: opts.quality })
    .toFile(thumbnailPath);

  // Get optimized file sizes
  const optimizedStats = await fs.stat(optimizedPath);
  const thumbnailStats = await fs.stat(thumbnailPath);

  // Delete original file to save space (optional)
  await fs.unlink(inputPath);

  return {
    optimizedPath,
    thumbnailPath,
    originalSize,
    optimizedSize: optimizedStats.size,
    thumbnailSize: thumbnailStats.size,
  };
}

/**
 * Batch optimize multiple images
 *
 * @param imagePaths - Array of absolute file paths to images
 * @param outputDir - Directory where optimized images will be saved
 * @param options - Optimization options
 * @returns Array of OptimizationResults
 */
export async function optimizeImages(
  imagePaths: string[],
  outputDir: string,
  options: OptimizationOptions = {},
): Promise<OptimizationResult[]> {
  const results: OptimizationResult[] = [];

  for (const imagePath of imagePaths) {
    const filename = path.basename(imagePath, path.extname(imagePath));
    const result = await optimizeImage(imagePath, outputDir, filename, options);
    results.push(result);
  }

  return results;
}

/**
 * Get web-accessible path from absolute file path
 * Converts absolute path to relative path for web access
 *
 * @param absolutePath - Absolute file path
 * @returns Web-accessible path (e.g., /answers/prep-1/unit-1/image.webp)
 */
export function getWebPath(absolutePath: string): string {
  // Convert Windows backslashes to forward slashes
  const normalized = absolutePath.replace(/\\/g, "/");

  // Extract path after 'public/'
  const publicIndex = normalized.indexOf("/public/");
  if (publicIndex !== -1) {
    return normalized.substring(publicIndex + 7); // +7 to skip '/public'
  }

  // If 'public/' not found, try to extract from 'answers/' or 'images/'
  const answersIndex = normalized.indexOf("/answers/");
  if (answersIndex !== -1) {
    return normalized.substring(answersIndex);
  }

  const imagesIndex = normalized.indexOf("/images/");
  if (imagesIndex !== -1) {
    return normalized.substring(imagesIndex);
  }

  // Fallback: return as-is
  return absolutePath;
}

/**
 * Calculate size reduction percentage
 *
 * @param originalSize - Original file size in bytes
 * @param optimizedSize - Optimized file size in bytes
 * @returns Percentage reduction
 */
export function calculateSizeReduction(
  originalSize: number,
  optimizedSize: number,
): number {
  return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
}
