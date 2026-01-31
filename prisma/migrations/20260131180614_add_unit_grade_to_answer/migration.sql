-- AlterTable
ALTER TABLE "answers" ADD COLUMN     "gradeId" TEXT,
ADD COLUMN     "unitId" TEXT;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
