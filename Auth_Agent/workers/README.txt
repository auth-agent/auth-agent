Auth Agent - Cloudflare Workers Backend
========================================

This is the OAuth 2.1 authorization server implementation for Auth Agent,
built on Cloudflare Workers and Supabase.

## Quick Start

1. Install dependencies:
   bun install

2. Set up environment secrets:
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   wrangler secret put JWT_SECRET

3. Deploy:
   wrangler deploy

## Development

Run locally:
  wrangler dev

Test endpoints:
  curl http://localhost:8787/api/health

## Project Structure

/src
  /lib
    - crypto.ts         # Cryptographic utilities (PBKDF2, PKCE, JWT)
    - db.ts             # Supabase database operations
    - validation.ts     # Input validation helpers
    - constants.ts      # Configuration constants
  /templates
    - spinningPage.ts   # Agent authentication page
    - errorPage.ts      # Error page template
  - index.ts            # Main worker with all HTTP routes

## API Endpoints

OAuth 2.1:
  GET  /authorize                    # Authorization endpoint
  POST /token                        # Token exchange
  POST /introspect                   # Token introspection
  POST /revoke                       # Token revocation

Agent APIs:
  POST /api/agent/authenticate       # Agent back-channel auth
  GET  /api/check-status            # Polling for auth status

Admin APIs:
  POST /api/admin/agents            # Create agent
  GET  /api/admin/agents            # List agents
  POST /api/admin/clients           # Create client
  GET  /api/admin/clients           # List clients
  POST /api/admin/clients/update    # Update client

Discovery:
  GET  /.well-known/oauth-authorization-server  # OAuth metadata
  GET  /.well-known/jwks.json                   # JWK Set

Utility:
  GET  /api/health                  # Health check
  GET  /error                       # Error page

## Environment Variables

Required secrets (set via wrangler secret):
  - SUPABASE_URL: Your Supabase project URL
  - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
  - JWT_SECRET: Secret for signing JWTs

Public vars (in wrangler.toml):
  - JWT_ISSUER: Base URL of your worker

## Database

The worker connects to Supabase PostgreSQL database.
Schema is defined in: ../supabase/schema.sql

Tables:
  - clients: OAuth client applications
  - agents: AI agents
  - auth_requests: Pending authorization requests
  - auth_codes: Authorization codes (PKCE)
  - tokens: Access and refresh tokens

## Security Features

- PKCE (S256) required for all OAuth flows
- PBKDF2 password hashing (100,000 iterations)
- JWT signing with HS256
- HTTPS enforcement (except localhost)
- CORS enabled for cross-origin requests
- Row-level security in Supabase

## Technologies

- Cloudflare Workers (edge runtime)
- Hono (fast web framework)
- Supabase (PostgreSQL database)
- jose (JWT library)
- TypeScript
