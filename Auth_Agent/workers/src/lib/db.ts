import * as supabaseLib from '@supabase/supabase-js';
import { CONFIG } from './constants';

type SupabaseClient = ReturnType<typeof supabaseLib.createClient>;

// Database types
export interface Agent {
  id: string;
  agent_id: string;
  agent_secret_hash: string;
  user_email: string;
  user_name: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  client_id: string;
  client_secret_hash: string;
  client_name: string;
  allowed_redirect_uris: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthRequest {
  id: string;
  request_id: string;
  client_id: string;
  redirect_uri: string;
  state: string;
  code_challenge: string;
  code_challenge_method: string;
  scope: string;
  agent_id: string | null;
  authenticated: boolean;
  authorization_code: string | null;
  created_at: string;
  expires_at: string;
}

export interface AuthCode {
  id: string;
  code: string;
  client_id: string;
  agent_id: string;
  redirect_uri: string;
  code_challenge: string;
  model: string;
  scope: string;
  used: boolean;
  created_at: string;
  expires_at: string;
}

export interface Token {
  id: string;
  token_id: string;
  access_token: string;
  refresh_token: string;
  agent_id: string;
  client_id: string;
  model: string;
  scope: string;
  revoked: boolean;
  access_token_expires_at: string;
  refresh_token_expires_at: string;
  created_at: string;
}

// Initialize Supabase client
export function createSupabaseClient(supabaseUrl: string, supabaseKey: string) {
  return supabaseLib.createClient(supabaseUrl, supabaseKey);
}

// ==================== AGENT OPERATIONS ====================

export async function getAgent(db: SupabaseClient, agentId: string): Promise<Agent | null> {
  const { data, error } = await db
    .from('agents')
    .select('*')
    .eq('agent_id', agentId)
    .single();

  if (error || !data) return null;
  return data as Agent;
}

export async function createAgent(
  db: SupabaseClient,
  agentId: string,
  agentSecretHash: string,
  userEmail: string,
  userName: string
): Promise<Agent> {
  const { data, error } = await db
    .from('agents')
    .insert({
      agent_id: agentId,
      agent_secret_hash: agentSecretHash,
      user_email: userEmail,
      user_name: userName,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create agent: ${error.message}`);
  return data as Agent;
}

export async function listAgents(db: SupabaseClient): Promise<Agent[]> {
  const { data, error } = await db.from('agents').select('*').order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list agents: ${error.message}`);
  return data as Agent[];
}

// ==================== CLIENT OPERATIONS ====================

export async function getClient(db: SupabaseClient, clientId: string): Promise<Client | null> {
  const { data, error } = await db
    .from('clients')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (error || !data) return null;
  return data as Client;
}

export async function createClient(
  db: SupabaseClient,
  clientId: string,
  clientSecretHash: string,
  clientName: string,
  redirectUris: string[]
): Promise<Client> {
  const { data, error } = await db
    .from('clients')
    .insert({
      client_id: clientId,
      client_secret_hash: clientSecretHash,
      client_name: clientName,
      allowed_redirect_uris: redirectUris,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create client: ${error.message}`);
  return data as Client;
}

export async function updateClient(
  db: SupabaseClient,
  clientId: string,
  updates: {
    client_name?: string;
    allowed_redirect_uris?: string[];
  }
): Promise<Client> {
  const { data, error} = await db
    .from('clients')
    .update(updates)
    .eq('client_id', clientId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update client: ${error.message}`);
  return data as Client;
}

export async function listClients(db: SupabaseClient): Promise<Client[]> {
  const { data, error } = await db.from('clients').select('*').order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list clients: ${error.message}`);
  return data as Client[];
}

// ==================== AUTH REQUEST OPERATIONS ====================

export async function createAuthRequest(
  db: SupabaseClient,
  params: {
    request_id: string;
    client_id: string;
    redirect_uri: string;
    state: string;
    code_challenge: string;
    code_challenge_method: string;
    scope: string;
  }
): Promise<AuthRequest> {
  const expiresAt = new Date(Date.now() + CONFIG.AUTH_REQUEST_TTL * 1000).toISOString();

  const { data, error } = await db
    .from('auth_requests')
    .insert({
      ...params,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create auth request: ${error.message}`);
  return data as AuthRequest;
}

export async function getAuthRequest(db: SupabaseClient, requestId: string): Promise<AuthRequest | null> {
  const { data, error } = await db
    .from('auth_requests')
    .select('*')
    .eq('request_id', requestId)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data as AuthRequest;
}

export async function authenticateAgentRequest(
  db: SupabaseClient,
  requestId: string,
  agentId: string,
  authorizationCode: string
): Promise<AuthRequest> {
  const { data, error } = await db
    .from('auth_requests')
    .update({
      agent_id: agentId,
      authenticated: true,
      authorization_code: authorizationCode,
    })
    .eq('request_id', requestId)
    .select()
    .single();

  if (error) throw new Error(`Failed to authenticate agent request: ${error.message}`);
  return data as AuthRequest;
}

// ==================== AUTH CODE OPERATIONS ====================

export async function createAuthCode(
  db: SupabaseClient,
  params: {
    code: string;
    client_id: string;
    agent_id: string;
    redirect_uri: string;
    code_challenge: string;
    model: string;
    scope: string;
  }
): Promise<AuthCode> {
  const expiresAt = new Date(Date.now() + CONFIG.AUTH_CODE_TTL * 1000).toISOString();

  const { data, error } = await db
    .from('auth_codes')
    .insert({
      ...params,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create auth code: ${error.message}`);
  return data as AuthCode;
}

export async function getAuthCode(db: SupabaseClient, code: string): Promise<AuthCode | null> {
  const { data, error } = await db
    .from('auth_codes')
    .select('*')
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data as AuthCode;
}

export async function markAuthCodeUsed(db: SupabaseClient, code: string): Promise<void> {
  const { error } = await db.from('auth_codes').update({ used: true }).eq('code', code);

  if (error) throw new Error(`Failed to mark auth code as used: ${error.message}`);
}

// ==================== TOKEN OPERATIONS ====================

export async function createToken(
  db: SupabaseClient,
  params: {
    token_id: string;
    access_token: string;
    refresh_token: string;
    agent_id: string;
    client_id: string;
    model: string;
    scope: string;
    access_token_expires_at: Date;
    refresh_token_expires_at: Date;
  }
): Promise<Token> {
  const { data, error } = await db
    .from('tokens')
    .insert({
      ...params,
      access_token_expires_at: params.access_token_expires_at.toISOString(),
      refresh_token_expires_at: params.refresh_token_expires_at.toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create token: ${error.message}`);
  return data as Token;
}

export async function getTokenByAccessToken(db: SupabaseClient, accessToken: string): Promise<Token | null> {
  const { data, error } = await db
    .from('tokens')
    .select('*')
    .eq('access_token', accessToken)
    .eq('revoked', false)
    .gt('access_token_expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data as Token;
}

export async function getTokenByRefreshToken(db: SupabaseClient, refreshToken: string): Promise<Token | null> {
  const { data, error } = await db
    .from('tokens')
    .select('*')
    .eq('refresh_token', refreshToken)
    .eq('revoked', false)
    .gt('refresh_token_expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data as Token;
}

export async function revokeToken(db: SupabaseClient, token: string): Promise<void> {
  // Try revoking by access token or refresh token
  const { error } = await db
    .from('tokens')
    .update({ revoked: true })
    .or(`access_token.eq.${token},refresh_token.eq.${token}`);

  // Silently ignore errors (per RFC 7009 spec)
}
