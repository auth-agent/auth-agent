# Admin API Quick Reference

**Note:** This is a temporary solution until our self-service console website (`console.auth-agent.com`) is ready. Use these endpoints to create agents and clients for testing.

## Base URL

```
https://api.auth-agent.com
```

Or your deployed Cloudflare Workers URL:
```
https://auth-agent-workers.hetkp8044.workers.dev
```

---

## Create an Agent

**For AI Agent Developers:** Get credentials to authenticate your agents.

### Request

```bash
curl -X POST https://api.auth-agent.com/api/admin/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_your_unique_id",
    "user_email": "you@example.com",
    "user_name": "Your Name"
  }'
```

### Response

```json
{
  "agent_id": "agent_your_unique_id",
  "agent_secret": "ags_abc123...",
  "user_email": "you@example.com",
  "user_name": "Your Name",
  "created_at": "2025-01-07T...",
  "warning": "Save the agent_secret securely. It will not be shown again."
}
```

**⚠️ IMPORTANT:** Save the `agent_secret` immediately! It's only shown once and cannot be retrieved later.

### Use in Your Agent

```python
# .env
AGENT_ID=agent_your_unique_id
AGENT_SECRET=ags_abc123...
AGENT_MODEL=gpt-4

# example.py
from auth_agent_authenticate import AuthAgentTools

tools = AuthAgentTools(
    agent_id=os.getenv('AGENT_ID'),
    agent_secret=os.getenv('AGENT_SECRET'),
    model=os.getenv('AGENT_MODEL')
)
```

---

## Create an OAuth Client

**For Website Developers:** Get credentials to add "Sign in with Auth Agent" to your website.

### Request

```bash
curl -X POST https://api.auth-agent.com/api/admin/clients \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client_your_website_id",
    "client_name": "My Website",
    "redirect_uris": [
      "http://localhost:3000/api/auth/callback",
      "https://yoursite.com/api/auth/callback"
    ]
  }'
```

### Response

```json
{
  "client_id": "client_your_website_id",
  "client_secret": "cs_xyz789...",
  "client_name": "My Website",
  "allowed_redirect_uris": [
    "http://localhost:3000/api/auth/callback",
    "https://yoursite.com/api/auth/callback"
  ],
  "allowed_grant_types": ["authorization_code", "refresh_token"],
  "created_at": "2025-01-07T...",
  "warning": "Save the client_secret securely. It will not be shown again."
}
```

**⚠️ IMPORTANT:** Save the `client_secret` immediately! It's only shown once and cannot be retrieved later.

### Use in Your Website

```bash
# .env.local
NEXT_PUBLIC_CLIENT_ID=client_your_website_id
CLIENT_SECRET=cs_xyz789...
```

```typescript
// Authorization
window.location.href = `https://api.auth-agent.com/authorize?${params}`;

// Token exchange
const response = await fetch('https://api.auth-agent.com/token', {
  method: 'POST',
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: authorizationCode,
    code_verifier: codeVerifier,
    client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  }),
});
```

---

## List All Agents

```bash
curl https://api.auth-agent.com/api/admin/agents
```

### Response

```json
{
  "agents": [
    {
      "agent_id": "agent_your_unique_id",
      "user_email": "you@example.com",
      "user_name": "Your Name",
      "created_at": "2025-01-07T..."
    }
  ]
}
```

**Note:** Secrets are not returned for security reasons.

---

## List All Clients

```bash
curl https://api.auth-agent.com/api/admin/clients
```

### Response

```json
{
  "clients": [
    {
      "client_id": "client_your_website_id",
      "client_name": "My Website",
      "allowed_redirect_uris": ["http://localhost:3000/api/auth/callback"],
      "created_at": "2025-01-07T..."
    }
  ]
}
```

**Note:** Secrets are not returned for security reasons.

---

## Update Client Configuration

```bash
curl -X POST https://api.auth-agent.com/api/admin/clients/update \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client_your_website_id",
    "client_name": "Updated Website Name",
    "redirect_uris": [
      "http://localhost:3000/api/auth/callback",
      "https://yoursite.com/api/auth/callback",
      "https://staging.yoursite.com/api/auth/callback"
    ]
  }'
```

### Response

```json
{
  "success": true,
  "message": "Client updated successfully"
}
```

---

## Security Notes

1. **Keep secrets secure**: Never commit `agent_secret` or `client_secret` to version control
2. **Use environment variables**: Store credentials in `.env` files (gitignored)
3. **HTTPS only**: Redirect URIs must use HTTPS (except `localhost` for development)
4. **One-time display**: Secrets are shown only once at creation time
5. **No retrieval**: Lost secrets cannot be recovered - you'll need to create a new agent/client

---

## Common Errors

### `Missing required fields`
- Ensure you're sending all required fields in the request body
- Check that field names match exactly (case-sensitive)

### `Agent/Client already exists`
- The `agent_id` or `client_id` must be unique
- Choose a different ID or delete the existing one first

### `Invalid redirect URI`
- Redirect URIs must be absolute URLs
- Must use HTTPS in production (HTTP only allowed for `localhost`)

---

## Coming Soon: Self-Service Console

We're building a user-friendly web interface at `console.auth-agent.com` where you can:

- Sign up with Google/GitHub/Email
- Create and manage agents/clients through a dashboard
- View usage statistics and logs
- Regenerate secrets with one click
- Test authentication flows

**Current Status:** Authentication system complete, building dashboards now.

Until then, use these API endpoints to get started!

---

## Examples

### Full Agent Setup Example

```bash
# 1. Create agent
curl -X POST https://api.auth-agent.com/api/admin/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_my_bot",
    "user_email": "dev@example.com",
    "user_name": "Developer"
  }'

# 2. Save credentials to .env
echo "AGENT_ID=agent_my_bot" >> .env
echo "AGENT_SECRET=ags_abc123..." >> .env
echo "AGENT_MODEL=gpt-4" >> .env

# 3. Run your agent
python example.py
```

### Full Website Setup Example

```bash
# 1. Create client
curl -X POST https://api.auth-agent.com/api/admin/clients \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "client_my_app",
    "client_name": "My App",
    "redirect_uris": ["http://localhost:3000/api/auth/callback"]
  }'

# 2. Save credentials to .env.local
echo "NEXT_PUBLIC_CLIENT_ID=client_my_app" >> .env.local
echo "CLIENT_SECRET=cs_xyz789..." >> .env.local

# 3. Add Auth Agent button to your website
# (See README.md for full integration guide)
```

---

## Need Help?

- **Documentation**: See [README.md](./README.md) for full integration guides
- **Examples**: Check `/examples/browser-use-integration/` for agent examples
- **Website Example**: See `/website/` for Profilio integration
- **Issues**: Report bugs at https://github.com/auth-agent/auth-agent/issues
