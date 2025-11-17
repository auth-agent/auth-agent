import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createSupabaseClient } from './lib/db';
import * as db from './lib/db';
import * as crypto from './lib/crypto';
import * as validation from './lib/validation';
import { CONFIG } from './lib/constants';
import { spinningPage } from './templates/spinningPage';
import { errorPage } from './templates/errorPage';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  JWT_ISSUER: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('/*', cors());

// Helper to get base URL
function getBaseUrl(c: any): string {
  const url = new URL(c.req.url);
  return c.env.JWT_ISSUER || `${url.protocol}//${url.host}`;
}

// ===================================================
// PUBLIC OAUTH ENDPOINTS
// ===================================================

/**
 * GET /authorize
 * OAuth 2.1 authorization endpoint
 */
app.get('/authorize', async (c) => {
  const client_id = c.req.query('client_id');
  const redirect_uri = c.req.query('redirect_uri');
  const state = c.req.query('state');
  const code_challenge = c.req.query('code_challenge');
  const code_challenge_method = c.req.query('code_challenge_method');
  const scope = c.req.query('scope') || CONFIG.DEFAULT_SCOPE;
  const response_type = c.req.query('response_type');

  // Validate required parameters
  if (!client_id) {
    return c.html(errorPage('invalid_request', 'Missing client_id parameter'), 400);
  }
  if (!redirect_uri) {
    return c.html(errorPage('invalid_request', 'Missing redirect_uri parameter'), 400);
  }
  if (!state) {
    return c.html(errorPage('invalid_request', 'Missing state parameter'), 400);
  }
  if (!code_challenge) {
    return c.html(errorPage('invalid_request', 'Missing code_challenge parameter (PKCE required)'), 400);
  }
  if (!code_challenge_method) {
    return c.html(errorPage('invalid_request', 'Missing code_challenge_method parameter'), 400);
  }
  if (response_type !== 'code') {
    return c.html(errorPage('unsupported_response_type', 'Only "code" response type is supported'), 400);
  }
  if (!validation.isValidClientId(client_id)) {
    return c.html(errorPage('invalid_request', 'Invalid client_id format'), 400);
  }
  if (!validation.isValidRedirectUri(redirect_uri)) {
    return c.html(errorPage('invalid_request', 'Invalid redirect_uri format. HTTPS is required (HTTP allowed only for localhost)'), 400);
  }
  if (!validation.isValidCodeChallengeMethod(code_challenge_method)) {
    return c.html(errorPage('invalid_request', 'Invalid code_challenge_method. Only S256 is supported'), 400);
  }

  // Get client from database
  const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  const client = await db.getClient(supabase, client_id);

  if (!client) {
    return c.html(errorPage('invalid_client', 'Client not found'), 400);
  }

  // Validate redirect_uri
  if (!validation.isAllowedRedirectUri(redirect_uri, client.allowed_redirect_uris)) {
    return c.html(errorPage('invalid_request', 'redirect_uri is not registered for this client'), 400);
  }

  // Create auth request
  const request_id = `req_${await crypto.generateSecureRandom(16)}`;
  await db.createAuthRequest(supabase, {
    request_id,
    client_id,
    redirect_uri,
    state,
    code_challenge,
    code_challenge_method,
    scope,
  });

  // Return spinning page
  const baseUrl = getBaseUrl(c);
  const html = spinningPage(request_id, client.client_name, baseUrl);

  return c.html(html);
});

/**
 * POST /token
 * Token exchange and refresh endpoint
 */
app.post('/token', async (c) => {
  try {
    const body = await c.req.json();
    const { grant_type, code, code_verifier, redirect_uri, client_id, client_secret, refresh_token } = body;

    // Validate grant type
    if (grant_type !== 'authorization_code' && grant_type !== 'refresh_token') {
      return c.json({
        error: 'unsupported_grant_type',
        error_description: 'Only authorization_code and refresh_token grants are supported',
      }, 400);
    }

    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

    // Verify client credentials
    if (!client_id || !client_secret) {
      return c.json({
        error: 'invalid_request',
        error_description: 'Missing client_id or client_secret',
      }, 400);
    }

    const client = await db.getClient(supabase, client_id);
    if (!client) {
      return c.json({
        error: 'invalid_client',
        error_description: 'Client not found',
      }, 401);
    }

    const clientSecretValid = await crypto.verifySecret(client_secret, client.client_secret_hash);
    if (!clientSecretValid) {
      return c.json({
        error: 'invalid_client',
        error_description: 'Invalid client credentials',
      }, 401);
    }

    let agentId: string;
    let clientId: string;
    let model: string;
    let scope: string;

    if (grant_type === 'authorization_code') {
      // Authorization code grant flow
      if (!code || !code_verifier || !redirect_uri) {
        return c.json({
          error: 'invalid_request',
          error_description: 'Missing required parameters: code, code_verifier, redirect_uri',
        }, 400);
      }

      // Validate redirect_uri format
      if (!validation.isValidRedirectUri(redirect_uri)) {
        return c.json({
          error: 'invalid_request',
          error_description: 'Invalid redirect_uri format. HTTPS is required (HTTP allowed only for localhost)',
        }, 400);
      }

      // Get authorization code
      const authCode = await db.getAuthCode(supabase, code);
      if (!authCode) {
        return c.json({
          error: 'invalid_grant',
          error_description: 'Invalid or expired authorization code',
        }, 400);
      }

      // Verify PKCE
      const pkceValid = await crypto.validatePKCE(code_verifier, authCode.code_challenge, 'S256');
      if (!pkceValid) {
        return c.json({
          error: 'invalid_grant',
          error_description: 'Invalid code_verifier',
        }, 400);
      }

      // Verify redirect_uri matches
      if (authCode.redirect_uri !== redirect_uri) {
        return c.json({
          error: 'invalid_grant',
          error_description: 'redirect_uri mismatch',
        }, 400);
      }

      agentId = authCode.agent_id;
      clientId = authCode.client_id;
      model = authCode.model;
      scope = authCode.scope;

      // Mark auth code as used
      await db.markAuthCodeUsed(supabase, code);
    } else {
      // Refresh token grant flow
      if (!refresh_token) {
        return c.json({
          error: 'invalid_request',
          error_description: 'Missing required parameter: refresh_token',
        }, 400);
      }

      // Get token by refresh token
      const tokenRecord = await db.getTokenByRefreshToken(supabase, refresh_token);
      if (!tokenRecord) {
        return c.json({
          error: 'invalid_grant',
          error_description: 'Invalid or expired refresh token',
        }, 400);
      }

      // Verify client_id matches
      if (tokenRecord.client_id !== client_id) {
        return c.json({
          error: 'invalid_grant',
          error_description: 'Refresh token does not belong to this client',
        }, 400);
      }

      agentId = tokenRecord.agent_id;
      clientId = tokenRecord.client_id;
      model = tokenRecord.model;
      scope = tokenRecord.scope;

      // Revoke old tokens (rotation)
      await db.revokeToken(supabase, refresh_token);
    }

    // Generate new tokens
    const tokenId = `tok_${await crypto.generateSecureRandom(16)}`;
    const refreshTokenValue = `rt_${await crypto.generateSecureRandom(32)}`;
    const accessTokenExpiresAt = new Date(Date.now() + CONFIG.ACCESS_TOKEN_TTL * 1000);
    const refreshTokenExpiresAt = new Date(Date.now() + CONFIG.REFRESH_TOKEN_TTL * 1000);

    const accessToken = await crypto.generateJWT({
      agentId,
      clientId,
      model,
      scope,
      expiresIn: CONFIG.ACCESS_TOKEN_TTL,
      issuer: getBaseUrl(c),
      secret: c.env.JWT_SECRET,
    });

    // Store new tokens
    await db.createToken(supabase, {
      token_id: tokenId,
      access_token: accessToken,
      refresh_token: refreshTokenValue,
      agent_id: agentId,
      client_id: clientId,
      model,
      scope,
      access_token_expires_at: accessTokenExpiresAt,
      refresh_token_expires_at: refreshTokenExpiresAt,
    });

    return c.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: CONFIG.ACCESS_TOKEN_TTL,
      refresh_token: refreshTokenValue,
      scope,
    });
  } catch (error: any) {
    console.error('Token exchange error:', error);
    return c.json({
      error: 'server_error',
      error_description: 'Internal server error',
    }, 500);
  }
});

/**
 * POST /introspect
 * Token introspection endpoint
 */
app.post('/introspect', async (c) => {
  try {
    const body = await c.req.json();
    const { token, client_id, client_secret } = body;

    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

    // Validate client credentials if provided
    if (client_id && client_secret) {
      const client = await db.getClient(supabase, client_id);
      if (!client) {
        return c.json({ active: false });
      }

      const clientSecretValid = await crypto.verifySecret(client_secret, client.client_secret_hash);
      if (!clientSecretValid) {
        return c.json({ active: false });
      }
    }

    // Try to find token by access token
    const tokenRecord = await db.getTokenByAccessToken(supabase, token);

    if (!tokenRecord) {
      return c.json({ active: false });
    }

    return c.json({
      active: true,
      sub: tokenRecord.agent_id,
      client_id: tokenRecord.client_id,
      model: tokenRecord.model,
      scope: tokenRecord.scope,
      exp: Math.floor(new Date(tokenRecord.access_token_expires_at).getTime() / 1000),
    });
  } catch (error: any) {
    console.error('Introspection error:', error);
    return c.json({
      error: 'server_error',
      error_description: 'Internal server error',
    }, 500);
  }
});

/**
 * GET /userinfo
 * UserInfo endpoint - returns user information for a valid access token
 * This allows clients to identify which user the agent is acting on behalf of
 */
app.get('/userinfo', async (c) => {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        error: 'invalid_request',
        error_description: 'Missing or invalid Authorization header',
      }, 401);
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

    // Get token record
    const tokenRecord = await db.getTokenByAccessToken(supabase, accessToken);
    if (!tokenRecord) {
      return c.json({
        error: 'invalid_token',
        error_description: 'Invalid or expired access token',
      }, 401);
    }

    // Get agent details to retrieve user information
    const agent = await db.getAgent(supabase, tokenRecord.agent_id);
    if (!agent) {
      return c.json({
        error: 'server_error',
        error_description: 'Agent not found',
      }, 500);
    }

    // Check if the token has the required scope to access email
    const scopes = tokenRecord.scope.split(' ');
    const hasEmailScope = scopes.includes('email') || scopes.includes('openid');

    // Build response based on granted scopes
    const response: any = {
      sub: tokenRecord.agent_id,
    };

    // Only return email if the email scope was granted
    // IMPORTANT: agent.user_email is the SINGLE SOURCE OF TRUTH for this agent's email.
    // - Default: Set to authenticated user's email when agent is created (onboarding email)
    // - Update: If user updates email in console, agent.user_email is updated in database
    // - Website: This exact value (agent.user_email) is what websites receive via /userinfo
    // - Matching: Websites use this email to match the agent to the user's account
    // - Per-Agent: Each agent can have a different email if the user wants
    // Name is optional and only returned if it exists (websites only need email for matching).
    if (hasEmailScope) {
      response.email = agent.user_email;
      // Only include name if it exists (it's optional)
      if (agent.user_name && agent.user_name.trim()) {
        response.name = agent.user_name;
      }
    }

    return c.json(response);
  } catch (error: any) {
    console.error('UserInfo error:', error);
    return c.json({
      error: 'server_error',
      error_description: 'Internal server error',
    }, 500);
  }
});

/**
 * POST /revoke
 * Token revocation endpoint
 */
app.post('/revoke', async (c) => {
  try {
    const body = await c.req.json();
    const { token } = body;

    if (!token) {
      return c.json({}, 200); // Always return 200 per RFC 7009
    }

    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
    await db.revokeToken(supabase, token);

    return c.json({}, 200);
  } catch (error) {
    // Always return 200 per RFC 7009
    return c.json({}, 200);
  }
});

// ===================================================
// AGENT BACK-CHANNEL ENDPOINTS
// ===================================================

/**
 * POST /api/agent/authenticate
 * Agent authentication endpoint
 */
app.post('/api/agent/authenticate', async (c) => {
  try {
    const body = await c.req.json();
    const { request_id, agent_id, agent_secret, model } = body;

    // Validate required fields
    if (!request_id || !agent_id || !agent_secret || !model) {
      return c.json({
        success: false,
        error: 'invalid_request',
        error_description: 'Missing required fields: request_id, agent_id, agent_secret, model',
      }, 400);
    }

    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

    // Get agent from database
    const agent = await db.getAgent(supabase, agent_id);
    if (!agent) {
      return c.json({
        success: false,
        error: 'invalid_agent',
        error_description: 'Agent not found',
      }, 401);
    }

    // Verify agent secret
    const secretValid = await crypto.verifySecret(agent_secret, agent.agent_secret_hash);
    if (!secretValid) {
      return c.json({
        success: false,
        error: 'invalid_credentials',
        error_description: 'Invalid agent credentials',
      }, 401);
    }

    // Get auth request
    const authRequest = await db.getAuthRequest(supabase, request_id);
    if (!authRequest) {
      return c.json({
        success: false,
        error: 'invalid_request',
        error_description: 'Authorization request not found or expired',
      }, 404);
    }

    // Generate authorization code
    const authorizationCode = `ac_${await crypto.generateSecureRandom(32)}`;

    // Create auth code
    await db.createAuthCode(supabase, {
      code: authorizationCode,
      client_id: authRequest.client_id,
      agent_id: agent_id,
      redirect_uri: authRequest.redirect_uri,
      code_challenge: authRequest.code_challenge,
      model,
      scope: authRequest.scope,
    });

    // Update auth request
    await db.authenticateAgentRequest(supabase, request_id, agent_id, authorizationCode);

    return c.json({
      success: true,
      message: 'Agent authenticated successfully',
    });
  } catch (error: any) {
    console.error('Agent authentication error:', error);
    return c.json({
      success: false,
      error: 'server_error',
      error_description: 'Internal server error',
    }, 500);
  }
});

/**
 * GET /api/check-status
 * Check authentication status (polling endpoint)
 */
app.get('/api/check-status', async (c) => {
  const request_id = c.req.query('request_id');

  if (!request_id) {
    return c.json({
      error: 'invalid_request',
      error_description: 'Missing request_id parameter',
    }, 400);
  }

  const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
  const authRequest = await db.getAuthRequest(supabase, request_id);

  if (!authRequest) {
    return c.json({ status: 'error', error: 'Request not found or expired' });
  }

  if (authRequest.authenticated && authRequest.authorization_code) {
    return c.json({
      status: 'authenticated',
      code: authRequest.authorization_code,
      state: authRequest.state,
      redirect_uri: authRequest.redirect_uri,
    });
  }

  return c.json({ status: 'pending' });
});

// ===================================================
// ADMIN ENDPOINTS
// ===================================================

/**
 * POST /api/admin/agents
 * Create a new agent
 * 
 * @deprecated This endpoint is deprecated. Agents should be created through the authenticated console at https://auth-agent.com/console/agent
 * This endpoint may be removed in a future version.
 */
app.post('/api/admin/agents', async (c) => {
  try {
    const body = await c.req.json();
    const { user_email, user_name, agent_id } = body;

    if (!user_email || !agent_id) {
      return c.json({
        error: 'invalid_request',
        error_description: 'Missing required fields: user_email and agent_id',
      }, 400);
    }

    // Generate and hash secret
    const agentSecret = `ags_${await crypto.generateSecureRandom(32)}`;
    const agentSecretHash = await crypto.hashSecret(agentSecret);

    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

    // Create agent
    const agent = await db.createAgent(supabase, agent_id, agentSecretHash, user_email, user_name);

    return c.json({
      agent_id: agent.agent_id,
      agent_secret: agentSecret,
      user_email,
      user_name,
      created_at: agent.created_at,
      warning: 'Save the agent_secret securely. It will not be shown again.',
      deprecation_notice: 'This endpoint is deprecated. Please use the authenticated console at https://auth-agent.com/console/agent to create agents.',
    }, 201);
  } catch (error: any) {
    console.error('Create agent error:', error);
    return c.json({
      error: 'server_error',
      error_description: error.message || 'Internal server error',
    }, 500);
  }
});

/**
 * GET /api/admin/agents
 * List all agents
 */
app.get('/api/admin/agents', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
    const agents = await db.listAgents(supabase);

    // Don't return secret hashes
    const sanitized = agents.map((a) => ({
      agent_id: a.agent_id,
      user_email: a.user_email,
      user_name: a.user_name,
      created_at: a.created_at,
    }));

    return c.json(sanitized);
  } catch (error: any) {
    console.error('List agents error:', error);
    return c.json({
      error: 'server_error',
      error_description: 'Internal server error',
    }, 500);
  }
});

/**
 * POST /api/admin/clients
 * Create a new client
 */
app.post('/api/admin/clients', async (c) => {
  try {
    const body = await c.req.json();
    const { client_name, redirect_uris, client_id } = body;

    if (!client_name || !redirect_uris || !client_id) {
      return c.json({
        error: 'invalid_request',
        error_description: 'Missing required fields',
      }, 400);
    }

    // Generate and hash secret
    const clientSecret = `cs_${await crypto.generateSecureRandom(32)}`;
    const clientSecretHash = await crypto.hashSecret(clientSecret);

    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

    // Create client
    const client = await db.createClient(supabase, client_id, clientSecretHash, client_name, redirect_uris);

    return c.json({
      client_id: client.client_id,
      client_secret: clientSecret,
      client_name,
      allowed_redirect_uris: redirect_uris,
      allowed_grant_types: CONFIG.SUPPORTED_GRANT_TYPES,
      created_at: client.created_at,
      warning: 'Save the client_secret securely. It will not be shown again.',
    }, 201);
  } catch (error: any) {
    console.error('Create client error:', error);
    return c.json({
      error: 'server_error',
      error_description: error.message || 'Internal server error',
    }, 500);
  }
});

/**
 * GET /api/admin/clients
 * List all clients
 */
app.get('/api/admin/clients', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
    const clients = await db.listClients(supabase);

    // Don't return secret hashes
    const sanitized = clients.map((c) => ({
      client_id: c.client_id,
      client_name: c.client_name,
      allowed_redirect_uris: c.allowed_redirect_uris,
      created_at: c.created_at,
    }));

    return c.json(sanitized);
  } catch (error: any) {
    console.error('List clients error:', error);
    return c.json({
      error: 'server_error',
      error_description: 'Internal server error',
    }, 500);
  }
});

/**
 * POST /api/admin/clients/update
 * Update client configuration
 */
app.post('/api/admin/clients/update', async (c) => {
  try {
    const body = await c.req.json();
    const { client_id, client_name, redirect_uris } = body;

    if (!client_id) {
      return c.json({
        error: 'invalid_request',
        error_description: 'Missing client_id parameter',
      }, 400);
    }

    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

    const updates: any = {};
    if (client_name) updates.client_name = client_name;
    if (redirect_uris) updates.allowed_redirect_uris = redirect_uris;

    await db.updateClient(supabase, client_id, updates);

    return c.json({ success: true, message: 'Client updated successfully' });
  } catch (error: any) {
    console.error('Update client error:', error);
    return c.json({
      error: 'server_error',
      error_description: 'Internal server error',
    }, 500);
  }
});

// ===================================================
// DISCOVERY ENDPOINTS
// ===================================================

/**
 * GET /.well-known/oauth-authorization-server
 * OAuth discovery metadata
 */
app.get('/.well-known/oauth-authorization-server', (c) => {
  const baseUrl = getBaseUrl(c);

  const metadata = {
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/authorize`,
    token_endpoint: `${baseUrl}/token`,
    introspection_endpoint: `${baseUrl}/introspect`,
    revocation_endpoint: `${baseUrl}/revoke`,
    userinfo_endpoint: `${baseUrl}/userinfo`,
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    grant_types_supported: CONFIG.SUPPORTED_GRANT_TYPES,
    code_challenge_methods_supported: CONFIG.SUPPORTED_CODE_CHALLENGE_METHODS,
    token_endpoint_auth_methods_supported: ['client_secret_post'],
    introspection_endpoint_auth_methods_supported: ['client_secret_post'],
    revocation_endpoint_auth_methods_supported: ['client_secret_post'],
    scopes_supported: ['openid', 'profile', 'email'],
    service_documentation: 'https://github.com/auth-agent',
  };

  return c.json(metadata);
});

/**
 * GET /.well-known/jwks.json
 * JWK Set (empty for symmetric keys)
 */
app.get('/.well-known/jwks.json', (c) => {
  return c.json({ keys: [] });
});

// ===================================================
// UTILITY ENDPOINTS
// ===================================================

/**
 * GET /api/health
 * Health check
 */
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
  });
});

/**
 * GET /error
 * Error page
 */
app.get('/error', (c) => {
  const message = c.req.query('message') || 'An error occurred';
  return c.html(errorPage('error', message), 400);
});

export default app;
