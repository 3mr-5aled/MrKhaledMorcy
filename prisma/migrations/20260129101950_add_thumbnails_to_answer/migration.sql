-- AlterTable
ALTER TABLE "answers" ADD COLUMN     "thumbnails" TEXT[] DEFAULT ARRAY[]::TEXT[];
