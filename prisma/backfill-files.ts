/**
 * Backfill script to populate File and FileVersion tables with existing files
 * Scans /public/answers/ and /public/images/students/ directories
 * Matches files to database records (Answer.url, Answer.images, Student.image)
 * Creates initial File records with version=1
 * Flags orphaned files that don't match any records
 *
 * Run with: npx ts-node prisma/backfill-files.ts
 */

import { FileType, FileUsage, PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ScannedFile {
  path: string; // Web path (e.g., /answers/prep-1/unit-id/file.pdf)
  absolutePath: string; // Filesystem path
  size: number;
  type: FileType;
  originalName: string;
  mimeType: string;
}

interface BackfillResult {
  totalScanned: number;
  matched: number;
  orphaned: number;
  errors: number;
  details: {
    answers: { matched: number; files: string[] };
    students: { matched: number; files: string[] };
    orphans: { count: number; files: string[] };
    errors: { count: number; messages: string[] };
  };
}

/**
 * Recursively scan directory and collect all files
 */
function scanDirectory(dir: string, baseDir: string): ScannedFile[] {
  const files: ScannedFile[] = [];

  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip .versions directories
      if (item === ".versions") continue;
      files.push(...scanDirectory(fullPath, baseDir));
    } else if (stat.isFile()) {
      // Convert to web path
      const webPath =
        "/" + path.relative(baseDir, fullPath).replace(/\\/g, "/");

      // Determine file type
      const ext = path.extname(item).toLowerCase();
      let fileType: FileType;
      let mimeType: string;

      if (ext === ".pdf") {
        fileType = "PDF";
        mimeType = "application/pdf";
      } else if (item.includes("-thumb.")) {
        fileType = "THUMBNAIL";
        mimeType = "image/webp";
      } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
        fileType = "IMAGE";
        mimeType = `image/${ext.replace(".", "")}`;
      } else {
        // Skip unknown file types
        continue;
      }

      files.push({
        path: webPath,
        absolutePath: fullPath,
        size: stat.size,
        type: fileType,
        originalName: item,
        mimeType,
      });
    }
  }

  return files;
}

/**
 * Match files to Answer records
 */
async function matchAnswerFiles(
  files: ScannedFile[],
  result: BackfillResult,
): Promise<Map<string, string>> {
  const answers = await prisma.answer.findMany({
    select: {
      id: true,
      url: true,
      images: true,
      thumbnails: true,
      type: true,
    },
  });

  const matchedPaths = new Map<string, string>(); // path -> answerId

  for (const answer of answers) {
    // Match url field (PDF or first image)
    if (answer.url && answer.type !== "YOUTUBE" && answer.type !== "DRIVE") {
      const file = files.find((f) => f.path === answer.url);
      if (file) {
        matchedPaths.set(file.path, answer.id);
        result.details.answers.matched++;
        result.details.answers.files.push(file.path);
      }
    }

    // Match images array
    for (const imagePath of answer.images || []) {
      const file = files.find((f) => f.path === imagePath);
      if (file) {
        matchedPaths.set(file.path, answer.id);
        result.details.answers.matched++;
        result.details.answers.files.push(file.path);
      }
    }

    // Match thumbnails array
    for (const thumbPath of answer.thumbnails || []) {
      const file = files.find((f) => f.path === thumbPath);
      if (file) {
        matchedPaths.set(file.path, answer.id);
        result.details.answers.matched++;
        result.details.answers.files.push(file.path);
      }
    }
  }

  return matchedPaths;
}

/**
 * Match files to Student records
 */
async function matchStudentFiles(
  files: ScannedFile[],
  result: BackfillResult,
): Promise<Map<string, string>> {
  const students = await prisma.student.findMany({
    select: {
      id: true,
      image: true,
    },
  });

  const matchedPaths = new Map<string, string>(); // path -> studentId

  for (const student of students) {
    if (student.image) {
      const file = files.find((f) => f.path === student.image);
      if (file) {
        matchedPaths.set(file.path, student.id);
        result.details.students.matched++;
        result.details.students.files.push(file.path);
      }

      // Also check for thumbnail
      const thumbPath = student.image.replace(
        /\.(webp|jpg|jpeg|png|gif)$/,
        "-thumb.$1",
      );
      const thumbFile = files.find((f) => f.path === thumbPath);
      if (thumbFile) {
        matchedPaths.set(thumbFile.path, student.id);
        result.details.students.matched++;
        result.details.students.files.push(thumbFile.path);
      }
    }
  }

  return matchedPaths;
}

/**
 * Create File and FileVersion records
 */
async function createFileRecords(
  files: ScannedFile[],
  answerMatches: Map<string, string>,
  studentMatches: Map<string, string>,
  result: BackfillResult,
): Promise<void> {
  let created = 0;

  for (const file of files) {
    try {
      // Determine usage and linked record
      let usedIn: FileUsage;
      let linkedRecordId: string | null = null;
      let isOrphaned = false;

      if (answerMatches.has(file.path)) {
        usedIn = "ANSWER";
        linkedRecordId = answerMatches.get(file.path)!;
      } else if (studentMatches.has(file.path)) {
        usedIn = "STUDENT";
        linkedRecordId = studentMatches.get(file.path)!;
      } else {
        usedIn = "OTHER";
        linkedRecordId = null;
        isOrphaned = true;
        result.details.orphans.count++;
        result.details.orphans.files.push(file.path);
      }

      // Create File record
      const fileRecord = await prisma.file.create({
        data: {
          path: file.path,
          type: file.type,
          size: file.size,
          originalName: file.originalName,
          mimeType: file.mimeType,
          usedIn,
          linkedRecordId,
          isOrphaned,
          isActive: true,
          uploadedBy: null, // Unknown for backfilled files
          createdAt: fs.statSync(file.absolutePath).birthtime, // Use actual file creation time
        },
      });

      // Create initial FileVersion (version 1)
      await prisma.fileVersion.create({
        data: {
          fileId: fileRecord.id,
          path: file.path, // Initial version has same path as current
          versionNumber: 1,
          size: file.size,
          createdBy: null,
          changeReason: "Initial backfill from existing files",
          createdAt: fileRecord.createdAt,
        },
      });

      created++;

      // Log progress every 10 files
      if (created % 10 === 0) {
        console.log(`✅ Created ${created} file records...`);
      }
    } catch (error) {
      result.details.errors.count++;
      result.details.errors.messages.push(
        `Error creating record for ${file.path}: ${error}`,
      );
      console.error(`❌ Error creating record for ${file.path}:`, error);
    }
  }

  console.log(`✅ Successfully created ${created} file records`);
}

/**
 * Main backfill function
 */
async function backfillFiles() {
  console.log("🚀 Starting file backfill process...\n");

  const result: BackfillResult = {
    totalScanned: 0,
    matched: 0,
    orphaned: 0,
    errors: 0,
    details: {
      answers: { matched: 0, files: [] },
      students: { matched: 0, files: [] },
      orphans: { count: 0, files: [] },
      errors: { count: 0, messages: [] },
    },
  };

  try {
    // Scan directories
    const publicDir = path.join(process.cwd(), "public");
    const answersDir = path.join(publicDir, "answers");
    const studentsDir = path.join(publicDir, "images", "students");

    console.log("📂 Scanning directories...");
    console.log(`   - ${answersDir}`);
    console.log(`   - ${studentsDir}\n`);

    const answerFiles = scanDirectory(answersDir, publicDir);
    const studentFiles = scanDirectory(studentsDir, publicDir);
    const allFiles = [...answerFiles, ...studentFiles];

    result.totalScanned = allFiles.length;
    console.log(`📊 Found ${allFiles.length} files total`);
    console.log(`   - Answers: ${answerFiles.length}`);
    console.log(`   - Students: ${studentFiles.length}\n`);

    if (allFiles.length === 0) {
      console.log("⚠️  No files found. Exiting.");
      return;
    }

    // Match files to database records
    console.log("🔍 Matching files to database records...");
    const answerMatches = await matchAnswerFiles(allFiles, result);
    const studentMatches = await matchStudentFiles(allFiles, result);

    result.matched = answerMatches.size + studentMatches.size;
    result.orphaned = allFiles.length - result.matched;

    console.log(`   ✅ Matched ${result.matched} files`);
    console.log(`   ⚠️  Found ${result.orphaned} orphaned files\n`);

    // Check if File table already has records
    const existingCount = await prisma.file.count();
    if (existingCount > 0) {
      console.log(
        `⚠️  Warning: File table already has ${existingCount} records.`,
      );
      console.log("   This script will create duplicate records.");
      console.log(
        "   Press Ctrl+C to cancel or wait 5 seconds to continue...\n",
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // Create File and FileVersion records
    console.log("💾 Creating database records...\n");
    await createFileRecords(allFiles, answerMatches, studentMatches, result);

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 BACKFILL SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total files scanned:    ${result.totalScanned}`);
    console.log(
      `Matched to records:     ${result.matched} (${((result.matched / result.totalScanned) * 100).toFixed(1)}%)`,
    );
    console.log(`  - Answer files:       ${result.details.answers.matched}`);
    console.log(`  - Student files:      ${result.details.students.matched}`);
    console.log(
      `Orphaned files:         ${result.orphaned} (${((result.orphaned / result.totalScanned) * 100).toFixed(1)}%)`,
    );
    console.log(`Errors:                 ${result.details.errors.count}`);
    console.log("=".repeat(60));

    if (result.details.orphans.count > 0) {
      console.log("\n⚠️  ORPHANED FILES:");
      result.details.orphans.files.forEach((f) => console.log(`   - ${f}`));
    }

    if (result.details.errors.count > 0) {
      console.log("\n❌ ERRORS:");
      result.details.errors.messages.forEach((m) => console.log(`   - ${m}`));
    }

    console.log("\n✅ Backfill complete!\n");
  } catch (error) {
    console.error("❌ Fatal error during backfill:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillFiles().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
