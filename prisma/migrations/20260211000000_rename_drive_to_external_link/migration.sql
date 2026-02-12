-- Add new enum value EXTERNAL_LINK first
-- Note: This must be in a separate statement from the UPDATE due to PostgreSQL enum constraints
ALTER TYPE "AnswerType" ADD VALUE IF NOT EXISTS 'EXTERNAL_LINK';
