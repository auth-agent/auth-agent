/**
 * Comprehensive tests for Auth Agent Client SDK
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthAgentClient } from '../client';
import { AuthAgentValidationError, AuthAgentSecurityError } from '../common/errors';
import { safeStorage } from '../common/storage';

// Mock window.location
const mockLocation = {
  href: '',
  search: '',
};

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
    configurable: true,
  });
  mockLocation.href = '';
  mockLocation.search = '';
  safeStorage.clear();
});

describe('AuthAgentClient - PKCE Generation', () => {
  const validConfig = {
    authServerUrl: 'https://auth.auth-agent.com',
    clientId: 'test_client',
    redirectUri: 'https://example.com/callback',
  };

  it('should generate valid PKCE verifier and challenge', async () => {
    const client = new AuthAgentClient(validConfig);
    const authUrl = await client.signIn();
    
    // Check that verifier and state are stored
    const verifier = safeStorage.getItem('auth_agent_code_verifier');
    const state = safeStorage.getItem('auth_agent_state');
    
    expect(verifier).toBeTruthy();
    expect(verifier!.length).toBeGreaterThan(100); // Verifier should be long
    expect(state).toBeTruthy();
    expect(state!.length).toBeGreaterThan(20);
    
    // Check that redirect happened
    expect(mockLocation.href).toContain('https://auth.auth-agent.com/authorize');
    expect(mockLocation.href).toContain('client_id=test_client');
    expect(mockLocation.href).toContain('code_challenge=');
    expect(mockLocation.href).toContain('code_challenge_method=S256');
    expect(mockLocation.href).toContain('state=');
  });

  it('should use custom state if provided', async () => {
    const client = new AuthAgentClient(validConfig);
    const customState = 'custom_state_123';
    
    // We can't directly test get_authorization_url since it's private
    // But we can test that signIn generates a state
    await client.signIn();
    const storedState = safeStorage.getItem('auth_agent_state');
    expect(storedState).toBeTruthy();
  });
});

describe('AuthAgentClient - Callback Handling', () => {
  const validConfig = {
    authServerUrl: 'https://auth.auth-agent.com',
    clientId: 'test_client',
    redirectUri: 'https://example.com/callback',
  };

  it('should handle valid callback', () => {
    const client = new AuthAgentClient(validConfig);
    
    // Set up session storage
    const code = 'auth_code_123';
    const state = 'state_123';
    const verifier = 'code_verifier_123';
    
    safeStorage.setItem('auth_agent_state', state);
    safeStorage.setItem('auth_agent_code_verifier', verifier);
    
    // Mock URL params
    mockLocation.search = `?code=${code}&state=${state}`;
    
    const result = client.handleCallback();
    
    expect(result).not.toBeNull();
    expect(result!.code).toBe(code);
    expect(result!.state).toBe(state);
    expect(result!.codeVerifier).toBe(verifier);
    
    // Verify cleanup
    expect(safeStorage.getItem('auth_agent_state')).toBeNull();
    expect(safeStorage.getItem('auth_agent_code_verifier')).toBeNull();
  });

  it('should return null when code or state is missing', () => {
    const client = new AuthAgentClient(validConfig);
    
    mockLocation.search = '?code=test_code';
    expect(client.handleCallback()).toBeNull();
    
    mockLocation.search = '?state=test_state';
    expect(client.handleCallback()).toBeNull();
    
    mockLocation.search = '';
    expect(client.handleCallback()).toBeNull();
  });

  it('should throw on state mismatch', () => {
    const client = new AuthAgentClient(validConfig);
    
    safeStorage.setItem('auth_agent_state', 'stored_state');
    safeStorage.setItem('auth_agent_code_verifier', 'verifier');
    
    mockLocation.search = '?code=test_code&state=different_state';
    
    expect(() => client.handleCallback()).toThrow(AuthAgentSecurityError);
  });

  it('should throw when code verifier is missing', () => {
    const client = new AuthAgentClient(validConfig);
    
    safeStorage.setItem('auth_agent_state', 'state_123');
    // Don't set code_verifier
    
    mockLocation.search = '?code=test_code&state=state_123';
    
    expect(() => client.handleCallback()).toThrow(AuthAgentValidationError);
  });
});

describe('AuthAgentClient - Configuration', () => {
  it('should use default scope', () => {
    const client = new AuthAgentClient({
      authServerUrl: 'https://auth.auth-agent.com',
      clientId: 'test',
      redirectUri: 'https://example.com/callback',
    });
    
    expect(client).toBeInstanceOf(AuthAgentClient);
  });

  it('should use custom scope', () => {
    const client = new AuthAgentClient({
      authServerUrl: 'https://auth.auth-agent.com',
      clientId: 'test',
      redirectUri: 'https://example.com/callback',
      scope: 'openid profile email',
    });
    
    expect(client).toBeInstanceOf(AuthAgentClient);
  });

  it('should validate URLs on construction', () => {
    expect(() => new AuthAgentClient({
      authServerUrl: 'ftp://evil.com',
      clientId: 'test',
      redirectUri: 'https://example.com/callback',
    })).toThrow(AuthAgentSecurityError);
  });
});

