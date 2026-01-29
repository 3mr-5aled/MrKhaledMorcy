/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `grades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gradeId,slug]` on the table `units` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `grades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `units` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - Add slug columns with temporary default values
ALTER TABLE "grades" ADD COLUMN "slug" TEXT NOT NULL DEFAULT 'temp-slug';
ALTER TABLE "units" ADD COLUMN "slug" TEXT NOT NULL DEFAULT 'temp-slug';

-- Update existing grades with slug values - add row number to ensure uniqueness
UPDATE "grades" SET "slug" = 'grade-' || "order";

-- Update existing units with slug values - add row number to ensure uniqueness  
UPDATE "units" SET "slug" = 'unit-' || "order";

-- Remove default values
ALTER TABLE "grades" ALTER COLUMN "slug" DROP DEFAULT;
ALTER TABLE "units" ALTER COLUMN "slug" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "grades_slug_key" ON "grades"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "units_gradeId_slug_key" ON "units"("gradeId", "slug");
