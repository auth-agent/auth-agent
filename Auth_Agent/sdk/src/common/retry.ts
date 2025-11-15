/**
 * Retry logic with exponential backoff
 */

import { AuthAgentNetworkError, AuthAgentTimeoutError } from './errors';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatusCodes?: number[];
  timeout?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  timeout: 30000, // 30 seconds
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, retryableStatusCodes: number[]): boolean {
  // Network errors are always retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // Check status codes
  if (error?.status && retryableStatusCodes.includes(error.status)) {
    return true;
  }

  // Timeout errors are retryable
  if (error instanceof AuthAgentTimeoutError) {
    return true;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new AuthAgentTimeoutError(`Request timeout after ${opts.timeout}ms`)), opts.timeout);
      });

      // Race between function and timeout
      return await Promise.race([fn(), timeoutPromise]);
    } catch (error: any) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt >= opts.maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error, opts.retryableStatusCodes)) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      await sleep(Math.min(delay, opts.maxDelay));
      delay *= opts.backoffMultiplier;
    }
  }

  // If we get here, all retries failed
  if (lastError instanceof AuthAgentTimeoutError) {
    throw lastError;
  }
  
  throw new AuthAgentNetworkError(
    `Request failed after ${opts.maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`,
    lastError
  );
}



