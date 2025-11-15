/**
 * Tests for URL validation and SSRF protection
 */

import { describe, it, expect } from 'vitest';
import { validateUrl, validateRedirectUri } from '../common/validation';
import { AuthAgentSecurityError, AuthAgentValidationError } from '../common/errors';

describe('validateUrl', () => {
  it('should accept valid HTTPS URLs', () => {
    const url = validateUrl('https://auth.auth-agent.com/authorize');
    expect(url.href).toBe('https://auth.auth-agent.com/authorize');
  });

  it('should accept valid HTTP URLs', () => {
    const url = validateUrl('http://example.com');
    expect(url.href).toBe('http://example.com/');
  });

  it('should reject non-HTTP protocols', () => {
    expect(() => validateUrl('ftp://example.com')).toThrow(AuthAgentSecurityError);
    expect(() => validateUrl('file:///etc/passwd')).toThrow(AuthAgentSecurityError);
  });

  it('should block localhost', () => {
    expect(() => validateUrl('http://localhost:3000')).toThrow(AuthAgentSecurityError);
    expect(() => validateUrl('https://127.0.0.1')).toThrow(AuthAgentSecurityError);
  });

  it('should block private IP ranges', () => {
    expect(() => validateUrl('http://192.168.1.1')).toThrow(AuthAgentSecurityError);
    expect(() => validateUrl('http://10.0.0.1')).toThrow(AuthAgentSecurityError);
    expect(() => validateUrl('http://172.16.0.1')).toThrow(AuthAgentSecurityError);
  });

  it('should respect allowedHosts whitelist', () => {
    const url = validateUrl('https://auth.auth-agent.com', ['auth.auth-agent.com']);
    expect(url.hostname).toBe('auth.auth-agent.com');
    
    expect(() => validateUrl('https://evil.com', ['auth.auth-agent.com'])).toThrow(AuthAgentSecurityError);
  });

  it('should reject invalid URLs', () => {
    expect(() => validateUrl('not-a-url')).toThrow(AuthAgentValidationError);
    expect(() => validateUrl('')).toThrow(AuthAgentValidationError);
  });
});

describe('validateRedirectUri', () => {
  it('should accept valid HTTPS redirect URIs', () => {
    expect(() => validateRedirectUri('https://example.com/callback')).not.toThrow();
  });

  it('should accept HTTP for localhost', () => {
    expect(() => validateRedirectUri('http://localhost:3000/callback')).not.toThrow();
    expect(() => validateRedirectUri('http://127.0.0.1:3000/callback')).not.toThrow();
  });

  it('should reject HTTP in production', () => {
    expect(() => validateRedirectUri('http://example.com/callback')).toThrow(AuthAgentValidationError);
  });

  it('should reject non-HTTP protocols', () => {
    expect(() => validateRedirectUri('ftp://example.com')).toThrow(AuthAgentValidationError);
  });
});

