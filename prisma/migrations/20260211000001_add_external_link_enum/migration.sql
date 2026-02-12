-- Update all existing DRIVE records to EXTERNAL_LINK
UPDATE "answers" SET "type" = 'EXTERNAL_LINK' WHERE "type" = 'DRIVE';

-- Rename column driveUrl to externalUrl
ALTER TABLE "answers" RENAME COLUMN "driveUrl" TO "externalUrl";

-- Note: PostgreSQL doesn't support removing enum values directly
-- The DRIVE enum value will remain in the database but won't be used
-- This is a safe approach that maintains backward compatibility
