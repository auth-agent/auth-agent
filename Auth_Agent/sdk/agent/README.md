# Auth Agent SDK for AI Agents

Complete SDK for AI agents to authenticate with Auth Agent OAuth 2.1 server.

## Installation

**Copy the SDK file to your project:**
- `sdk/agent/auth-agent-agent-sdk.ts` - TypeScript SDK for Node.js/browser

**Or install via npm (if published):**
```bash
npm install @auth-agent/agent-sdk
```

---

## Quick Start

### TypeScript/JavaScript (Node.js or Browser)

```typescript
import { AuthAgentAgentSDK } from './auth-agent-agent-sdk';

const sdk = new AuthAgentAgentSDK({
  agentId: 'agent_xxx',
  agentSecret: 'your_secret_here',
  model: 'gpt-4',
});

// Method 1: Complete flow (easiest)
try {
  const authorizationUrl = 'https://api.auth-agent.com/authorize?client_id=...&redirect_uri=...';
  
  const result = await sdk.completeAuthenticationFlow(authorizationUrl, {
    onStatusUpdate: (status) => {
      console.log('Status:', status.status);
    }
  });
  
  console.log('Authorization code:', result.code);
  console.log('Redirect URI:', result.redirect_uri);
  console.log('State:', result.state);
} catch (error) {
  console.error('Authentication failed:', error);
}

// Method 2: Step-by-step (more control)
try {
  // Step 1: Extract request_id from authorization page
  const authorizationUrl = 'https://api.auth-agent.com/authorize?client_id=...';
  const requestId = await sdk.extractRequestId(authorizationUrl);
  console.log('Request ID:', requestId);
  
  // Step 2: Authenticate
  const authResult = await sdk.authenticate(requestId, authorizationUrl);
  if (!authResult.success) {
    throw new Error(authResult.error_description || 'Authentication failed');
  }
  
  // Step 3: Wait for completion
  const status = await sdk.waitForAuthentication(requestId, authorizationUrl, {
    pollInterval: 500,
    timeout: 60000,
    onStatusUpdate: (status) => {
      console.log('Current status:', status.status);
    }
  });
  
  console.log('Authorization code:', status.code);
} catch (error) {
  console.error('Error:', error);
}
```

---

## API Reference

### `AuthAgentAgentSDK`

#### Constructor

```typescript
const sdk = new AuthAgentAgentSDK({
  agentId: string,        // Your agent ID
  agentSecret: string,    // Your agent secret (keep secure!)
  model: string,          // Model identifier (e.g., 'gpt-4', 'claude-3.5-sonnet')
});
```

**Note:** The SDK automatically extracts the auth server URL from the authorization URL, so you don't need to provide it separately.

#### Methods

##### `extractRequestId(authorizationUrlOrHtml: string): Promise<string>`

Extract `request_id` from authorization page HTML or URL.

**Parameters:**
- `authorizationUrlOrHtml` - Full authorization URL or HTML content

**Returns:** `request_id` string

**Throws:** Error if request_id cannot be extracted

**Example:**
```typescript
const requestId = await sdk.extractRequestId('https://auth-server.com/authorize?client_id=...');
// or
const requestId = await sdk.extractRequestId('<html>...window.authRequest = {request_id: "req_123"}...</html>');
```

##### `authenticate(requestId: string, authorizationUrl: string): Promise<AuthenticationResult>`

Authenticate the agent with the Auth Agent server.

**Parameters:**
- `requestId` - Request ID extracted from authorization page
- `authorizationUrl` - Authorization URL (used to extract server URL)

**Returns:**
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
  error_description?: string;
}
```

**Example:**
```typescript
const result = await sdk.authenticate('req_abc123', authorizationUrl);
if (result.success) {
  console.log('Authenticated!');
} else {
  console.error('Failed:', result.error_description);
}
```

##### `checkStatus(requestId: string, authorizationUrl: string): Promise<AuthStatus>`

Check current authentication status.

**Parameters:**
- `requestId` - Request ID to check
- `authorizationUrl` - Authorization URL (used to extract server URL)

**Returns:**
```typescript
{
  status: 'pending' | 'authenticated' | 'completed' | 'error' | 'expired';
  code?: string;              // Authorization code (when authenticated)
  redirect_uri?: string;      // Redirect URI
  state?: string;             // OAuth state parameter
  error?: string;             // Error message (if status is 'error')
}
```

**Example:**
```typescript
const status = await sdk.checkStatus('req_abc123', authorizationUrl);
console.log('Status:', status.status);
if (status.status === 'authenticated') {
  console.log('Code:', status.code);
}
```

##### `waitForAuthentication(requestId: string, authorizationUrl: string, options?): Promise<AuthStatus>`

Poll for authentication completion.

**Parameters:**
- `requestId` - Request ID to poll
- `authorizationUrl` - Authorization URL (used to extract server URL)
- `options` (optional):
  - `pollInterval?: number` - Milliseconds between polls (default: 500)
  - `timeout?: number` - Maximum wait time in ms (default: 60000)
  - `onStatusUpdate?: (status: AuthStatus) => void` - Callback on each status check

**Returns:** Final `AuthStatus` with authorization code

**Throws:** Error on timeout or authentication failure

**Example:**
```typescript
const status = await sdk.waitForAuthentication('req_abc123', authorizationUrl, {
  pollInterval: 500,
  timeout: 60000,
  onStatusUpdate: (status) => {
    console.log('Status update:', status.status);
  }
});

console.log('Final code:', status.code);
```

##### `completeAuthenticationFlow(authorizationUrl: string, options?): Promise<AuthStatus>`

Complete authentication in one call: extract request_id, authenticate, and wait.

**Parameters:**
- `authorizationUrl` - Full authorization URL
- `options` (optional): Same as `waitForAuthentication`

**Returns:** Final `AuthStatus` with authorization code

**Example:**
```typescript
const status = await sdk.completeAuthenticationFlow(
  'https://auth-server.com/authorize?client_id=...&redirect_uri=...',
  {
    timeout: 30000,
    onStatusUpdate: (status) => console.log(status.status)
  }
);

console.log('Authorization code:', status.code);
```

---

## Usage Examples

### Example 1: Simple Authentication

```typescript
import { AuthAgentAgentSDK } from './auth-agent-agent-sdk';

const sdk = new AuthAgentAgentSDK({
  authServerUrl: process.env.AUTH_AGENT_SERVER_URL!,
  agentId: process.env.AGENT_ID!,
  agentSecret: process.env.AGENT_SECRET!,
  model: 'gpt-4',
});

// When user clicks "Sign in with Auth Agent" and redirects to authorization page
const authUrl = 'https://auth-server.com/authorize?client_id=...&redirect_uri=...';

try {
  const result = await sdk.completeAuthenticationFlow(authUrl);
  console.log('✅ Authenticated! Code:', result.code);
  
  // Now exchange code for tokens on your backend
  // (use the website's client SDK for this)
} catch (error) {
  console.error('❌ Authentication failed:', error);
}
```

### Example 2: Manual Control

```typescript
// Extract request_id manually
const requestId = await sdk.extractRequestId(authorizationUrl);
console.log('Request ID:', requestId);

// Authenticate
const authResult = await sdk.authenticate(requestId, authorizationUrl);
if (!authResult.success) {
  throw new Error(authResult.error_description);
}

// Poll until complete (with custom logging)
const status = await sdk.waitForAuthentication(requestId, authorizationUrl, {
  pollInterval: 1000,
  onStatusUpdate: (status) => {
    console.log(`[${new Date().toISOString()}] Status: ${status.status}`);
  }
});

console.log('Final authorization code:', status.code);
```

### Example 3: Error Handling

```typescript
try {
  const status = await sdk.completeAuthenticationFlow(authorizationUrl);
  
  if (status.status === 'authenticated') {
    // Success - use the code
    console.log('Code:', status.code);
  } else if (status.status === 'error') {
    console.error('Error:', status.error);
  }
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Authentication took too long');
  } else if (error.message.includes('Could not extract request_id')) {
    console.error('Invalid authorization page');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Example 4: Browser-Based Agent

```typescript
// In a browser environment (e.g., Chrome extension for AI agents)

// Agent extracts request_id from current page
const currentUrl = window.location.href;
const requestId = await sdk.extractRequestId(currentUrl);

// Authenticate
await sdk.authenticate(requestId, currentUrl);

// Wait for redirect (browser will automatically redirect when authenticated)
```

### Example 5: Node.js Agent Script

```typescript
// For headless agents running in Node.js

import fetch from 'node-fetch';

// Override global fetch if needed (Node.js < 18)
if (typeof global.fetch === 'undefined') {
  global.fetch = fetch as any;
}

const sdk = new AuthAgentAgentSDK({
  authServerUrl: 'https://api.auth-agent.com',
  agentId: 'agent_xxx',
  agentSecret: process.env.AGENT_SECRET!,
  model: 'claude-3.5-sonnet',
});

// Get authorization URL from website
const authUrl = process.argv[2]; // Pass as command line argument

const status = await sdk.completeAuthenticationFlow(authUrl);
console.log('Authorization code:', status.code);
```

---

## How It Works

1. **User initiates OAuth flow** on website → redirects to `/authorize`
2. **Authorization server** shows spinning page with `request_id` exposed in `window.authRequest`
3. **AI Agent** extracts `request_id` from the page
4. **AI Agent** POSTs credentials to `/api/agent/authenticate`
5. **Authorization server** validates credentials and generates authorization code
6. **Spinning page** polls `/api/check-status` and redirects when authenticated
7. **Website** receives authorization code at callback URL
8. **Website** exchanges code for access token (handled by website's SDK)

---

## Error Handling

### Common Errors

| Error | Description | Solution |
|-------|-------------|----------|
| `Could not extract request_id` | Page HTML doesn't contain request_id | Ensure authorization page loaded correctly |
| `invalid_agent` | Agent ID not found | Check agent registration |
| `invalid_credentials` | Agent secret is wrong | Verify secret matches registered value |
| `request_expired` | Request timed out | Request new authorization URL |
| `Authentication timeout` | Polling exceeded max time | Increase timeout or check network |

---

## Security Best Practices

1. **Never expose `agent_secret`** in frontend code or logs
2. **Use environment variables** for sensitive credentials
3. **Validate authorization URLs** before extracting request_id
4. **Implement rate limiting** to prevent abuse
5. **Use HTTPS** for all communication
6. **Rotate secrets** regularly

---

## Environment Variables

```env
# Required
AGENT_ID=agent_xxx
AGENT_SECRET=your_secret_here

# Optional
AGENT_MODEL=gpt-4
```

**Note:** `AUTH_AGENT_SERVER_URL` is no longer needed - the SDK extracts it automatically from the authorization URL.

---

## Next Steps

1. **Register your agent** using the Admin API
2. **Integrate SDK** into your AI agent code
3. **Test authentication** flow end-to-end
4. **Handle tokens** on your backend (use website client SDK)

---

## Troubleshooting

### "Could not extract request_id"
- Ensure you're passing the full authorization URL, not just the base URL
- Check that the authorization page has loaded completely
- Verify the page contains `window.authRequest` in its JavaScript

### "Authentication timeout"
- Check network connectivity
- Verify agent credentials are correct
- Increase `timeout` option in `waitForAuthentication`

### "invalid_agent" or "invalid_credentials"
- Verify agent is registered with Auth Agent
- Check `agent_id` and `agent_secret` match registered values
- Ensure secrets haven't been rotated

---

## Support

For issues or questions:
- Check [Auth Agent Documentation](../README.md)
- Review [OAuth 2.1 Flow Guide](../../INTEGRATION_GUIDE.md)

