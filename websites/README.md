# Auth Agent Demo Websites

These three demo websites have been integrated with Auth Agent OAuth 2.1 authentication.

## Websites

1. **v0-crypto-exchange-dashboard** - Crypto trading dashboard
2. **v0-e-commerce-website** - E-commerce store management
3. **v0-github-clone-with-sign-in** - GitHub-style repository dashboard

## Setup

Each website needs environment variables for Auth Agent integration.

**⚠️ Important:** All `.env*` files (including `.env.local`) are gitignored. Copy the `.env.example` file:

```bash
cd v0-github-clone-with-sign-in  # or other website
cp .env.example .env.local
```

### Required Environment Variables

Edit `.env.local` with your actual credentials:

```bash
# Auth Agent Server Configuration
AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site
AUTH_AGENT_CLIENT_ID=your_client_id
AUTH_AGENT_CLIENT_SECRET=your_client_secret

# Public client ID (for client-side SDK)
NEXT_PUBLIC_AUTH_AGENT_SERVER_URL=https://clever-pika-819.convex.site
NEXT_PUBLIC_AUTH_AGENT_CLIENT_ID=your_client_id
```

### Getting Client Credentials

1. Create a client via the Auth Agent admin API:
```bash
curl -X POST https://clever-pika-819.convex.site/api/admin/clients \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Demo Website",
    "redirect_uris": [
      "http://localhost:3000/auth-agent/callback",
      "https://your-domain.com/auth-agent/callback"
    ]
  }'
```

2. Save the returned `client_id` and `client_secret` to your `.env.local` file.

## Running the Websites

Each website is a Next.js application. To run:

```bash
cd v0-crypto-exchange-dashboard  # or other website
npm install  # or pnpm install
npm run dev  # or pnpm dev
```

## Features

- ✅ Auth Agent OAuth 2.1 sign-in button
- ✅ Callback handler for OAuth redirect
- ✅ Token exchange API route
- ✅ Session storage in localStorage (no database required for demo)
- ✅ Protected dashboard routes (redirects to sign-in if not authenticated)

## Testing with Browser-Use

These websites are ready for testing with browser-use agents. The agent should:

1. Navigate to the sign-in page
2. Click the "Sign in with Auth Agent" button
3. Authenticate on the Auth Agent server
4. Complete the OAuth flow
5. Access the protected dashboard

## No Database Required

For demo purposes, these websites don't require a database. Authentication state is stored in:
- `localStorage` - Session tokens and agent info
- Session expires after token expiration (1 hour by default)

In production, you would typically:
- Store sessions in a database
- Use HTTP-only cookies
- Implement refresh token rotation
- Add proper session management

