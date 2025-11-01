import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // AI Agents
  agents: defineTable({
    agent_id: v.string(),
    agent_secret_hash: v.string(),
    user_email: v.string(), // Human owner's email for audit trail
    user_name: v.string(),  // Human owner's name for identification
    agentmail_inbox_id: v.optional(v.string()), // Optional AgentMail inbox for 2FA
    two_factor_enabled: v.optional(v.boolean()), // Optional 2FA flag
    created_at: v.number(),
  }).index("by_agent_id", ["agent_id"]),

  // OAuth Clients (Websites)
  clients: defineTable({
    client_id: v.string(),
    client_secret_hash: v.string(),
    client_name: v.string(),
    allowed_redirect_uris: v.array(v.string()),
    allowed_grant_types: v.array(v.string()),
    created_at: v.number(),
  }).index("by_client_id", ["client_id"]),

  // Authorization Requests (pending auths)
  auth_requests: defineTable({
    request_id: v.string(),
    client_id: v.string(),
    redirect_uri: v.string(),
    state: v.string(),
    code_challenge: v.string(),
    code_challenge_method: v.string(),
    scope: v.string(),
    code: v.optional(v.string()),
    code_used: v.optional(v.boolean()),
    agent_id: v.optional(v.string()),
    model: v.optional(v.string()),
    status: v.string(), // 'pending' | 'authenticated' | 'completed' | 'expired' | 'error'
    error: v.optional(v.string()),
    created_at: v.number(),
    expires_at: v.number(),
  }).index("by_request_id", ["request_id"]),

  // Authorization Codes
  auth_codes: defineTable({
    code: v.string(),
    request_id: v.string(),
    created_at: v.number(),
  }).index("by_code", ["code"]),

  // Tokens
  tokens: defineTable({
    token_id: v.string(),
    access_token: v.string(),
    refresh_token: v.optional(v.string()),
    agent_id: v.string(),
    client_id: v.string(),
    model: v.string(),
    scope: v.string(),
    access_token_expires_at: v.number(),
    refresh_token_expires_at: v.optional(v.number()),
    created_at: v.number(),
    revoked: v.boolean(),
  })
    .index("by_token_id", ["token_id"])
    .index("by_access_token", ["access_token"])
    .index("by_refresh_token", ["refresh_token"]),

  // Refresh Tokens
  refresh_tokens: defineTable({
    refresh_token: v.string(),
    token_id: v.string(),
    agent_id: v.string(),
    client_id: v.string(),
    expires_at: v.number(),
    revoked: v.boolean(),
  }).index("by_refresh_token", ["refresh_token"]),

  // 2FA Verification Codes
  verification_codes: defineTable({
    code: v.string(),
    agent_id: v.string(),
    request_id: v.string(),
    expires_at: v.number(),
    used: v.optional(v.boolean()),
    created_at: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_agent_id", ["agent_id"])
    .index("by_request_id", ["request_id"]),
});
