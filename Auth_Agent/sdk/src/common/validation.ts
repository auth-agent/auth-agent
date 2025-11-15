/**
 * URL validation and SSRF protection utilities
 */

import { AuthAgentValidationError, AuthAgentSecurityError } from './errors';

/**
 * Validate URL format and prevent SSRF attacks
 */
export function validateUrl(url: string, allowedHosts?: string[]): URL {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new AuthAgentSecurityError(
        `Invalid protocol: ${parsed.protocol}. Only http and https are allowed.`
      );
    }

    // Block private/internal IPs and localhost (SSRF protection)
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      throw new AuthAgentSecurityError(
        `SSRF protection: Blocked access to private/internal hostname: ${hostname}`
      );
    }

    // If allowedHosts is provided, check against whitelist
    if (allowedHosts && allowedHosts.length > 0) {
      const isAllowed = allowedHosts.some(allowed => {
        const allowedLower = allowed.toLowerCase();
        return hostname === allowedLower || hostname.endsWith('.' + allowedLower);
      });
      if (!isAllowed) {
        throw new AuthAgentSecurityError(
          `Hostname ${hostname} is not in the allowed hosts list`
        );
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof AuthAgentSecurityError || error instanceof AuthAgentValidationError) {
      throw error;
    }
    throw new AuthAgentValidationError(`Invalid URL format: ${url}`);
  }
}

/**
 * Validate redirect URI format
 */
export function validateRedirectUri(redirectUri: string): void {
  try {
    const parsed = new URL(redirectUri);
    
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new AuthAgentValidationError(
        `Redirect URI must use http or https protocol, got: ${parsed.protocol}`
      );
    }

    // In production, should require https
    if (parsed.protocol === 'http:' && !parsed.hostname.includes('localhost') && !parsed.hostname.includes('127.0.0.1')) {
      throw new AuthAgentValidationError(
        'Redirect URI must use https in production (http only allowed for localhost)'
      );
    }
  } catch (error) {
    if (error instanceof AuthAgentValidationError) {
      throw error;
    }
    throw new AuthAgentValidationError(`Invalid redirect URI format: ${redirectUri}`);
  }
}



