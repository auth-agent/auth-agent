/**
 * Auth Agent Client SDK
 * Handles OAuth 2.1 flow for websites integrating with Auth Agent
 */

export interface AuthAgentConfig {
  authServerUrl: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
}

export class AuthAgentClient {
  private config: AuthAgentConfig;

  constructor(config: AuthAgentConfig) {
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
    const { verifier, challenge } = await this.generatePKCE();
    const state = this.generateRandomString(32);

    sessionStorage.setItem('auth_agent_code_verifier', verifier);
    sessionStorage.setItem('auth_agent_state', state);

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
    window.location.href = authUrl;
  }

  handleCallback(): { code: string; state: string; codeVerifier: string } | null {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
      return null;
    }

    const storedState = sessionStorage.getItem('auth_agent_state');
    const codeVerifier = sessionStorage.getItem('auth_agent_code_verifier');

    if (state !== storedState) {
      throw new Error('State mismatch - possible CSRF attack');
    }

    if (!codeVerifier) {
      throw new Error('Code verifier not found in session');
    }

    sessionStorage.removeItem('auth_agent_state');
    sessionStorage.removeItem('auth_agent_code_verifier');

    return { code, state, codeVerifier };
  }
}


