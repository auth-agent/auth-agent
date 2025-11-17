-- Migration: Make user_name nullable in agents table
-- Date: 2025-01-XX
-- Description: user_name is now optional since websites only need email for matching

-- Make user_name nullable
ALTER TABLE agents
ALTER COLUMN user_name DROP NOT NULL;

-- Update existing empty strings to NULL for consistency
UPDATE agents
SET user_name = NULL
WHERE user_name = '';

-- Add comment
COMMENT ON COLUMN agents.user_name IS 'Optional user name. Websites only need email for account matching.';













