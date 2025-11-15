/**
 * Tests for retry logic with exponential backoff
 * No mocks - testing real behavior
 */

import { describe, it, expect } from 'vitest';
import { retryWithBackoff, RetryOptions } from '../common/retry';
import { AuthAgentTimeoutError, AuthAgentNetworkError } from '../common/errors';

describe('retryWithBackoff', () => {
  it('should succeed on first attempt', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      return 'success';
    };
    
    const result = await retryWithBackoff(fn);
    expect(result).toBe('success');
    expect(callCount).toBe(1);
  });

  it('should retry on network errors', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      if (callCount === 1) {
        throw new TypeError('fetch failed');
      }
      return 'success';
    };
    
    const result = await retryWithBackoff(fn, { maxRetries: 1, initialDelay: 10 });
    expect(result).toBe('success');
    expect(callCount).toBe(2);
  });

  it('should retry on retryable status codes', async () => {
    let callCount = 0;
    const error = { status: 500 };
    const fn = async () => {
      callCount++;
      if (callCount === 1) {
        throw error;
      }
      return 'success';
    };
    
    const result = await retryWithBackoff(fn, { maxRetries: 1, initialDelay: 10 });
    expect(result).toBe('success');
    expect(callCount).toBe(2);
  });

  it('should not retry on non-retryable errors', async () => {
    let callCount = 0;
    const error = { status: 400 };
    const fn = async () => {
      callCount++;
      throw error;
    };
    
    await expect(retryWithBackoff(fn, { maxRetries: 2 })).rejects.toEqual(error);
    expect(callCount).toBe(1);
  });

  it('should respect maxRetries', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      throw new TypeError('fetch failed');
    };
    
    await expect(retryWithBackoff(fn, { maxRetries: 2, initialDelay: 10 })).rejects.toThrow(AuthAgentNetworkError);
    expect(callCount).toBe(3); // initial + 2 retries
  });

  it('should timeout after specified duration', async () => {
    const fn = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return 'success';
    };
    
    // Use a very short timeout
    await expect(retryWithBackoff(fn, { timeout: 50, maxRetries: 0 })).rejects.toThrow(AuthAgentTimeoutError);
  }, 10000);

  it('should retry with delays (exponential backoff)', async () => {
    let callCount = 0;
    const fn = async () => {
      callCount++;
      if (callCount <= 2) {
        throw new TypeError('fetch failed');
      }
      return 'success';
    };
    
    const startTime = Date.now();
    const result = await retryWithBackoff(fn, { 
      maxRetries: 2, 
      initialDelay: 50,
      backoffMultiplier: 2 
    });
    const duration = Date.now() - startTime;
    
    expect(result).toBe('success');
    expect(callCount).toBe(3);
    // Should have taken at least 50ms + 100ms = 150ms (with some tolerance)
    expect(duration).toBeGreaterThan(100);
  });
});

