/*
  Warnings:

  - You are about to drop the column `grade` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `manualOrder` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `students` table. All the data in the column will be lost.
  - Added the required column `gradeId` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentGrade` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testGrade` to the `students` table without a default value. This is not possible if the table is not empty.

*/

-- Delete all existing students data
DELETE FROM "students";

-- CreateEnum
CREATE TYPE "StudentPosition" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'NONE');

-- DropIndex
DROP INDEX "students_manualOrder_idx";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "grade",
DROP COLUMN "manualOrder",
DROP COLUMN "score",
ADD COLUMN     "gradeId" TEXT NOT NULL,
ADD COLUMN     "position" "StudentPosition" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "studentGrade" INTEGER NOT NULL,
ADD COLUMN     "testGrade" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "students_gradeId_idx" ON "students"("gradeId");

-- CreateIndex
CREATE INDEX "students_position_idx" ON "students"("position");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
