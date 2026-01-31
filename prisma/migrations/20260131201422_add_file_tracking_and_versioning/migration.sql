-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('PDF', 'IMAGE', 'THUMBNAIL');

-- CreateEnum
CREATE TYPE "FileUsage" AS ENUM ('ANSWER', 'STUDENT', 'OTHER');

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" "FileType" NOT NULL,
    "size" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT,
    "usedIn" "FileUsage" NOT NULL,
    "linkedRecordId" TEXT,
    "uploadedBy" TEXT,
    "isOrphaned" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_versions" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "createdBy" TEXT,
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_path_key" ON "files"("path");

-- CreateIndex
CREATE INDEX "files_usedIn_idx" ON "files"("usedIn");

-- CreateIndex
CREATE INDEX "files_linkedRecordId_idx" ON "files"("linkedRecordId");

-- CreateIndex
CREATE INDEX "files_isOrphaned_idx" ON "files"("isOrphaned");

-- CreateIndex
CREATE INDEX "files_isActive_idx" ON "files"("isActive");

-- CreateIndex
CREATE INDEX "files_createdAt_idx" ON "files"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "file_versions_fileId_idx" ON "file_versions"("fileId");

-- CreateIndex
CREATE INDEX "file_versions_createdAt_idx" ON "file_versions"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "file_versions_fileId_versionNumber_key" ON "file_versions"("fileId", "versionNumber");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
