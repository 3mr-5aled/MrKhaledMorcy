-- Add unitId and gradeId columns to quizzes table
ALTER TABLE "quizzes" ADD COLUMN "unitId" TEXT;
ALTER TABLE "quizzes" ADD COLUMN "gradeId" TEXT;

-- Add foreign key constraints
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE;
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE CASCADE;

-- Add indexes for query performance
CREATE INDEX "quizzes_unitId_idx" ON "quizzes"("unitId");
CREATE INDEX "quizzes_gradeId_idx" ON "quizzes"("gradeId");
