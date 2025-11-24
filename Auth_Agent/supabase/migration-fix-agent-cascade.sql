-- Migration: Fix agent deletion when user is deleted
-- Problem: Agents were being deleted when users were deleted due to ON DELETE CASCADE
-- Solution: Change to ON DELETE SET NULL so agents persist independently
-- Agents are credentials and should work even if the user account is deleted

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE agents
DROP CONSTRAINT IF EXISTS agents_user_id_fkey;

-- Step 2: Re-add the foreign key with ON DELETE SET NULL instead of CASCADE
ALTER TABLE agents
ADD CONSTRAINT agents_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Step 3: Update RLS policies to allow service role to access agents without user_id
-- (Agents without user_id are orphaned but should still work for authentication)

-- Note: The existing RLS policies already allow service role full access via:
-- CREATE POLICY "Service role can do everything on agents" ON agents FOR ALL USING (true);
-- So orphaned agents (user_id = NULL) will still be accessible for authentication

-- Step 4: Add comment explaining the change
COMMENT ON COLUMN agents.user_id IS 'Links agent to user account for console management. Set to NULL if user is deleted - agent credentials remain valid.';

