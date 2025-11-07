# Supabase Authentication Setup Guide

This guide will walk you through setting up Google and GitHub OAuth authentication for Auth Agent.

## Step 1: Apply Database Schema

First, apply the authentication schema extension to your Supabase database:

```bash
# Connect to your Supabase project
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Or use the Supabase SQL Editor in the dashboard
```

Then run the SQL from:
- `/supabase/schema.sql` (if not already applied)
- `/supabase/schema-auth.sql` (new authentication schema)

Or directly in Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project: `fddcizbzsfgzhcygddsw`
3. Navigate to **SQL Editor**
4. Paste and run the contents of `/supabase/schema-auth.sql`

## Step 2: Configure Google OAuth

### 2.1 Create Google OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: **External**
   - App name: **Auth Agent**
   - User support email: Your email
   - Developer contact: Your email
6. Application type: **Web application**
7. Name: **Auth Agent**
8. Authorized JavaScript origins:
   - `http://localhost:3001` (development)
   - `https://your-production-domain.com`
9. Authorized redirect URIs:
   - `https://fddcizbzsfgzhcygddsw.supabase.co/auth/v1/callback`
10. Click **Create**
11. Copy the **Client ID** and **Client Secret**

### 2.2 Configure in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `fddcizbzsfgzhcygddsw`
3. Navigate to **Authentication** > **Providers**
4. Find **Google** and click to configure
5. Enable Google provider
6. Paste your **Client ID** and **Client Secret**
7. Click **Save**

## Step 3: Configure GitHub OAuth

### 3.1 Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** > **New OAuth App**
3. Fill in the details:
   - Application name: **Auth Agent**
   - Homepage URL: `https://your-domain.com` or `http://localhost:3001`
   - Authorization callback URL: `https://fddcizbzsfgzhcygddsw.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Click **Generate a new client secret**
6. Copy the **Client ID** and **Client Secret**

### 3.2 Configure in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `fddcizbzsfgzhcygddsw`
3. Navigate to **Authentication** > **Providers**
4. Find **GitHub** and click to configure
5. Enable GitHub provider
6. Paste your **Client ID** and **Client Secret**
7. Click **Save**

## Step 4: Configure Email Authentication (Optional)

If you want to allow email/password sign up:

1. Go to **Authentication** > **Providers** in Supabase
2. Find **Email** and ensure it's enabled
3. Configure email templates (optional):
   - Navigate to **Authentication** > **Email Templates**
   - Customize the confirmation email
   - Customize the password reset email

## Step 5: Update Site URL

1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3001`
   - Production: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:3001/auth/callback`
   - `https://your-domain.com/auth/callback`

## Step 6: Create Your Admin User

After setting up authentication, sign up for an account through the website. Then, manually set your account as admin:

```sql
-- In Supabase SQL Editor
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Step 7: Test Authentication

### Test Google Login:
1. Navigate to `http://localhost:3001/login`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Verify you're redirected to `/dashboard`

### Test GitHub Login:
1. Navigate to `http://localhost:3001/login`
2. Click "Continue with GitHub"
3. Complete GitHub OAuth flow
4. Verify you're redirected to `/dashboard`

### Test Email Signup:
1. Navigate to `http://localhost:3001/signup`
2. Fill in name, email, and password
3. Submit the form
4. Check your email for confirmation
5. Click the confirmation link
6. Login and verify you're redirected to `/dashboard`

## Step 8: Verify Database Setup

Check that everything is working:

```sql
-- Check user profiles are being created
SELECT * FROM user_profiles;

-- Check RLS policies are active
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Verify trigger is working
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

## Environment Variables

Ensure your `.env` file has:

```bash
NEXT_PUBLIC_SERVER_URL=https://auth-agent-workers.hetkp8044.workers.dev
NEXT_PUBLIC_SUPABASE_URL=https://fddcizbzsfgzhcygddsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Troubleshooting

### "Invalid login credentials" error
- Check that email confirmation is not required, or user has confirmed email
- Verify password meets minimum requirements (6 characters)

### "Unable to validate email address: invalid format"
- Ensure email is in valid format
- Check for typos in email field

### OAuth redirect not working
- Verify redirect URLs in Google/GitHub OAuth settings match Supabase callback URL exactly
- Check Site URL and Redirect URLs in Supabase settings

### User not redirected after login
- Check middleware is properly configured in `/src/middleware.ts`
- Verify auth callback route exists at `/src/app/auth/callback/route.ts`

### RLS policies blocking access
- Verify user_profiles table has entry for the user
- Check that user_id is properly set on agents/clients
- Ensure policies match your use case

## Next Steps

After authentication is working:

1. ✅ Users can sign up/login with Google, GitHub, or email
2. ✅ User profiles are automatically created
3. ✅ RLS policies protect agent and client data
4. 🔄 Build separate dashboards for agents and clients
5. 🔄 Add admin panel for full system access
6. 🔄 Update agent/client creation to link with user_id

## Security Notes

- Never commit `.env` files with real credentials
- Always use environment variables for secrets
- Keep Supabase service role key secure (only use server-side)
- Regularly rotate OAuth client secrets
- Monitor authentication logs in Supabase dashboard

## Support

If you encounter issues:
1. Check Supabase logs: **Authentication** > **Logs**
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test with a fresh browser/incognito window
