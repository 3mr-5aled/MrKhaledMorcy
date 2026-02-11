-- Add EXTERNAL_LINK enum value to AnswerType
-- This allows using EXTERNAL_LINK type alongside DRIVE during transition
ALTER TYPE "AnswerType" ADD VALUE IF NOT EXISTS 'EXTERNAL_LINK';
