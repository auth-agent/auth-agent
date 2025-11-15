/**
 * Tests for PKCE generation in client SDK
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthAgentClient } from '../client';
import { safeStorage } from '../common/storage';

describe('AuthAgentClient - PKCE Generation', () => {
  const validConfig = {
    authServerUrl: 'https://auth.auth-agent.com',
    clientId: 'test_client',
    redirectUri: 'https://example.com/callback',
  };

  beforeEach(() => {
    safeStorage.clear();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '', search: '' },
      writable: true,
      configurable: true,
    });
  });

  it('should generate unique verifiers on each call', async () => {
    const client = new AuthAgentClient(validConfig);
    
    await client.signIn();
    const verifier1 = safeStorage.getItem('auth_agent_code_verifier');
    
    safeStorage.clear();
    await client.signIn();
    const verifier2 = safeStorage.getItem('auth_agent_code_verifier');
    
    expect(verifier1).not.toBe(verifier2);
    expect(verifier1).toBeTruthy();
    expect(verifier2).toBeTruthy();
  });

  it('should generate verifier of correct length', async () => {
    const client = new AuthAgentClient(validConfig);
    await client.signIn();
    
    const verifier = safeStorage.getItem('auth_agent_code_verifier');
    expect(verifier).toBeTruthy();
    expect(verifier!.length).toBeGreaterThan(100);
  });

  it('should include code_challenge in authorization URL', async () => {
    const client = new AuthAgentClient(validConfig);
    await client.signIn();
    
    expect(window.location.href).toContain('code_challenge=');
    expect(window.location.href).toContain('code_challenge_method=S256');
  });

  it('should include state in authorization URL', async () => {
    const client = new AuthAgentClient(validConfig);
    await client.signIn();
    
    const state = safeStorage.getItem('auth_agent_state');
    // State is already URL-encoded in the URL by URLSearchParams
    expect(window.location.href).toContain('state=');
    // Verify state is in the URL (may be encoded)
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    expect(urlParams.get('state')).toBe(state);
  });

  it('should include client_id in authorization URL', async () => {
    const client = new AuthAgentClient(validConfig);
    await client.signIn();
    
    expect(window.location.href).toContain('client_id=test_client');
  });

  it('should include redirect_uri in authorization URL', async () => {
    const client = new AuthAgentClient(validConfig);
    await client.signIn();
    
    expect(window.location.href).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
  });

  it('should include scope in authorization URL', async () => {
    const client = new AuthAgentClient(validConfig);
    await client.signIn();
    
    expect(window.location.href).toContain('scope=');
  });
});

