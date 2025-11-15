/**
 * Tests for custom error types
 */

import { describe, it, expect } from 'vitest';
import {
  AuthAgentError,
  AuthAgentNetworkError,
  AuthAgentTimeoutError,
  AuthAgentValidationError,
  AuthAgentSecurityError,
} from '../common/errors';

describe('AuthAgentError', () => {
  it('should create error with message and code', () => {
    const error = new AuthAgentError('Test error', 'TEST_CODE');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.name).toBe('AuthAgentError');
  });

  it('should create error without code', () => {
    const error = new AuthAgentError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.code).toBeUndefined();
  });
});

describe('AuthAgentNetworkError', () => {
  it('should create network error with original error', () => {
    const originalError = new Error('Original error');
    const error = new AuthAgentNetworkError('Network failed', originalError);
    expect(error.message).toBe('Network failed');
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.originalError).toBe(originalError);
    expect(error.name).toBe('AuthAgentNetworkError');
  });

  it('should create network error without original error', () => {
    const error = new AuthAgentNetworkError('Network failed');
    expect(error.message).toBe('Network failed');
    expect(error.originalError).toBeUndefined();
  });
});

describe('AuthAgentTimeoutError', () => {
  it('should create timeout error with default message', () => {
    const error = new AuthAgentTimeoutError();
    expect(error.message).toBe('Request timeout');
    expect(error.code).toBe('TIMEOUT');
    expect(error.name).toBe('AuthAgentTimeoutError');
  });

  it('should create timeout error with custom message', () => {
    const error = new AuthAgentTimeoutError('Custom timeout');
    expect(error.message).toBe('Custom timeout');
  });
});

describe('AuthAgentValidationError', () => {
  it('should create validation error', () => {
    const error = new AuthAgentValidationError('Invalid input');
    expect(error.message).toBe('Invalid input');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('AuthAgentValidationError');
  });
});

describe('AuthAgentSecurityError', () => {
  it('should create security error', () => {
    const error = new AuthAgentSecurityError('Security violation');
    expect(error.message).toBe('Security violation');
    expect(error.code).toBe('SECURITY_ERROR');
    expect(error.name).toBe('AuthAgentSecurityError');
  });
});



