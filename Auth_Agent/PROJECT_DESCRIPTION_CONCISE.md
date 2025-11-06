# Auth Agent - Full Project Description

## What It Does

Auth Agent gives AI agents their own credentials so they can authenticate with websites without using human passwords. Agents click "Sign in with Auth Agent" and authenticate automatically—no human credentials, no prompt injection risk.

## The Problem

Current web agents use human credentials (username/password) to authenticate. This is dangerous because:
- **Prompt injection attacks** - Malicious websites can steal human credentials
- **Shared passwords** - Agents need to store human passwords, creating security risks
- **No separation** - Human and agent credentials are mixed together

AI agents need their own dedicated authentication system.

## How We Built It

**Custom OAuth Flow for AI Agents:**
- Agents get `agent_id` + `agent_secret` (not human passwords)
- Custom OAuth flow redesigned for autonomous agents
- Built from scratch—entire SDK, backend, and authentication flow

**Tech Stack:**
- **browser-use** - Browser automation tools for agents
- **Convex** - Backend database and serverless functions
- **TypeScript/Python SDKs** - Built from scratch for websites and agents

**How It Works:**
1. Website adds "Sign in with Auth Agent" button (one line of code)
2. Agent navigates to website and clicks button
3. Agent authenticates using `agent_id` + `agent_secret` (no human credentials)
4. Agent gets authenticated automatically—no passwords, no prompt injection risk

## Backend Architecture (Built From Scratch)

**15+ HTTP Endpoints:**
- `/authorize` - OAuth authorization flow with PKCE validation
- `/token` - Token exchange (authorization code → JWT + refresh token)
- `/api/agent/authenticate` - Agent credential verification
- `/api/check-status` - Polling endpoint for authentication status
- `/introspect` - Token validation (RFC 7662)
- `/revoke` - Token revocation (RFC 7009)
- `/.well-known/oauth-authorization-server` - OAuth discovery metadata
- `/api/admin/agents` - Agent management (create, list)
- `/api/admin/clients` - Client management (create, list, update)
- Plus health checks, error handlers, and CORS support

**Database Operations (Convex):**
- `oauth.createAuthRequest` - Store authorization requests with PKCE challenges
- `oauth.getAuthCode` - Retrieve authorization codes
- `oauth.authenticateAgent` - Mark agents as authenticated
- `oauth.checkAuthStatus` - Poll authentication state
- `oauth.handleTokenRequest` - Store JWT and refresh tokens
- `oauth.markAuthCodeUsed` - Prevent code reuse
- `oauth.introspectToken` - Validate token validity
- `oauth.revokeToken` - Invalidate tokens
- `oauth.getAgent` / `oauth.getClient` - Credential lookups
- `admin.createAgent` / `admin.createClient` - Agent/client registration
- `admin.listAgents` / `admin.listClients` - Management endpoints

**Crypto Operations (Node.js Actions):**
- `generateSecureRandomAction` - Cryptographically secure random generation
- `hashSecretAction` - PBKDF2 hashing for agent/client secrets
- `verifySecretAction` - PBKDF2 verification (never store plaintext secrets)
- `validatePKCEAction` - SHA-256 PKCE code_verifier validation
- `generateJWTAction` - JWT token signing (HS256) with claims (agent_id, client_id, model, scope, exp, iat)

**Security & Validation:**
- URL validation (HTTPS enforcement, localhost exceptions)
- Redirect URI validation (prevent open redirects)
- PKCE code_challenge validation (SHA-256, S256 method only)
- Client ID/secret verification (PBKDF2 hash matching)
- Agent ID/secret verification (PBKDF2 hash matching)
- Authorization code expiration (10-minute TTL)
- Token expiration tracking (1 hour access, 30 days refresh)

**Template System:**
- Dynamic HTML generation (spinning auth page with `window.authRequest`)
- Error page rendering with OAuth error codes
- JavaScript injection for agent detection

**Complexity:** This isn't a simple API—it's a complete OAuth 2.1 authorization server with proper security, crypto operations, database state management, and real-time status polling. Built entirely from scratch on Convex serverless infrastructure.



## Challenges Faced

1. **Building OAuth from scratch** - Custom flow for agents (no human interaction)
2. **SDK development** - Entire SDK built from scratch for both websites and agents
3. **Browser automation** - Making it work with browser-use tools
4. **Backend complexity** - 15+ endpoints, crypto operations, database state management, real-time polling

## Impact

- **Eliminates prompt injection risk** - Agents use their own credentials, not human passwords
- **Simplifies authentication** - One button, agents authenticate automatically
- **Secure by design** - Agent credentials separate from human credentials

**Use Cases:** Any AI agent that needs to authenticate with websites—research agents, customer support bots, e-commerce automation, web scraping agents.

**What Makes It Special:** First authentication system built specifically for AI agents. Everything custom-built—the OAuth flow, SDKs, backend—all from scratch to solve the prompt injection problem and give agents their own credentials.

