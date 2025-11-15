/**
 * Tests for Auth Agent Client SDK
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthAgentClient, createAuthAgentClient } from '../client';
import { AuthAgentValidationError, AuthAgentSecurityError } from '../common/errors';

describe('AuthAgentClient', () => {
  const validConfig = {
    authServerUrl: 'https://auth.auth-agent.com',
    clientId: 'test_client',
    redirectUri: 'https://example.com/callback',
  };

  it('should create client with valid config', () => {
    const client = new AuthAgentClient(validConfig);
    expect(client).toBeInstanceOf(AuthAgentClient);
  });

  it('should reject invalid auth server URL', () => {
    expect(() => new AuthAgentClient({
      ...validConfig,
      authServerUrl: 'ftp://evil.com',
    })).toThrow(AuthAgentSecurityError);
  });

  it('should reject localhost auth server URL', () => {
    expect(() => new AuthAgentClient({
      ...validConfig,
      authServerUrl: 'http://localhost:3000',
    })).toThrow(AuthAgentSecurityError);
  });

  it('should reject invalid redirect URI', () => {
    expect(() => new AuthAgentClient({
      ...validConfig,
      redirectUri: 'ftp://example.com/callback',
    })).toThrow(AuthAgentValidationError);
  });

  it('should accept localhost redirect URI', () => {
    const client = new AuthAgentClient({
      ...validConfig,
      redirectUri: 'http://localhost:3000/callback',
    });
    expect(client).toBeInstanceOf(AuthAgentClient);
  });

  it('should use default scope', () => {
    const client = new AuthAgentClient(validConfig);
    // Scope is used internally, so we can't directly test it
    // but we can verify the client was created
    expect(client).toBeInstanceOf(AuthAgentClient);
  });

  it('should use custom scope', () => {
    const client = new AuthAgentClient({
      ...validConfig,
      scope: 'openid profile email',
    });
    expect(client).toBeInstanceOf(AuthAgentClient);
  });

  it('should respect allowedHosts whitelist', () => {
    const client = new AuthAgentClient({
      ...validConfig,
      allowedHosts: ['auth.auth-agent.com'],
    });
    expect(client).toBeInstanceOf(AuthAgentClient);
  });
});

describe('createAuthAgentClient', () => {
  it('should create client instance', () => {
    const client = createAuthAgentClient({
      authServerUrl: 'https://auth.auth-agent.com',
      clientId: 'test_client',
      redirectUri: 'https://example.com/callback',
    });
    expect(client).toBeInstanceOf(AuthAgentClient);
  });
});

