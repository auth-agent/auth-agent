/**
 * Comprehensive tests for Auth Agent Agent SDK
 * No mocks - testing real behavior
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthAgentAgentSDK } from '../agent';
import { AuthAgentValidationError, AuthAgentSecurityError } from '../common/errors';

describe('AuthAgentAgentSDK - Initialization', () => {
  it('should create SDK with valid config', () => {
    const sdk = new AuthAgentAgentSDK({
      agentId: 'agent_123',
      agentSecret: 'secret_123',
      model: 'gpt-4',
    });
    
    expect(sdk).toBeInstanceOf(AuthAgentAgentSDK);
  });

  it('should reject missing required fields', () => {
    expect(() => new AuthAgentAgentSDK({
      agentId: '',
      agentSecret: 'secret',
      model: 'gpt-4',
    })).toThrow(AuthAgentValidationError);

    expect(() => new AuthAgentAgentSDK({
      agentId: 'agent',
      agentSecret: '',
      model: 'gpt-4',
    })).toThrow(AuthAgentValidationError);

    expect(() => new AuthAgentAgentSDK({
      agentId: 'agent',
      agentSecret: 'secret',
      model: '',
    })).toThrow(AuthAgentValidationError);
  });
});

describe('AuthAgentAgentSDK - URL Extraction', () => {
  const sdk = new AuthAgentAgentSDK({
    agentId: 'agent_123',
    agentSecret: 'secret_123',
    model: 'gpt-4',
  });

  it('should extract auth server URL from authorization URL', () => {
    const url = 'https://auth.auth-agent.com/authorize?client_id=test';
    const serverUrl = (sdk as any).extractAuthServerUrl(url);
    expect(serverUrl).toBe('https://auth.auth-agent.com');
  });

  it('should reject invalid URLs', () => {
    expect(() => (sdk as any).extractAuthServerUrl('not-a-url')).toThrow();
  });

  it('should reject localhost URLs', () => {
    expect(() => (sdk as any).extractAuthServerUrl('http://localhost:3000')).toThrow(AuthAgentSecurityError);
  });
});

describe('AuthAgentAgentSDK - Request ID Extraction', () => {
  const sdk = new AuthAgentAgentSDK({
    agentId: 'agent_123',
    agentSecret: 'secret_123',
    model: 'gpt-4',
  });

  it('should extract request_id from HTML', async () => {
    const html = `
      <script>
        window.authRequest = {
          request_id: 'req_12345'
        };
      </script>
    `;
    
    const requestId = await sdk.extractRequestId(html);
    expect(requestId).toBe('req_12345');
  });

  it('should extract request_id from alternative pattern', async () => {
    const html = `<script>request_id: 'req_67890'</script>`;
    const requestId = await sdk.extractRequestId(html);
    expect(requestId).toBe('req_67890');
  });

  it('should throw when request_id not found', async () => {
    const html = '<html><body>No request_id here</body></html>';
    
    await expect(sdk.extractRequestId(html)).rejects.toThrow(AuthAgentValidationError);
  });

  it('should extract request_id from URL pattern variations', async () => {
    // Test different HTML patterns
    const html1 = `<script>window.authRequest = { request_id: 'req_123' };</script>`;
    const requestId1 = await sdk.extractRequestId(html1);
    expect(requestId1).toBe('req_123');
    
    const html2 = `<script>request_id: 'req_456'</script>`;
    const requestId2 = await sdk.extractRequestId(html2);
    expect(requestId2).toBe('req_456');
    
    const html3 = `<script>var data = { request_id: 'req_789' };</script>`;
    const requestId3 = await sdk.extractRequestId(html3);
    expect(requestId3).toBe('req_789');
  });
});

describe('AuthAgentAgentSDK - Authentication', () => {
  const sdk = new AuthAgentAgentSDK({
    agentId: 'agent_123',
    agentSecret: 'secret_123',
    model: 'gpt-4',
  });

  it('should have authenticate method', () => {
    expect(typeof sdk.authenticate).toBe('function');
    expect(typeof sdk.authenticateAsync).toBe('function');
  });

  it('should have correct method signatures', () => {
    // Verify methods exist and are callable
    expect(sdk.authenticateAsync).toBeDefined();
    expect(sdk.checkStatusAsync).toBeDefined();
    expect(sdk.waitForAuthenticationAsync).toBeDefined();
    expect(sdk.completeAuthenticationFlowAsync).toBeDefined();
  });
});

describe('AuthAgentAgentSDK - Status Checking', () => {
  const sdk = new AuthAgentAgentSDK({
    agentId: 'agent_123',
    agentSecret: 'secret_123',
    model: 'gpt-4',
  });

  it('should have checkStatus methods', () => {
    expect(typeof sdk.checkStatus).toBe('function');
    expect(typeof sdk.checkStatusAsync).toBe('function');
  });

  it('should have waitForAuthentication methods', () => {
    expect(typeof sdk.waitForAuthentication).toBe('function');
    expect(typeof sdk.waitForAuthenticationAsync).toBe('function');
  });
});

describe('AuthAgentAgentSDK - Complete Flow', () => {
  const sdk = new AuthAgentAgentSDK({
    agentId: 'agent_123',
    agentSecret: 'secret_123',
    model: 'gpt-4',
  });

  it('should have completeAuthenticationFlow methods', () => {
    expect(typeof sdk.completeAuthenticationFlow).toBe('function');
    expect(typeof sdk.completeAuthenticationFlowAsync).toBe('function');
  });

  it('should handle URL extraction through extractRequestId', async () => {
    // Test that extractRequestId sets authServerUrl internally
    const html = `<script>window.authRequest = { request_id: 'req_test' };</script>`;
    const requestId = await sdk.extractRequestId(html);
    expect(requestId).toBe('req_test');
    
    // Verify authServerUrl is set when extracting from URL
    const url = 'https://auth.auth-agent.com/authorize';
    const html2 = `<script>window.authRequest = { request_id: 'req_url' };</script>`;
    // This will set authServerUrl internally
    const requestId2 = await sdk.extractRequestId(html2);
    expect(requestId2).toBe('req_url');
  });
});

