/**
 * Two-Factor Authentication (2FA) Operations
 *
 * Handles optional 2FA verification using AgentMail for AI agents.
 */

import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import {
  createAgentMailInbox,
  sendVerificationCode,
  generateVerificationCode,
} from "./lib/agentmail";

const VERIFICATION_CODE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Enable 2FA for an agent by creating an AgentMail inbox
 */
export const enableTwoFactor = action({
  args: {
    agent_id: v.string(),
    agentmail_api_key: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.runQuery(api.oauth.getAgent, {
      agent_id: args.agent_id,
    });

    if (!agent) {
      throw new Error("Agent not found");
    }

    // Check if already enabled
    if (agent.two_factor_enabled) {
      return {
        success: true,
        message: "2FA already enabled for this agent",
        inbox_email: agent.agentmail_inbox_id,
      };
    }

    // Create AgentMail inbox
    const inbox = await createAgentMailInbox(
      args.agent_id,
      args.agentmail_api_key
    );

    if (!inbox) {
      throw new Error("Failed to create AgentMail inbox");
    }

    // Update agent with inbox ID and enable 2FA
    await ctx.runMutation(internal.twoFactor.updateAgentTwoFactor, {
      agent_id: args.agent_id,
      agentmail_inbox_id: inbox.email,
      two_factor_enabled: true,
    });

    return {
      success: true,
      inbox_email: inbox.email,
      message: "2FA enabled successfully",
    };
  },
});

/**
 * Disable 2FA for an agent
 */
export const disableTwoFactor = mutation({
  args: {
    agent_id: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agent_id", (q) => q.eq("agent_id", args.agent_id))
      .unique();

    if (!agent) {
      throw new Error("Agent not found");
    }

    await ctx.db.patch(agent._id, {
      two_factor_enabled: false,
      // Keep agentmail_inbox_id in case they want to re-enable later
    });

    return {
      success: true,
      message: "2FA disabled successfully",
    };
  },
});

/**
 * Internal mutation to update agent 2FA settings
 */
export const updateAgentTwoFactor = mutation({
  args: {
    agent_id: v.string(),
    agentmail_inbox_id: v.string(),
    two_factor_enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agent_id", (q) => q.eq("agent_id", args.agent_id))
      .unique();

    if (!agent) {
      throw new Error("Agent not found");
    }

    await ctx.db.patch(agent._id, {
      agentmail_inbox_id: args.agentmail_inbox_id,
      two_factor_enabled: args.two_factor_enabled,
    });
  },
});

/**
 * Generate and send a 2FA verification code
 */
export const generateAndSendCode = action({
  args: {
    agent_id: v.string(),
    request_id: v.string(),
    agentmail_api_key: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the agent
    const agent = await ctx.runQuery(api.oauth.getAgent, {
      agent_id: args.agent_id,
    });

    if (!agent) {
      throw new Error("Agent not found");
    }

    if (!agent.two_factor_enabled || !agent.agentmail_inbox_id) {
      throw new Error("2FA not enabled for this agent");
    }

    // Generate 6-digit code
    const code = generateVerificationCode();
    const expiresAt = Date.now() + VERIFICATION_CODE_EXPIRY;

    // Store code in database
    await ctx.runMutation(internal.twoFactor.storeVerificationCode, {
      code,
      agent_id: args.agent_id,
      request_id: args.request_id,
      expires_at: expiresAt,
    });

    // Send code via AgentMail
    const result = await sendVerificationCode(
      agent.agentmail_inbox_id,
      code,
      args.agent_id,
      args.agentmail_api_key
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to send verification code");
    }

    return {
      success: true,
      message: "Verification code sent to agent inbox",
      expires_in: VERIFICATION_CODE_EXPIRY / 1000, // seconds
    };
  },
});

/**
 * Internal mutation to store verification code
 */
export const storeVerificationCode = mutation({
  args: {
    code: v.string(),
    agent_id: v.string(),
    request_id: v.string(),
    expires_at: v.number(),
  },
  handler: async (ctx, args) => {
    // Delete any existing unused codes for this request
    const existingCodes = await ctx.db
      .query("verification_codes")
      .withIndex("by_request_id", (q) => q.eq("request_id", args.request_id))
      .collect();

    for (const code of existingCodes) {
      if (!code.used) {
        await ctx.db.delete(code._id);
      }
    }

    // Create new code
    await ctx.db.insert("verification_codes", {
      code: args.code,
      agent_id: args.agent_id,
      request_id: args.request_id,
      expires_at: args.expires_at,
      used: false,
      created_at: Date.now(),
    });
  },
});

/**
 * Verify a 2FA code
 */
export const verifyCode = mutation({
  args: {
    code: v.string(),
    request_id: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up the code
    const storedCode = await ctx.db
      .query("verification_codes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!storedCode) {
      return {
        valid: false,
        error: "Invalid verification code",
      };
    }

    // Check if code matches request
    if (storedCode.request_id !== args.request_id) {
      return {
        valid: false,
        error: "Code does not match this authentication request",
      };
    }

    // Check if already used
    if (storedCode.used) {
      return {
        valid: false,
        error: "Code has already been used",
      };
    }

    // Check if expired
    if (storedCode.expires_at < Date.now()) {
      return {
        valid: false,
        error: "Code has expired",
      };
    }

    // Mark as used
    await ctx.db.patch(storedCode._id, {
      used: true,
    });

    return {
      valid: true,
      agent_id: storedCode.agent_id,
    };
  },
});

/**
 * Check if an agent has 2FA enabled
 */
export const isTwoFactorEnabled = query({
  args: {
    agent_id: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agent_id", (q) => q.eq("agent_id", args.agent_id))
      .unique();

    if (!agent) {
      return {
        enabled: false,
        error: "Agent not found",
      };
    }

    return {
      enabled: agent.two_factor_enabled || false,
      inbox_email: agent.agentmail_inbox_id,
    };
  },
});

/**
 * Clean up expired verification codes (can be called periodically)
 */
export const cleanupExpiredCodes = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredCodes = await ctx.db
      .query("verification_codes")
      .filter((q) => q.lt(q.field("expires_at"), now))
      .collect();

    for (const code of expiredCodes) {
      await ctx.db.delete(code._id);
    }

    return {
      deleted: expiredCodes.length,
    };
  },
});
