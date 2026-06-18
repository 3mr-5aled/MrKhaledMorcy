-- Create live sessions table
CREATE TABLE "live_sessions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sessionLink" TEXT NOT NULL,
    "sessionDateTime" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 120,
    "gradeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_sessions_pkey" PRIMARY KEY ("id")
);

-- Create generated access codes table
CREATE TABLE "session_codes" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_codes_pkey" PRIMARY KEY ("id")
);

-- Create attendance table
CREATE TABLE "session_attendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_attendance_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "session_codes_code_key" ON "session_codes"("code");
CREATE UNIQUE INDEX "session_attendance_codeId_key" ON "session_attendance"("codeId");

-- Query indexes
CREATE INDEX "live_sessions_gradeId_idx" ON "live_sessions"("gradeId");
CREATE INDEX "live_sessions_sessionDateTime_idx" ON "live_sessions"("sessionDateTime");
CREATE INDEX "session_codes_sessionId_idx" ON "session_codes"("sessionId");
CREATE INDEX "session_codes_gradeId_idx" ON "session_codes"("gradeId");
CREATE INDEX "session_codes_isRedeemed_idx" ON "session_codes"("isRedeemed");
CREATE INDEX "session_codes_redeemedAt_idx" ON "session_codes"("redeemedAt");
CREATE INDEX "session_attendance_sessionId_idx" ON "session_attendance"("sessionId");
CREATE INDEX "session_attendance_enteredAt_idx" ON "session_attendance"("enteredAt");

-- Foreign keys
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session_codes" ADD CONSTRAINT "session_codes_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "live_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session_codes" ADD CONSTRAINT "session_codes_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session_attendance" ADD CONSTRAINT "session_attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "live_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "session_attendance" ADD CONSTRAINT "session_attendance_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "session_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
