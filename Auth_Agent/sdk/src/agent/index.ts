/**
 * Auth Agent SDK - For AI agents
 *
 * SDK for AI agents to authenticate programmatically
 * 
 * Re-exports the real implementation from auth-agent-agent-sdk.ts
 */

export {
  AuthAgentAgentSDK,
  createAuthAgentAgentSDK,
  type AuthAgentAgentConfig,
  type AuthStatus,
  type AuthenticationResult,
} from './auth-agent-agent-sdk';

// Backward compatibility: export as AuthAgentSDK
export { AuthAgentAgentSDK as AuthAgentSDK } from './auth-agent-agent-sdk';
