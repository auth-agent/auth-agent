"""
Custom error types for Auth Agent SDK
"""


class AuthAgentError(Exception):
    """Base exception for all Auth Agent SDK errors."""
    
    def __init__(self, message: str, code: str = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.name = 'AuthAgentError'


class AuthAgentNetworkError(AuthAgentError):
    """Network-related errors (connection failures, timeouts, etc.)."""
    
    def __init__(self, message: str, original_error: Exception = None):
        super().__init__(message, 'NETWORK_ERROR')
        self.name = 'AuthAgentNetworkError'
        self.original_error = original_error


class AuthAgentTimeoutError(AuthAgentError):
    """Request timeout errors."""
    
    def __init__(self, message: str = 'Request timeout'):
        super().__init__(message, 'TIMEOUT')
        self.name = 'AuthAgentTimeoutError'


class AuthAgentValidationError(AuthAgentError):
    """Validation errors (invalid input, missing parameters, etc.)."""
    
    def __init__(self, message: str):
        super().__init__(message, 'VALIDATION_ERROR')
        self.name = 'AuthAgentValidationError'


class AuthAgentSecurityError(AuthAgentError):
    """Security-related errors (SSRF attempts, invalid URLs, etc.)."""
    
    def __init__(self, message: str):
        super().__init__(message, 'SECURITY_ERROR')
        self.name = 'AuthAgentSecurityError'



