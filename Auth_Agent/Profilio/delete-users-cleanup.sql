-- Script to safely delete test users and their data
-- Run this in Supabase SQL Editor before deleting users from Auth dashboard

-- 1. First, delete social links for all profiles of users you want to delete
DELETE FROM social_links 
WHERE profile_id IN (
  SELECT id FROM profiles 
  WHERE user_id IN (
    -- Replace these with actual user IDs you want to delete
    'user-id-1',
    'user-id-2', 
    'user-id-3'
  )
);

-- 2. Then delete the profiles
DELETE FROM profiles 
WHERE user_id IN (
  -- Replace these with actual user IDs you want to delete
  'user-id-1',
  'user-id-2',
  'user-id-3'
);

-- 3. Now you can delete users from Supabase Auth dashboard
-- OR delete them here directly (be careful with this!)
-- DELETE FROM auth.users WHERE id IN ('user-id-1', 'user-id-2', 'user-id-3');

-- To find user IDs to delete, run this query first:
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC; 