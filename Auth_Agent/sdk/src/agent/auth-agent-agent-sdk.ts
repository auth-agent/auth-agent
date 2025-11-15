/**
 * Auth Agent SDK for AI Agents
 * 
 * This SDK helps AI agents authenticate with Auth Agent OAuth 2.1 server.
 * 
 * Usage:
 * ```typescript
 * import { AuthAgentAgentSDK } from './auth-agent-agent-sdk';
 * 
 * const sdk = new AuthAgentAgentSDK({
 *   agentId: 'agent_xxx',
 *   agentSecret: 'secret_xxx',
 *   model: 'gpt-4'
 * });
 * 
 * // Complete flow - extracts server URL from authorization URL automatically
 * const status = await sdk.completeAuthenticationFlow(authorizationUrl);
 * console.log('Authorization code:', status.code);
 * ```
 */

import { validateUrl } from '../common/validation';
import { retryWithBackoff, RetryOptions } from '../common/retry';
import { AuthAgentNetworkError, AuthAgentValidationError, AuthAgentSecurityError } from '../common/errors';

export interface AuthAgentAgentConfig {
  /** Agent ID registered with Auth Agent */
  agentId: string;
  /** Agent secret (keep secure!) */
  agentSecret: string;
  /** Model identifier (e.g., 'gpt-4', 'claude-3.5-sonnet') */
  model: string;
  /** Allowed hosts for SSRF protection */
  allowedHosts?: string[];
  /** Retry options for network requests */
  retryOptions?: RetryOptions;
}

export interface AuthenticationResult {
  success: boolean;
  message?: string;
  error?: string;
  error_description?: string;
}

export interface AuthStatus {
  status: 'pending' | 'authenticated' | 'completed' | 'error' | 'expired';
  code?: string;
  redirect_uri?: string;
  state?: string;
  error?: string;
}

export class AuthAgentAgentSDK {
  private config: AuthAgentAgentConfig;
  private authServerUrl: string | null = null;

  constructor(config: AuthAgentAgentConfig) {
    if (!config.agentId || !config.agentSecret || !config.model) {
      throw new AuthAgentValidationError('agentId, agentSecret, and model are required');
    }

    this.config = {
      agentId: config.agentId,
      agentSecret: config.agentSecret,
      model: config.model,
      allowedHosts: config.allowedHosts,
      retryOptions: config.retryOptions,
    };
  }

  /**
   * Extract base URL from authorization URL with validation
   */
  private extractAuthServerUrl(authorizationUrl: string): string {
    try {
      const url = validateUrl(authorizationUrl, this.config.allowedHosts);
      return `${url.protocol}//${url.host}`;
    } catch (error) {
      if (error instanceof AuthAgentSecurityError || error instanceof AuthAgentValidationError) {
        throw error;
      }
      throw new AuthAgentValidationError(`Invalid authorization URL: ${authorizationUrl}`);
    }
  }

  /**
   * Get or extract auth server URL
   */
  private getAuthServerUrl(authorizationUrl: string): string {
    if (!this.authServerUrl) {
      this.authServerUrl = this.extractAuthServerUrl(authorizationUrl);
    }
    return this.authServerUrl;
  }

  /**
   * Extract request_id from authorization page HTML
   * 
   * The authorization page exposes request_id in window.authRequest.request_id
   * This method extracts it by parsing the HTML or executing JavaScript
   * Also extracts and stores the auth server URL from the authorization URL
   * 
   * @param authorizationUrlOrHtml - Full authorization URL or HTML content
   * @returns request_id string
   * @throws Error if request_id cannot be extracted
   */
  async extractRequestId(authorizationUrlOrHtml: string): Promise<string> {
    // If it's a URL, extract and store auth server URL, then fetch the HTML
    let html: string;
    
    if (authorizationUrlOrHtml.startsWith('http://') || authorizationUrlOrHtml.startsWith('https://')) {
      // Validate and extract auth server URL
      this.authServerUrl = this.extractAuthServerUrl(authorizationUrlOrHtml);
      
      // Fetch with retry logic
      html = await retryWithBackoff(async () => {
        const response = await fetch(authorizationUrlOrHtml);
        if (!response.ok) {
          throw new AuthAgentNetworkError(
            `Failed to fetch authorization page: ${response.status} ${response.statusText}`,
            new Error(`HTTP ${response.status}`)
          );
        }
        return await response.text();
      }, this.config.retryOptions);
    } else {
      // Assume it's HTML content
      html = authorizationUrlOrHtml;
    }

    // Try to extract from window.authRequest in script tag
    const windowAuthRequestMatch = html.match(/window\.authRequest\s*=\s*\{[^}]*request_id:\s*['"]([^'"]+)['"]/);
    if (windowAuthRequestMatch) {
      return windowAuthRequestMatch[1];
    }

    // Try alternative pattern: request_id: '...'
    const directRequestIdMatch = html.match(/request_id:\s*['"]([^'"]+)['"]/);
    if (directRequestIdMatch) {
      return directRequestIdMatch[1];
    }

    // Try extracting from script tag more flexibly
    const scriptMatch = html.match(/<script[^>]*>[\s\S]*?request_id[^}]*['"]([^'"]+)['"]/);
    if (scriptMatch) {
      return scriptMatch[1];
    }

    throw new AuthAgentValidationError(
      'Could not extract request_id from authorization page. Make sure the page is loaded correctly and contains window.authRequest.request_id.'
    );
  }

  /**
   * Extract request_id from authorization page (async version)
   * Alias for extractRequestId to match Python SDK naming
   * 
   * @param authorizationUrlOrHtml - Full authorization URL or HTML content
   * @returns request_id string
   * @throws Error if request_id cannot be extracted
   */
  async extractRequestIdAsync(authorizationUrlOrHtml: string): Promise<string> {
    return this.extractRequestId(authorizationUrlOrHtml);
  }

  /**
   * Authenticate the agent with Auth Agent server
   * 
   * @param requestId - Request ID extracted from authorization page
   * @param authorizationUrl - Authorization URL (used to extract server URL)
   * @returns Authentication result
   */
  async authenticate(requestId: string, authorizationUrl: string): Promise<AuthenticationResult> {
    // Alias for authenticateAsync to match Python SDK naming
    return this.authenticateAsync(requestId, authorizationUrl);
  }

  /**
   * Authenticate the agent with Auth Agent server (async version)
   * Matches Python SDK's authenticate_async method signature
   * 
   * @param requestId - Request ID extracted from authorization page
   * @param authorizationUrl - Authorization URL (used to extract server URL)
   * @returns Authentication result dictionary with 'success', 'message', 'error', etc.
   */
  async authenticateAsync(requestId: string, authorizationUrl: string): Promise<AuthenticationResult> {
    const authServerUrl = this.getAuthServerUrl(authorizationUrl);
    const url = `${authServerUrl}/api/agent/authenticate`;

    try {
      const response = await retryWithBackoff(async () => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            request_id: requestId,
            agent_id: this.config.agentId,
            agent_secret: this.config.agentSecret,
            model: this.config.model,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new AuthAgentNetworkError(
            `Authentication failed: ${errorData.error_description || errorData.error || `HTTP ${res.status}`}`,
            new Error(`HTTP ${res.status}`)
          );
        }

        return res;
      }, this.config.retryOptions);

      const data = await response.json();

      return {
        success: true,
        message: data.message || 'Agent authenticated successfully',
      };
    } catch (error) {
      if (error instanceof AuthAgentNetworkError) {
        return {
          success: false,
          error: 'network_error',
          error_description: error.message,
        };
      }
      return {
        success: false,
        error: 'network_error',
        error_description: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check authentication status
   * 
   * @param requestId - Request ID to check
   * @param authorizationUrl - Authorization URL (used to extract server URL)
   * @returns Current authentication status
   */
  async checkStatus(requestId: string, authorizationUrl: string): Promise<AuthStatus> {
    // Alias for checkStatusAsync to match Python SDK naming
    return this.checkStatusAsync(requestId, authorizationUrl);
  }

  /**
   * Check authentication status (async version)
   * Matches Python SDK's check_status_async method signature
   * 
   * @param requestId - Request ID to check
   * @param authorizationUrl - Authorization URL (used to extract server URL)
   * @returns Current authentication status
   */
  async checkStatusAsync(requestId: string, authorizationUrl: string): Promise<AuthStatus> {
    const authServerUrl = this.getAuthServerUrl(authorizationUrl);
    const url = `${authServerUrl}/api/check-status?request_id=${encodeURIComponent(requestId)}`;

    try {
      const response = await retryWithBackoff(async () => {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new AuthAgentNetworkError(
            `Status check failed: ${res.status} ${res.statusText}`,
            new Error(`HTTP ${res.status}`)
          );
        }

        return res;
      }, this.config.retryOptions);

      return await response.json();
    } catch (error) {
      if (error instanceof AuthAgentNetworkError) {
        throw error;
      }
      throw new AuthAgentNetworkError(
        `Failed to check status: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Wait for authentication to complete by polling status
   * 
   * @param requestId - Request ID to poll
   * @param authorizationUrl - Authorization URL (used to extract server URL)
   * @param options - Polling options
   * @returns Final authentication status with authorization code
   */
  async waitForAuthentication(
    requestId: string,
    authorizationUrl: string,
    options: {
      pollInterval?: number; // ms between polls (default: 500)
      timeout?: number; // max time to wait in ms (default: 60000)
      onStatusUpdate?: (status: AuthStatus) => void; // callback on each status check
    } = {}
  ): Promise<AuthStatus> {
    // Convert options object to individual parameters for waitForAuthenticationAsync
    return this.waitForAuthenticationAsync(
      requestId,
      authorizationUrl,
      options.pollInterval ?? 500,
      options.timeout ?? 60000,
      options.onStatusUpdate
    );
  }

  /**
   * Wait for authentication to complete by polling status (async version)
   * Matches Python SDK's wait_for_authentication_async method signature
   * 
   * @param requestId - Request ID to poll
   * @param authorizationUrl - Authorization URL (used to extract server URL)
   * @param pollInterval - Milliseconds between polls (default: 500)
   * @param timeout - Maximum wait time in milliseconds (default: 60000)
   * @param onStatusUpdate - Optional callback function called on each status check
   * @returns Final authentication status with authorization code
   */
  async waitForAuthenticationAsync(
    requestId: string,
    authorizationUrl: string,
    pollInterval: number = 500,
    timeout: number = 60000,
    onStatusUpdate?: (status: AuthStatus) => void
  ): Promise<AuthStatus> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          // Check timeout
          if (Date.now() - startTime > timeout) {
            reject(new Error('Authentication timeout - exceeded maximum wait time'));
            return;
          }

          const status = await this.checkStatusAsync(requestId, authorizationUrl);

          // Call status update callback
          if (onStatusUpdate) {
            onStatusUpdate(status);
          }

          // Check if authentication completed
          if (status.status === 'authenticated' || status.status === 'completed') {
            resolve(status);
            return;
          }

          // Check if there was an error
          if (status.status === 'error' || status.status === 'expired') {
            reject(new Error(status.error || 'Authentication failed'));
            return;
          }

          // Still pending, continue polling
          setTimeout(poll, pollInterval);
        } catch (error) {
          reject(error);
        }
      };

      // Start polling
      poll();
    });
  }

  /**
   * Complete authentication flow: extract request_id, authenticate, and wait for completion
   * 
   * This is a convenience method that combines all steps.
   * 
   * @param authorizationUrl - Full authorization URL
   * @param options - Polling options
   * @returns Final authentication status with authorization code
   */
  async completeAuthenticationFlow(
    authorizationUrl: string,
    options: {
      pollInterval?: number;
      timeout?: number;
      onStatusUpdate?: (status: AuthStatus) => void;
    } = {}
  ): Promise<AuthStatus> {
    // Use async methods to match Python SDK pattern
    return this.completeAuthenticationFlowAsync(
      authorizationUrl,
      options.pollInterval ?? 500,
      options.timeout ?? 60000,
      options.onStatusUpdate
    );
  }

  /**
   * Complete authentication flow: extract request_id, authenticate, and wait for completion (async version)
   * Matches Python SDK's complete_authentication_flow_async method signature
   * 
   * @param authorizationUrl - Full authorization URL
   * @param pollInterval - Milliseconds between polls (default: 500)
   * @param timeout - Maximum wait time in milliseconds (default: 60000)
   * @param onStatusUpdate - Optional callback function called on each status check
   * @returns Final authentication status with authorization code
   */
  async completeAuthenticationFlowAsync(
    authorizationUrl: string,
    pollInterval: number = 500,
    timeout: number = 60000,
    onStatusUpdate?: (status: AuthStatus) => void
  ): Promise<AuthStatus> {
    // Step 1: Extract request_id (also extracts and stores auth server URL)
    const requestId = await this.extractRequestIdAsync(authorizationUrl);

    // Step 2: Authenticate
    const authResult = await this.authenticateAsync(requestId, authorizationUrl);

    if (!authResult.success) {
      throw new Error(authResult.error_description || authResult.error || 'Authentication failed');
    }

    // Step 3: Wait for completion
    return await this.waitForAuthenticationAsync(requestId, authorizationUrl, pollInterval, timeout, onStatusUpdate);
  }
}

/**
 * Create a new Auth Agent SDK instance for AI agents
 */
export function createAuthAgentAgentSDK(config: AuthAgentAgentConfig): AuthAgentAgentSDK {
  return new AuthAgentAgentSDK(config);
}

