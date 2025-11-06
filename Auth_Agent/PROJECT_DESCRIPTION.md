# Auth Agent - Full Project Description

## What It Does

Auth Agent is a production-ready OAuth 2.1 authorization server specifically designed for autonomous AI agents. Unlike traditional OAuth implementations that require human interaction (clicking buttons, entering passwords, approving consent screens), Auth Agent enables AI agents to authenticate themselves programmatically while maintaining enterprise-grade security standards.

**Core Innovation:** We've rebuilt OAuth 2.1 from the ground up to work seamlessly with browser automation frameworks like `browser-use`, Puppeteer, and Selenium. An AI agent can navigate to any website that implements Auth Agent, click "Sign in with Auth Agent," and complete the full OAuth flow autonomously—no human intervention required.

## The Problem

AI agents are being deployed everywhere: GitHub Copilot, ChatGPT browsing mode, autonomous research agents, customer support bots, e-commerce automation. But when these agents need to authenticate with websites, they hit a fundamental wall:

- **Traditional OAuth requires human interaction** - Users must manually enter credentials and approve consent screens
- **No standardized authentication for agents** - Every website builds custom API key systems, leading to fragmentation
- **Security risks** - API keys are insecure (no revocation, no expiration, shared secrets)
- **Vendor lock-in** - Each website requires different integration approaches

The result: millions of AI agents are locked out of authenticated web services, forcing developers to build custom, insecure authentication for every integration.

## How We Built It

### Architecture

We built Auth Agent as a **serverless OAuth 2.1 authorization server** on Convex, achieving zero-config deployment that scales automatically. The system consists of three main components:

1. **Authorization Server (Convex)** - Handles OAuth flows, credential verification, token generation
2. **Client SDK (TypeScript/React)** - One-line integration for websites to add "Sign in with Auth Agent"
3. **Agent SDK (Python/TypeScript)** - Enables AI agents to detect and complete authentication flows

### Technical Implementation

**OAuth 2.1 Compliance:**
- Full RFC 8414 authorization server metadata
- Mandatory PKCE (Proof Key for Code Exchange) with SHA-256
- JWT access tokens (HS256 signing) for stateless validation
- Opaque refresh tokens (database-backed for revocation)
- Token introspection (RFC 7662) and revocation (RFC 7009)
- OAuth discovery endpoint (`/.well-known/openid-configuration`)

**Security Engineering:**
- **PBKDF2 password hashing** for agent/client secrets (never stored in plaintext)
- **HTTPS enforcement** for all redirect URIs (localhost exception for development)
- **Request expiration** (10-minute TTL) to prevent replay attacks
- **Credential verification** before token issuance (agent secrets verified via PBKDF2)
- **PKCE validation** to prevent authorization code interception

**Serverless Infrastructure:**
- **Convex serverless functions** - Deploy in seconds, scale to millions of requests
- **Real-time database** - Sub-second latency globally
- **Node.js runtime isolation** - Crypto operations in dedicated "use node" actions
- **Zero configuration** - No servers to manage, no infrastructure setup

**Browser Automation Integration:**
- **Dynamic URL detection** - Agents extract `request_id` from `window.authRequest` on auth pages
- **CDP (Chrome DevTools Protocol)** support for JavaScript execution
- **Cross-origin CORS handling** for seamless redirects
- **Framework agnostic** - Works with browser-use, Puppeteer, Selenium

**SDK Development:**
- **TypeScript SDK** - Full type safety, IntelliSense, zero-config auto-detection
- **Python SDK** - Native async/await support for agent developers
- **React components** - One-line integration (`<AuthAgentButton />`)
- **Auto-detection** - SDKs automatically detect auth server from authorization URLs

### Workflow

The authentication flow is a sophisticated 18-step orchestration:

1. AI agent navigates to website
2. Agent clicks "Sign in with Auth Agent" button
3. Website generates PKCE challenge (code_verifier, code_challenge)
4. Browser redirects to Auth Agent authorization server
5. Auth server returns a "spinning" authentication page
6. Agent extracts `request_id` from `window.authRequest` (via JavaScript execution)
7. Agent POSTs credentials to `/api/agent/authenticate`
8. Auth server verifies credentials (PBKDF2 hash check)
9. Agent polls `/api/check-status` until authentication completes
10. Browser auto-redirects to callback URL with authorization code
11. Website exchanges code for tokens (validating PKCE code_verifier)
12. Auth server generates JWT access token and refresh token
13. Website stores tokens in localStorage
14. Agent is authenticated and can access protected resources

This entire flow happens autonomously—no human clicks, no passwords, no consent screens.

## Challenges Faced

### 1. OAuth 2.1 Spec Compliance
**Challenge:** OAuth 2.1 has strict requirements—mandatory PKCE, proper token formats, discovery endpoints. We couldn't build a "demo OAuth"—it needed to be production-ready and spec-compliant.

**Solution:** Implemented full RFC compliance: PKCE with SHA-256 validation, JWT token generation with proper claims, token introspection and revocation endpoints, and OAuth discovery metadata. This required deep understanding of OAuth internals and extensive testing.

### 2. Agent Detection Without Hardcoding
**Challenge:** Agents need to detect they're on an auth page and extract the `request_id`, but we couldn't hardcode URLs or rely on static page analysis.

**Solution:** Created a dynamic `window.authRequest` object injected into the auth page HTML, which agents can extract via JavaScript execution. This works with any browser automation framework and adapts to different deployment URLs automatically.

### 3. Serverless Crypto Operations
**Challenge:** Convex functions run in V8 isolates, but crypto operations like PBKDF2 and JWT signing require Node.js APIs.

**Solution:** Used Convex's "use node" actions to run crypto operations in Node.js runtime while keeping the main OAuth logic in serverless functions. This required careful orchestration between actions and HTTP functions.

### 4. PKCE Implementation
**Challenge:** PKCE requires generating code_verifier on the client, hashing it with SHA-256 to create code_challenge, then verifying the original verifier during token exchange. This is cryptographically sensitive.

**Solution:** Implemented strict PKCE validation: SHA-256 hashing for challenges, proper verifier verification during token exchange, and HTTPS enforcement (except localhost) to prevent interception attacks.

### 5. Browser Automation Framework Compatibility
**Challenge:** Different frameworks (browser-use, Puppeteer, Selenium) have different APIs for JavaScript execution and page interaction.

**Solution:** Designed the flow to work with standard browser automation primitives: URL navigation, button clicking, JavaScript evaluation. Our Python SDK abstracts framework differences, making Auth Agent compatible with any browser automation tool.

### 6. Real-World Integration
**Challenge:** Proving the system works requires real websites with real authentication flows.

**Solution:** Integrated Auth Agent into three production-style demo websites (GitHub clone, crypto exchange, e-commerce) deployed on Vercel. Each uses different Next.js patterns, proving the SDK works across diverse implementations.

## Impact & Use Cases

### Immediate Impact
- **Standardizes agent authentication** - One OAuth implementation works across all websites
- **Enables autonomous agents** - AI agents can authenticate without human intervention
- **Enterprise-grade security** - PKCE, token revocation, credential verification (vs. insecure API keys)
- **Developer experience** - One-line SDK integration for websites, simple Python SDK for agents

### Real-World Use Cases

1. **AI Research Agents** - Autonomous agents crawl academic sites requiring login (current: manual credentials, insecure)
2. **Customer Support Bots** - Agents access user dashboards on behalf of customers (current: shared passwords, security risk)
3. **E-commerce Automation** - AI agents place orders, check inventory, manage products (current: API keys per vendor, fragmentation)
4. **Enterprise AI Assistants** - Internal tools require authentication (current: custom integrations per tool)

### Market Opportunity
- **1 billion+ websites** with authentication
- **Millions of AI agents** being built daily
- **$0 standardization** for agent authentication (until now)

## Technical Achievements

- ✅ **Full OAuth 2.1 compliance** - Not a "demo OAuth," production-ready infrastructure
- ✅ **Zero-config deployment** - Deploy to Convex in seconds, no server management
- ✅ **Framework agnostic** - Works with any browser automation tool
- ✅ **Multi-language SDKs** - TypeScript for websites, Python for agents
- ✅ **Enterprise security** - PKCE, JWT signing, token revocation, credential hashing
- ✅ **Real-world validation** - Three integrated demo websites, live deployments

## What Makes It Special

Most OAuth implementations are built for humans. We're the first to rebuild OAuth 2.1 specifically for AI agents—maintaining industry standards while enabling autonomous authentication. The smooth demo experience (agent clicks button, gets authenticated) hides months of technical complexity: OAuth spec compliance, PKCE implementation, serverless architecture, browser automation integration.

**We didn't simplify OAuth—we made it work for AI agents without compromising security or standards.**

