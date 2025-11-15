/**
 * Custom error types for Auth Agent SDK
 */

export class AuthAgentError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthAgentError';
    Object.setPrototypeOf(this, AuthAgentError.prototype);
  }
}

export class AuthAgentNetworkError extends AuthAgentError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'NETWORK_ERROR');
    this.name = 'AuthAgentNetworkError';
    Object.setPrototypeOf(this, AuthAgentNetworkError.prototype);
  }
}

export class AuthAgentTimeoutError extends AuthAgentError {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT');
    this.name = 'AuthAgentTimeoutError';
    Object.setPrototypeOf(this, AuthAgentTimeoutError.prototype);
  }
}

export class AuthAgentValidationError extends AuthAgentError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'AuthAgentValidationError';
    Object.setPrototypeOf(this, AuthAgentValidationError.prototype);
  }
}

export class AuthAgentSecurityError extends AuthAgentError {
  constructor(message: string) {
    super(message, 'SECURITY_ERROR');
    this.name = 'AuthAgentSecurityError';
    Object.setPrototypeOf(this, AuthAgentSecurityError.prototype);
  }
}



