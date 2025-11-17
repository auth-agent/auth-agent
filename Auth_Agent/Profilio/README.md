# Profilio - Auth Agent Integration Example

A production-ready Next.js website demonstrating Auth Agent OAuth 2.1 integration with the **Contextual Profile** scenario.

## Overview

Profilio showcases how to implement Auth Agent authentication in a real-world application, including:

- ✅ Complete OAuth 2.1 flow with PKCE
- ✅ User email matching via `/userinfo` endpoint
- ✅ Agent profiles linked to user accounts
- ✅ Dashboard showing user context when agent is linked
- ✅ Next.js 15 with App Router
- ✅ Supabase backend integration
- ✅ TypeScript with full type safety

## Features

### Contextual Profile Implementation

Profilio implements the **Contextual Profile** scenario, where:

1. **Agent authenticates** via Auth Agent OAuth flow
2. **User email is retrieved** from `/userinfo` endpoint
3. **User account is matched** by email in Supabase
4. **Agent profile is linked** to the user's account
5. **Dashboard shows user context** (profile, social links, etc.)

### Key Implementation Details

- **OAuth Flow**: Complete PKCE implementation with state management
- **Token Exchange**: Server-side token exchange with proper error handling
- **User Matching**: Automatic linking of agents to existing user accounts
- **Session Management**: Secure httpOnly cookies for session storage
- **Profile Management**: Separate agent profiles with user context access

## Project Structure

```
Profilio/
├── src/
│   ├── app/
│   │   ├── ai-auth/          # Auth Agent routes
│   │   │   ├── login/        # Sign-in page
│   │   │   ├── callback/     # OAuth callback handler
│   │   │   └── dashboard/    # Protected dashboard
│   │   └── api/
│   │       └── auth-agent/    # API routes
│   │           ├── exchange/ # Token exchange endpoint
│   │           └── profile/  # Agent profile management
│   ├── components/
│   │   ├── auth/             # Auth components
│   │   └── dashboard/        # Dashboard components
│   └── lib/
│       └── auth-agent-sdk.ts # Auth Agent client SDK
├── supabase-schema.sql       # Database schema
└── README.md                 # This file
```

## Setup

### 1. Prerequisites

- Node.js 18+
- Supabase account
- Auth Agent account (get credentials from [auth-agent.com/console](https://auth-agent.com/console))

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local`:

```bash
# Auth Agent OAuth Client Credentials
NEXT_PUBLIC_AUTH_AGENT_SERVER_URL=https://api.auth-agent.com
NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID=client_xxx
AUTH_AGENT_SERVER_URL=https://api.auth-agent.com
AUTH_AGENT_CLIENT_ID=client_xxx
AUTH_AGENT_CLIENT_SECRET=cs_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Set Up Database

Run the Supabase schema:

```bash
# In Supabase SQL Editor
cat supabase-schema.sql | # Copy and paste into Supabase SQL Editor
```

### 5. Register OAuth Client

1. Go to [auth-agent.com/console/website](https://auth-agent.com/console/website)
2. Register a new client
3. Add redirect URI: `http://localhost:3000/ai-auth/callback` (for local dev)
4. Copy `client_id` and `client_secret` to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/ai-auth/login` to test the integration.

## How It Works

### 1. OAuth Flow

When an agent clicks "Sign in with Auth Agent":

1. **Authorization Request**: Redirects to Auth Agent with PKCE parameters
2. **Agent Authentication**: Agent authenticates via back-channel
3. **Authorization Code**: Auth Agent redirects back with code
4. **Token Exchange**: Server exchanges code for access/refresh tokens
5. **User Info**: Server calls `/userinfo` to get user email
6. **User Matching**: Finds or creates user account by email
7. **Profile Linking**: Links agent profile to user account
8. **Session Creation**: Creates secure session with user context

### 2. User Matching

The key feature is automatic user matching:

```typescript
// In /api/auth-agent/exchange/route.ts
const userInfo = await fetch(`${serverUrl}/userinfo`, {
  headers: { Authorization: `Bearer ${tokens.access_token}` }
}).then(r => r.json());

// Find existing user by email
const existingUser = await supabase.auth.admin.listUsers()
  .then(users => users.users.find(u => u.email === userInfo.email));

if (existingUser) {
  // Link agent profile to user
  linkedUserId = existingUser.id;
}
```

### 3. Contextual Profile

When agent profile is linked to user:

- Agent profile has `user_id` set to the user's ID
- Dashboard detects the link and loads user's profile data
- Agent can access user's social links, preferences, etc.
- All actions are attributed to the agent profile

## Code Examples

### Sign-In Button

```typescript
// src/app/ai-auth/login/page.tsx
import { AuthAgentButton } from '@/components/auth/AuthAgentButton';

export default function LoginPage() {
  return (
    <AuthAgentButton
      clientId={process.env.NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID!}
      redirectUri={`${process.env.NEXT_PUBLIC_BASE_URL}/ai-auth/callback`}
      authServerUrl={process.env.NEXT_PUBLIC_AUTH_AGENT_SERVER_URL!}
    />
  );
}
```

### Token Exchange

```typescript
// src/app/api/auth-agent/exchange/route.ts
export async function POST(request: NextRequest) {
  const { code, code_verifier } = await request.json();
  
  // Exchange code for tokens
  const tokenResponse = await fetch(`${serverUrl}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      code_verifier,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  
  const tokens = await tokenResponse.json();
  
  // Get user email
  const userInfo = await fetch(`${serverUrl}/userinfo`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  }).then(r => r.json());
  
  // Match user by email and link profile
  // ... (see full implementation in route.ts)
}
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

- `NEXT_PUBLIC_AUTH_AGENT_SERVER_URL`
- `NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID`
- `AUTH_AGENT_CLIENT_ID`
- `AUTH_AGENT_CLIENT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Learn More

- [Auth Agent Documentation](https://docs.auth-agent.com)
- [Website Quickstart Guide](https://docs.auth-agent.com/guides/website-quickstart)
- [Integration Scenarios](https://docs.auth-agent.com/guides/integration-scenarios)
- [API Reference](https://docs.auth-agent.com/api-reference/overview)

## License

MIT
