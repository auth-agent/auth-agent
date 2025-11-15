/**
 * Auth Agent Client SDK - For websites
 *
 * OAuth 2.1 client implementation with PKCE support
 */

import { validateUrl, validateRedirectUri } from '../common/validation';
import { AuthAgentValidationError, AuthAgentSecurityError } from '../common/errors';
import { safeStorage } from '../common/storage';

export interface AuthAgentConfig {
  authServerUrl: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
  allowedHosts?: string[]; // Whitelist of allowed hosts for SSRF protection
}

export class AuthAgentClient {
  private config: Required<Omit<AuthAgentConfig, 'allowedHosts'>> & Pick<AuthAgentConfig, 'allowedHosts'>;

  constructor(config: AuthAgentConfig) {
    // Validate URLs
    try {
      validateUrl(config.authServerUrl, config.allowedHosts);
      validateRedirectUri(config.redirectUri);
    } catch (error) {
      throw error;
    }

    this.config = {
      scope: 'openid profile',
      ...config,
    };
  }

  private generateRandomString(length: number = 43): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues)
      .map(x => charset[x % charset.length])
      .join('');
  }

  private async sha256(plain: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(hash);
  }

  private base64UrlEncode(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generatePKCE(): Promise<{ verifier: string; challenge: string }> {
    const verifier = this.generateRandomString(128);
    const challenge = await this.sha256(verifier);
    return { verifier, challenge };
  }

  async signIn(): Promise<void> {
    // Validate auth server URL again (in case it changed)
    validateUrl(this.config.authServerUrl, this.config.allowedHosts);

    const { verifier, challenge } = await this.generatePKCE();
    const state = this.generateRandomString(32);

    // Use safe storage with fallback
    safeStorage.setItem('auth_agent_code_verifier', verifier);
    safeStorage.setItem('auth_agent_state', state);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      scope: this.config.scope!,
    });

    const authUrl = `${this.config.authServerUrl}/authorize?${params.toString()}`;
    
    // Validate the final URL before redirecting
    validateUrl(authUrl, this.config.allowedHosts);
    
    window.location.href = authUrl;
  }

  handleCallback(): { code: string; state: string; codeVerifier: string } | null {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
      return null;
    }

    const storedState = safeStorage.getItem('auth_agent_state');
    const codeVerifier = safeStorage.getItem('auth_agent_code_verifier');

    if (state !== storedState) {
      throw new AuthAgentSecurityError(
        'State mismatch - possible CSRF attack. The state parameter does not match the stored value.'
      );
    }

    if (!codeVerifier) {
      throw new AuthAgentValidationError(
        'Code verifier not found in session. The authentication session may have expired or been cleared.'
      );
    }

    safeStorage.removeItem('auth_agent_state');
    safeStorage.removeItem('auth_agent_code_verifier');

    return { code, state, codeVerifier };
  }
}

/**
 * Helper function to create an Auth Agent client instance
 */
export function createAuthAgentClient(config: AuthAgentConfig): AuthAgentClient {
  return new AuthAgentClient(config);
}

// Re-export error types
export {
  AuthAgentError,
  AuthAgentNetworkError,
  AuthAgentTimeoutError,
  AuthAgentValidationError,
  AuthAgentSecurityError,
} from '../common/errors';
