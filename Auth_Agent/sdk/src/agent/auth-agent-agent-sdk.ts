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

export interface AuthAgentAgentConfig {
  /** Agent ID registered with Auth Agent */
  agentId: string;
  /** Agent secret (keep secure!) */
  agentSecret: string;
  /** Model identifier (e.g., 'gpt-4', 'claude-3.5-sonnet') */
  model: string;
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
    this.config = {
      agentId: config.agentId,
      agentSecret: config.agentSecret,
      model: config.model,
    };
  }

  /**
   * Extract base URL from authorization URL
   */
  private extractAuthServerUrl(authorizationUrl: string): string {
    try {
      const url = new URL(authorizationUrl);
      return `${url.protocol}//${url.host}`;
    } catch (error) {
      throw new Error(`Invalid authorization URL: ${authorizationUrl}`);
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
      // Extract and store auth server URL
      this.authServerUrl = this.extractAuthServerUrl(authorizationUrlOrHtml);
      // It's a URL - fetch it
      try {
        const response = await fetch(authorizationUrlOrHtml);
        if (!response.ok) {
          throw new Error(`Failed to fetch authorization page: ${response.status} ${response.statusText}`);
        }
        html = await response.text();
      } catch (error) {
        throw new Error(`Failed to fetch authorization URL: ${error instanceof Error ? error.message : String(error)}`);
      }
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

    throw new Error('Could not extract request_id from authorization page. Make sure the page is loaded correctly.');
  }

  /**
   * Authenticate the agent with Auth Agent server
   * 
   * @param requestId - Request ID extracted from authorization page
   * @param authorizationUrl - Authorization URL (used to extract server URL)
   * @returns Authentication result
   */
  async authenticate(requestId: string, authorizationUrl: string): Promise<AuthenticationResult> {
    const authServerUrl = this.getAuthServerUrl(authorizationUrl);
    const url = `${authServerUrl}/api/agent/authenticate`;

    try {
      const response = await fetch(url, {
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

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'authentication_failed',
          error_description: data.error_description || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        message: data.message || 'Agent authenticated successfully',
      };
    } catch (error) {
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
    const authServerUrl = this.getAuthServerUrl(authorizationUrl);
    const url = `${authServerUrl}/api/check-status?request_id=${encodeURIComponent(requestId)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to check status: ${error instanceof Error ? error.message : String(error)}`);
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
    const {
      pollInterval = 500,
      timeout = 60000,
      onStatusUpdate,
    } = options;

    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          // Check timeout
          if (Date.now() - startTime > timeout) {
            reject(new Error('Authentication timeout - exceeded maximum wait time'));
            return;
          }

          const status = await this.checkStatus(requestId, authorizationUrl);

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
    // Step 1: Extract request_id (also extracts and stores auth server URL)
    const requestId = await this.extractRequestId(authorizationUrl);

    // Step 2: Authenticate
    const authResult = await this.authenticate(requestId, authorizationUrl);

    if (!authResult.success) {
      throw new Error(authResult.error_description || authResult.error || 'Authentication failed');
    }

    // Step 3: Wait for completion
    return await this.waitForAuthentication(requestId, authorizationUrl, options);
  }
}

/**
 * Create a new Auth Agent SDK instance for AI agents
 */
export function createAuthAgentAgentSDK(config: AuthAgentAgentConfig): AuthAgentAgentSDK {
  return new AuthAgentAgentSDK(config);
}

